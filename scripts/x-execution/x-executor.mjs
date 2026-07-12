#!/usr/bin/env node
import crypto from "node:crypto"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import process from "node:process"

const STATUSES = new Set(["queue", "veto", "ready", "published", "blocked"])
const ROOT = path.resolve(new URL(".", import.meta.url).pathname)
const DEFAULT_STATE_DIR = path.join(ROOT, "jobs")

function stateDir() {
  return path.resolve(process.env.WB_X_EXECUTION_DIR || DEFAULT_STATE_DIR)
}

function usage() {
  return `Wingbeat X execution boundary

Usage:
  node scripts/x-execution/x-executor.mjs prepare --run-id RUN --copy "text" [--asset PATH] [--veto-seconds 60]
  node scripts/x-execution/x-executor.mjs show --job-id JOB
  node scripts/x-execution/x-executor.mjs list
  node scripts/x-execution/x-executor.mjs block --job-id JOB --reason "reason"
  node scripts/x-execution/x-executor.mjs advance --job-id JOB
  node scripts/x-execution/x-executor.mjs export-browser-task --job-id JOB --confirm-action-time "PUBLISH JOB"
  node scripts/x-execution/x-executor.mjs update-receipt --job-id JOB --post-url URL [--post-id ID]
  node scripts/x-execution/x-executor.mjs self-test

Safety:
  This CLI never authenticates to X, never reads browser profiles, and never stores cookies.
  The only browser-facing output is a JSON task containing post text, optional local asset path,
  and manual/automation instructions for an already signed-in browser session.`
}

function parseArgs(argv) {
  const [command, ...rest] = argv
  const args = { _: [] }
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (!token.startsWith("--")) {
      args._.push(token)
      continue
    }
    const key = token.slice(2)
    const next = rest[index + 1]
    if (!next || next.startsWith("--")) {
      args[key] = true
      continue
    }
    args[key] = next
    index += 1
  }
  return { command, args }
}

function now() {
  return new Date().toISOString()
}

function ensureStateDir() {
  fs.mkdirSync(stateDir(), { recursive: true })
}

function jobPath(jobId) {
  if (!/^[A-Za-z0-9._-]+$/.test(jobId)) {
    throw new Error(`Invalid job id "${jobId}". Use letters, numbers, dot, underscore, or dash.`)
  }
  return path.join(stateDir(), `${jobId}.json`)
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function writeJsonAtomic(filePath, value) {
  ensureStateDir()
  const tmp = `${filePath}.${process.pid}.tmp`
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(tmp, filePath)
}

function loadJob(jobId) {
  const filePath = jobPath(jobId)
  if (!fs.existsSync(filePath)) {
    throw new Error(`No X execution job found for ${jobId}`)
  }
  return readJson(filePath)
}

function saveJob(job) {
  if (!STATUSES.has(job.status)) {
    throw new Error(`Refusing to save unknown status "${job.status}"`)
  }
  job.updatedAt = now()
  writeJsonAtomic(jobPath(job.id), job)
  return job
}

function changeStatus(job, status, detail) {
  if (!STATUSES.has(status)) {
    throw new Error(`Unknown status "${status}"`)
  }
  job.status = status
  job.statusHistory.push({ status, at: now(), detail })
  return job
}

function requireArg(args, key) {
  const value = args[key]
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required --${key}`)
  }
  return value
}

function readCopy(args) {
  if (args.copy && args["copy-file"]) {
    throw new Error("Use either --copy or --copy-file, not both")
  }
  if (typeof args.copy === "string") {
    return args.copy
  }
  if (typeof args["copy-file"] === "string") {
    return fs.readFileSync(path.resolve(args["copy-file"]), "utf8").trim()
  }
  throw new Error("Missing --copy or --copy-file")
}

function safeNumber(value, fallback) {
  if (value === undefined || value === true) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid numeric value "${value}"`)
  }
  return parsed
}

function hashFile(filePath) {
  const hash = crypto.createHash("sha256")
  hash.update(fs.readFileSync(filePath))
  return hash.digest("hex")
}

function prepareAsset(args) {
  if (!args.asset) return undefined
  const assetPath = path.resolve(String(args.asset))
  if (!fs.existsSync(assetPath)) {
    throw new Error(`Asset does not exist: ${assetPath}`)
  }
  const stat = fs.statSync(assetPath)
  if (!stat.isFile()) {
    throw new Error(`Asset is not a file: ${assetPath}`)
  }
  return {
    path: assetPath,
    sha256: hashFile(assetPath),
    bytes: stat.size,
    altText: typeof args["asset-alt"] === "string" ? args["asset-alt"] : undefined,
  }
}

function newJobId(runId) {
  const suffix = crypto.randomBytes(3).toString("hex")
  return `${runId.replace(/[^A-Za-z0-9._-]/g, "-")}-${suffix}`
}

function commandPrepare(args) {
  const runId = requireArg(args, "run-id")
  const copy = readCopy(args)
  const jobId = typeof args["job-id"] === "string" ? args["job-id"] : newJobId(runId)
  const filePath = jobPath(jobId)
  if (fs.existsSync(filePath)) {
    throw new Error(`Job already exists: ${jobId}`)
  }
  const vetoSeconds = safeNumber(args["veto-seconds"], 60)
  const createdAt = now()
  const vetoEndsAt = new Date(Date.now() + vetoSeconds * 1000).toISOString()
  const job = {
    id: jobId,
    runId,
    channel: "x",
    status: "queue",
    createdAt,
    updatedAt: createdAt,
    vetoEndsAt,
    preparedPayload: {
      copy,
      characterCount: [...copy].length,
      source: typeof args.source === "string" ? args.source : undefined,
      operator: typeof args.operator === "string" ? args.operator : os.userInfo().username,
    },
    preparedAsset: prepareAsset(args),
    browserTask: undefined,
    receipt: undefined,
    blockReason: undefined,
    statusHistory: [{ status: "queue", at: createdAt, detail: "Payload prepared and queued." }],
    safety: {
      oauth: false,
      cookieAccess: false,
      requiresExistingSignedInBrowser: true,
      publishRequiresActionTimeConfirmation: true,
    },
  }
  changeStatus(job, "veto", `Veto window opened for ${vetoSeconds} seconds.`)
  saveJob(job)
  return publicJob(job)
}

function commandShow(args) {
  return publicJob(loadJob(requireArg(args, "job-id")))
}

function commandList() {
  ensureStateDir()
  return fs
    .readdirSync(stateDir())
    .filter((name) => name.endsWith(".json"))
    .map((name) => publicJob(readJson(path.join(stateDir(), name))))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

function commandBlock(args) {
  const job = loadJob(requireArg(args, "job-id"))
  if (job.status === "published") {
    throw new Error("Cannot block a published job")
  }
  job.blockReason = requireArg(args, "reason")
  changeStatus(job, "blocked", job.blockReason)
  return publicJob(saveJob(job))
}

function commandAdvance(args) {
  const job = loadJob(requireArg(args, "job-id"))
  if (job.status !== "veto") {
    return publicJob(job)
  }
  if (Date.now() < Date.parse(job.vetoEndsAt)) {
    throw new Error(`Veto window is still open until ${job.vetoEndsAt}`)
  }
  changeStatus(job, "ready", "Veto window elapsed without a block.")
  return publicJob(saveJob(job))
}

function commandExportBrowserTask(args) {
  const jobId = requireArg(args, "job-id")
  const confirm = requireArg(args, "confirm-action-time")
  const job = loadJob(jobId)
  if (job.status !== "ready") {
    throw new Error(`Job ${job.id} is ${job.status}; only ready jobs can be exported for publishing.`)
  }
  if (confirm !== `PUBLISH ${job.id}`) {
    throw new Error(`Action-time confirmation must exactly equal: PUBLISH ${job.id}`)
  }
  const task = {
    jobId: job.id,
    runId: job.runId,
    channel: "x",
    createdAt: now(),
    targetUrl: "https://x.com/compose/post",
    copy: job.preparedPayload.copy,
    assetPath: job.preparedAsset?.path,
    assetSha256: job.preparedAsset?.sha256,
    assetAltText: job.preparedAsset?.altText,
    instructions: [
      "Use an already signed-in browser session only.",
      "Do not inspect, export, print, or store cookies, localStorage, sessionStorage, auth headers, or browser profile files.",
      "Open the target URL, paste the copy exactly, attach the asset if present, and pause before the final Post click unless the operator has confirmed this exact job at action time.",
      "After posting, copy only the public post URL and update this job with update-receipt.",
    ],
    forbidden: [
      "OAuth token creation",
      "Cookie extraction",
      "Credential prompts",
      "Background publish without action-time confirmation",
    ],
  }
  job.browserTask = task
  job.statusHistory.push({
    status: "ready",
    at: now(),
    detail: "Browser publishing task exported after action-time confirmation.",
  })
  saveJob(job)
  return task
}

function parsePostId(postUrl) {
  const match = String(postUrl).match(/\/status\/([0-9]+)/)
  return match ? match[1] : undefined
}

function commandUpdateReceipt(args) {
  const job = loadJob(requireArg(args, "job-id"))
  if (job.status !== "ready") {
    throw new Error(`Job ${job.id} is ${job.status}; only ready jobs can receive a publish receipt.`)
  }
  const postUrl = requireArg(args, "post-url")
  const postId = typeof args["post-id"] === "string" ? args["post-id"] : parsePostId(postUrl)
  if (!/^https:\/\/(x\.com|twitter\.com)\//.test(postUrl)) {
    throw new Error("Receipt URL must be an https://x.com/ or https://twitter.com/ URL")
  }
  job.receipt = {
    postUrl,
    postId,
    publishedAt: typeof args["published-at"] === "string" ? args["published-at"] : now(),
    verifiedBy: typeof args["verified-by"] === "string" ? args["verified-by"] : os.userInfo().username,
    notes: typeof args.notes === "string" ? args.notes : undefined,
  }
  changeStatus(job, "published", `Receipt recorded for ${postUrl}`)
  return publicJob(saveJob(job))
}

function publicJob(job) {
  return {
    id: job.id,
    runId: job.runId,
    channel: job.channel,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    vetoEndsAt: job.vetoEndsAt,
    preparedPayload: job.preparedPayload,
    preparedAsset: job.preparedAsset,
    receipt: job.receipt,
    blockReason: job.blockReason,
    statusHistory: job.statusHistory,
    safety: job.safety,
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function commandSelfTest() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "wingbeat-x-execution-"))
  const script = new URL(import.meta.url).pathname
  const originalStateDir = process.env.WB_X_EXECUTION_DIR
  process.env.WB_X_EXECUTION_DIR = tempDir
  try {
    const prepared = commandPrepare({
      "job-id": "test-job",
      "run-id": "test-run",
      copy: "Shipping a safer X execution boundary today.",
      "veto-seconds": "0",
      operator: "self-test",
    })
    assert(prepared.status === "veto", "prepare should open veto")
    const ready = commandAdvance({ "job-id": "test-job" })
    assert(ready.status === "ready", "advance should mark ready")
    let denied = false
    try {
      commandExportBrowserTask({ "job-id": "test-job", "confirm-action-time": "yes" })
    } catch {
      denied = true
    }
    assert(denied, "export should require exact action-time confirmation")
    const task = commandExportBrowserTask({
      "job-id": "test-job",
      "confirm-action-time": "PUBLISH test-job",
    })
    assert(task.copy.includes("safer X execution"), "browser task should include copy")
    const published = commandUpdateReceipt({
      "job-id": "test-job",
      "post-url": "https://x.com/example/status/1234567890",
      "verified-by": "self-test",
    })
    assert(published.status === "published", "receipt should publish")
    assert(published.receipt.postId === "1234567890", "receipt should parse post id")
    return { ok: true, stateDir: tempDir, script }
  } finally {
    if (originalStateDir === undefined) {
      delete process.env.WB_X_EXECUTION_DIR
    } else {
      process.env.WB_X_EXECUTION_DIR = originalStateDir
    }
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

function main() {
  const { command, args } = parseArgs(process.argv.slice(2))
  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(usage())
    return
  }
  const commands = {
    prepare: commandPrepare,
    show: commandShow,
    list: commandList,
    block: commandBlock,
    advance: commandAdvance,
    "export-browser-task": commandExportBrowserTask,
    "update-receipt": commandUpdateReceipt,
    "self-test": commandSelfTest,
  }
  const handler = commands[command]
  if (!handler) {
    throw new Error(`Unknown command "${command}"\n\n${usage()}`)
  }
  const result = handler(args)
  if (result !== undefined) {
    console.log(JSON.stringify(result, null, 2))
  }
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
