#!/usr/bin/env node
import os from "node:os"
import process from "node:process"

const api = {
  powerup: {
    openVeto: "powerup:openVeto",
    getJob: "powerup:getJob",
    listJobs: "powerup:listJobs",
    blockJob: "powerup:blockJob",
    advanceReady: "powerup:advanceReady",
    exportBrowserTask: "powerup:exportBrowserTask",
    recordVerifiedReceipt: "powerup:recordVerifiedReceipt",
    approveFinalizedXPost: "powerup:approveFinalizedXPost",
  },
  ops: { upsertAutomation: "ops:upsertAutomation" },
}

function usage() {
  return `Wingbeat X execution boundary

Usage:
  node scripts/x-execution/x-executor.mjs prepare --run-id RUN [--job-id JOB] [--veto-seconds 60]
  node scripts/x-execution/x-executor.mjs show --job-id JOB
  node scripts/x-execution/x-executor.mjs list
  node scripts/x-execution/x-executor.mjs approve-final --text "Final tweet"
  node scripts/x-execution/x-executor.mjs block --job-id JOB --reason "reason"
  node scripts/x-execution/x-executor.mjs advance --job-id JOB [--force]
  node scripts/x-execution/x-executor.mjs export-browser-task --job-id JOB --confirm-action-time "PUBLISH JOB"
  node scripts/x-execution/x-executor.mjs update-receipt --job-id JOB --post-url URL [--post-id ID]
  node scripts/x-execution/x-executor.mjs self-test

Safety:
  This CLI never authenticates to X, never reads browser profiles, and never stores cookies.
  Convex is the only persistent execution state. Set CONVEX_URL.`
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

function convexUrl() {
  return process.env.CONVEX_URL ?? "https://giant-cricket-687.convex.cloud"
}

function client() {
  const call = async (kind, path, args) => {
    const response = await fetch(`${convexUrl()}/api/${kind}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path, args, format: "json" }),
    })
    if (!response.ok) throw new Error(`Convex ${kind} failed: HTTP ${response.status}`)
    const result = await response.json()
    if (result.status !== "success") throw new Error(result.errorMessage ?? `Convex ${kind} failed.`)
    return result.value
  }
  return {
    query: (path, args) => call("query", path, args),
    mutation: (path, args) => call("mutation", path, args),
  }
}

function requireArg(args, key) {
  const value = args[key]
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required --${key}`)
  }
  return value
}

function safeNumber(value, fallback) {
  if (value === undefined || value === true) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid numeric value "${value}"`)
  }
  return parsed
}

function parsePostId(postUrl) {
  const match = String(postUrl).match(/\/status\/([0-9]+)/)
  return match ? match[1] : undefined
}

async function commandPrepare(args) {
  return client().mutation(api.powerup.openVeto, {
    runId: requireArg(args, "run-id"),
    jobId: typeof args["job-id"] === "string" ? args["job-id"] : undefined,
    vetoSeconds: safeNumber(args["veto-seconds"], 60),
    operator: typeof args.operator === "string" ? args.operator : os.userInfo().username,
  })
}

async function commandShow(args) {
  const job = await client().query(api.powerup.getJob, { jobId: requireArg(args, "job-id") })
  if (!job) throw new Error(`No X execution job found for ${args["job-id"]}`)
  return job
}

async function commandList() {
  return client().query(api.powerup.listJobs, {})
}

async function commandApproveFinal(args) {
  const result = await client().mutation(api.powerup.approveFinalizedXPost, {
    text: requireArg(args, "text"),
    operator: typeof args.operator === "string" ? args.operator : os.userInfo().username,
  })
  await client().mutation(api.ops.upsertAutomation, {
    name: "Post to X",
    channel: "x",
    trigger: "hermes wingbeat post-x",
    enabled: true,
  })
  return result
}

async function commandBlock(args) {
  return client().mutation(api.powerup.blockJob, {
    jobId: requireArg(args, "job-id"),
    reason: requireArg(args, "reason"),
  })
}

async function commandAdvance(args) {
  return client().mutation(api.powerup.advanceReady, {
    jobId: requireArg(args, "job-id"),
    force: Boolean(args.force),
  })
}

async function commandExportBrowserTask(args) {
  return client().mutation(api.powerup.exportBrowserTask, {
    jobId: requireArg(args, "job-id"),
    confirmation: requireArg(args, "confirm-action-time"),
  })
}

async function commandUpdateReceipt(args) {
  const postUrl = requireArg(args, "post-url")
  return client().mutation(api.powerup.recordVerifiedReceipt, {
    jobId: requireArg(args, "job-id"),
    postUrl,
    postId: typeof args["post-id"] === "string" ? args["post-id"] : parsePostId(postUrl),
    verifiedBy: typeof args["verified-by"] === "string" ? args["verified-by"] : os.userInfo().username,
    account: typeof args.account === "string" ? args.account : undefined,
    notes: typeof args.notes === "string" ? args.notes : undefined,
  })
}

async function commandSelfTest() {
  const jobs = await commandList()
  return {
    ok: true,
    convexUrl: convexUrl(),
    observedJobs: jobs.length,
    note: "Convex-backed executor is reachable. Lifecycle proof requires a runtime-created queued job.",
  }
}

async function main() {
  const { command, args } = parseArgs(process.argv.slice(2))
  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(usage())
    return
  }
  const commands = {
    prepare: commandPrepare,
    show: commandShow,
    list: commandList,
    "approve-final": commandApproveFinal,
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
  const result = await handler(args)
  if (result !== undefined) {
    console.log(JSON.stringify(result, null, 2))
  }
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
