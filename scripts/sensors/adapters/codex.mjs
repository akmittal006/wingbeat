// SOURCE ADAPTER: Codex desktop/CLI session logs.
//
// Implements the Source Adapter interface (see scripts/sensors/README.md).
// Its ONLY job is to read a coding agent's local session logs and emit
// normalized "candidate moments". It performs NO editorial judgement and NEVER
// writes to Convex — that is the curator's and writer's job respectively.
//
// Real Codex log format (verified against ~/.codex/sessions and
// ~/.codex/archived_sessions on 2026-07-12, Codex Desktop cli_version 0.142.x):
//
//   - Files: rollout-<ISO-ish-timestamp>-<uuid>.jsonl under
//     ~/.codex/sessions/YYYY/MM/DD/ and ~/.codex/archived_sessions/.
//   - JSON Lines. Each line: { timestamp, type, payload }.
//   - type "session_meta"  -> payload { session_id, cwd, originator,
//       cli_version, timestamp, instructions }. A single rollout file can
//       contain MANY session_meta records (resumed / multi-thread sessions),
//       so cwd and session_id are tracked as they change while streaming.
//   - type "event_msg" with payload.type:
//       * "user_message"  -> payload.message  (the clean human turn)
//       * "agent_message" -> payload.message  (the model's reply)
//       * others (token_count, task_started, reasoning, tool calls...) ignored.
//   - type "response_item" duplicates the transcript as role-tagged messages;
//     we prefer the event_msg stream because it is already de-noised.
//
// A "candidate moment" pairs a human ask with the agent's immediate response so
// the curator can see intent + outcome together.

import { createReadStream } from "node:fs"
import { readdir, stat } from "node:fs/promises"
import { createInterface } from "node:readline"
import { homedir } from "node:os"
import path from "node:path"
import crypto from "node:crypto"
import { redact } from "../redact.mjs"

export const source = "codex"
export const sourceLabel = "codex logs" // matches the sensors/opportunities `source` column

const DEFAULT_ROOTS = [
  path.join(homedir(), ".codex", "sessions"),
  path.join(homedir(), ".codex", "archived_sessions"),
]

// Human turns that are actually injected system/tooling context, not a real ask.
const INJECTED_PREFIXES = [
  "<user_instructions>",
  "<environment_context>",
  "<recommended_plugins>",
  "<permissions",
  "# AGENTS.md",
  "<INSTRUCTIONS>",
  "AGENTS.md instructions",
]
// TUI popup / status noise that leaks into some message streams.
const NOISE_MARKERS = [/^pop-up button/i, /^text L\d+:/i, /^Usage: context/i]

const MIN_ASK_CHARS = 40
const MAX_EXCERPT_CHARS = 900

function looksInjected(text) {
  const t = text.trimStart()
  if (INJECTED_PREFIXES.some((p) => t.startsWith(p))) return true
  if (NOISE_MARKERS.some((re) => re.test(t))) return true
  return false
}

// Advisory heuristic tags. These are HINTS ONLY — the curator decides what is
// actually worth publishing. They never gate emission.
const KIND_RULES = [
  { kind: "failure-fix", re: /\b(fail(ed|ure|ing)?|error|broke|broken|crash|429|rate.?limit|quota|usage limit|timeout|regress|bug|does ?n['’]?t work|not working)\b/i },
  { kind: "milestone", re: /\b(ship(ped)?|deploy(ed)?|works now|passing|green|done|landed|merged|working end.?to.?end|first (draft|post|run))\b/i },
  { kind: "lesson", re: /\b(turns out|realized|learned|the trick|gotcha|instead of|had to|because|root cause|the fix (was|is))\b/i },
  { kind: "surprise", re: /\b(surprising(ly)?|unexpected(ly)?|weird|strange|huh|didn['’]?t expect|to my surprise|actually)\b/i },
  { kind: "convex", re: /\bconvex\b/i },
  { kind: "veto", re: /\bveto\b/i },
  { kind: "hermes", re: /\bhermes\b/i },
]

function kindHints(text) {
  const hints = []
  for (const r of KIND_RULES) if (r.re.test(text)) hints.push(r.kind)
  return hints
}

function clip(text, max = MAX_EXCERPT_CHARS) {
  const collapsed = text.replace(/[ \t]+\n/g, "\n").trim()
  if (collapsed.length <= max) return collapsed
  return collapsed.slice(0, max).trimEnd() + " …[truncated]"
}

async function listSessionFiles(roots) {
  const files = []
  async function walk(dir) {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) await walk(full)
      else if (e.isFile() && e.name.endsWith(".jsonl") && e.name.startsWith("rollout-")) files.push(full)
    }
  }
  for (const root of roots) await walk(root)
  // newest first
  const withTimes = await Promise.all(
    files.map(async (f) => ({ f, mtime: (await stat(f)).mtimeMs })),
  )
  withTimes.sort((a, b) => b.mtime - a.mtime)
  return withTimes.map((x) => x.f)
}

function safeParse(line) {
  try {
    return JSON.parse(line)
  } catch {
    return null
  }
}

/**
 * Stream one rollout file and emit candidate moments (human ask + next reply).
 * @param {string} file absolute path
 * @param {{ cwdFilter: string|null, maxPerSession: number }} opts
 * @param {(c: object) => void} emit
 */
async function collectFromFile(file, opts, emit) {
  const rl = createInterface({ input: createReadStream(file, { encoding: "utf8" }), crlfDelay: Infinity })
  let lineNo = 0
  let sessionId = null
  let cwd = null
  let fileMatchesFilter = opts.cwdFilter ? false : true
  let pendingAsk = null // { text, line, ts }
  let emittedForSession = 0

  for await (const raw of rl) {
    lineNo += 1
    if (!raw) continue
    const rec = safeParse(raw)
    if (!rec) continue

    if (rec.type === "session_meta") {
      sessionId = rec.payload?.session_id ?? sessionId
      cwd = rec.payload?.cwd ?? cwd
      if (opts.cwdFilter && cwd && cwd.includes(opts.cwdFilter)) fileMatchesFilter = true
      emittedForSession = 0
      pendingAsk = null
      continue
    }
    if (rec.type !== "event_msg") continue
    const p = rec.payload
    if (!p) continue

    if (p.type === "user_message") {
      const msg = typeof p.message === "string" ? p.message : ""
      if (!msg || looksInjected(msg) || msg.trim().length < MIN_ASK_CHARS) {
        pendingAsk = null
        continue
      }
      pendingAsk = { text: msg, line: lineNo, ts: rec.timestamp ?? null }
      continue
    }

    if (p.type === "agent_message" && pendingAsk) {
      if (!fileMatchesFilter) {
        pendingAsk = null
        continue
      }
      if (opts.maxPerSession && emittedForSession >= opts.maxPerSession) {
        pendingAsk = null
        continue
      }
      const reply = typeof p.message === "string" ? p.message : ""
      const ask = redact(clip(pendingAsk.text, 400))
      const outcome = redact(clip(reply, MAX_EXCERPT_CHARS - ask.length - 20))
      const excerpt = `ASK: ${ask}\n\nOUTCOME: ${outcome}`.trim()
      const combined = `${pendingAsk.text}\n${reply}`
      emit({
        source,
        sessionRef: `codex:${sessionId ?? "unknown"}@L${pendingAsk.line}`,
        sessionFile: file,
        cwd: cwd ?? "unknown",
        timestamp: pendingAsk.ts ?? rec.timestamp ?? null,
        excerpt,
        kindHints: kindHints(combined),
      })
      emittedForSession += 1
      pendingAsk = null
    }
  }
}

/**
 * Collect normalized candidate moments from Codex session logs.
 *
 * @param {object} [options]
 * @param {string[]} [options.roots] directories to scan (default: ~/.codex/{sessions,archived_sessions})
 * @param {string|null} [options.cwdFilter] only include sessions whose cwd contains this substring
 * @param {number} [options.maxSessions] cap number of files scanned (newest first)
 * @param {number} [options.maxPerSession] cap candidates emitted per session_meta block
 * @returns {Promise<object[]>} candidate moments (deduped by normalized excerpt)
 */
export async function collect(options = {}) {
  const roots = options.roots ?? DEFAULT_ROOTS
  const cwdFilter = options.cwdFilter ?? null
  const maxSessions = options.maxSessions ?? Infinity
  const maxPerSession = options.maxPerSession ?? 12

  const files = await listSessionFiles(roots)
  const scan = Number.isFinite(maxSessions) ? files.slice(0, maxSessions) : files

  const seen = new Set()
  const candidates = []
  const emit = (c) => {
    const norm = c.excerpt.replace(/\s+/g, " ").trim().toLowerCase()
    const hash = crypto.createHash("sha1").update(norm).digest("hex")
    if (seen.has(hash)) return // dedupe near-identical stories across resumed sessions
    seen.add(hash)
    c.dedupeHash = hash
    candidates.push(c)
  }

  for (const file of scan) {
    await collectFromFile(file, { cwdFilter, maxPerSession }, emit)
  }
  return candidates
}
