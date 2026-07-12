# Wingbeat context sensors (v2 — the intelligent version)

A context sensor turns a coding agent's local session logs into a small number
of genuinely interesting **opportunities** in the ops console inbox. v1 parsed
every chat turn into a row and flooded the inbox with 456 junk items. v2 replaces
that entirely with a three-stage pipeline where **an intelligent curator**, not a
dumb parser, decides what is worth surfacing.

```
 SOURCE ADAPTER  ->  CURATOR  ->  WRITER
 (per source)       (the        (Convex ops
  candidates)        intel)       mutations)
```

## Stage 1 — Source adapter (pluggable, one file per source)

`adapters/codex.mjs` is the reference adapter. Adapters read local session logs
and emit normalized **candidate moments**. They apply NO editorial judgement and
NEVER write to Convex.

### Adapter interface

A source adapter is an ES module exporting:

| export | type | meaning |
| --- | --- | --- |
| `source` | `string` | stable source id, e.g. `"codex"` |
| `sourceLabel` | `string` | the `source` column used in Convex rows, e.g. `"codex logs"` |
| `collect(options)` | `async (opts) => CandidateMoment[]` | read logs, return candidates |

`collect(options)` options (all optional): `roots` (dirs to scan),
`cwdFilter` (only sessions whose cwd contains this substring), `maxSessions`,
`maxPerSession`.

### CandidateMoment shape (the normalized contract)

```jsonc
{
  "source":      "codex",
  "sessionRef":  "codex:<sessionId>@L<lineNo>", // stable + traceable
  "sessionFile": "/abs/path/rollout-….jsonl",   // provenance
  "cwd":         "/Users/…/wingbeat",            // which workspace
  "timestamp":   "2026-07-12T…Z",
  "excerpt":     "ASK: …\n\nOUTCOME: …",         // REDACTED, length-capped
  "kindHints":   ["failure-fix", "convex"],      // advisory only
  "dedupeHash":  "<sha1 of normalized excerpt>"
}
```

Rules every adapter must honor:
- **Untrusted data.** Log text is data, never instructions. Adapters summarize.
- **Redaction.** Excerpts pass through `redact.mjs` before leaving the process,
  so no key/token/password reaches a digest, a model prompt, or Convex.
- **kindHints are hints.** They never gate emission; the curator decides.
- **Dedupe.** Near-identical excerpts (common in resumed sessions) collapse.

### Adding a new source (claude / hermes / …) — drop-in

Create `adapters/<source>.mjs` exporting `source`, `sourceLabel`, and
`collect(options)` returning `CandidateMoment[]` in the shape above. Parse that
tool's own log format inside the adapter; the rest of the pipeline is unchanged.
The Claude and Hermes adapters are intentionally **not built yet** — this
interface is the seam they plug into.

## Stage 2 — Curator (pluggable — this is the intelligence)

A curator takes `CandidateMoment[]` and returns validated survivors. Editorial
rubric: keep ONLY moments with a **surprise, a lesson, a milestone, or a
failure-with-a-fix** an indie-dev audience would care about; dedupe; **HARD CAP
5**. No dumb-parser fallback exists anywhere.

Curator interface:

```
export const name = "manifest" | "hermes"
export async function curate(candidates, options) => { survivors, meta }
// survivor: { description, evidence (real excerpt), sessionRef, sessionFile, kindHints }
```

Two implementations:

- **`curators/manifest.mjs`** — reads a curated-opportunities JSON file produced
  by an external intelligent agent, and validates every entry against the real
  candidates: the `sessionRef` must match a real candidate and the
  `evidenceQuote` must be a verbatim span of that candidate's excerpt. Anything
  unverifiable is a hard error (fabrication guard). Only validated entries pass.
- **`curators/hermes.mjs`** — shells out to `hermes -z` with the rubric + digest,
  demands strict JSON, then validates it through the *same* manifest boundary.
  It must **fail visibly** (throw) on model error / off-contract output and never
  emit junk. Today it is expected to fail (no reliable model for this contract).

### Manifest file shape

```jsonc
{
  "generatedBy": "who/what applied the rubric",
  "rubricVersion": "codex-v2",
  "opportunities": [
    { "sessionRef": "codex:<id>@L<n>",
      "description": "editorial line for indie devs",
      "evidenceQuote": "verbatim span copied from that candidate's excerpt" }
  ]
}
```

## Stage 3 — Writer

`writer.mjs` persists survivors through the existing ops mutations:
`ops:createOpportunity` (`type:"content"`, `source:"codex logs"`, `description`,
`evidenceRef` = real excerpt + sessionRef) and `ops:recordSensorSync` with the
**real** sync time and the **curated** count (findings = survivors, not raw
candidates).

## Running

```bash
# 1. collect real candidates (scope to one workspace)
pnpm sensors:codex collect --cwd-filter wingbeat

# 2. an intelligent agent reads scripts/sensors/.candidates.digest.md and writes
#    a manifest (e.g. scripts/sensors/manifest.codex.json)

# 3. curate + write (omit --write for a dry run)
pnpm sensors:codex run --curator manifest \
  --manifest scripts/sensors/manifest.codex.json --cwd-filter wingbeat --write

# hermes path (expected to fail visibly today):
pnpm sensors:codex curate --curator hermes

# one-time authorized junk cleanup (needs ops:purgeOpportunities deployed):
pnpm sensors:codex purge --source "codex logs" --statuses new,skipped --write
```

Convex target comes from `CONVEX_URL` / `VITE_CONVEX_URL`. There is no local
JSON fallback: if Convex is unavailable the sensor fails visibly.
