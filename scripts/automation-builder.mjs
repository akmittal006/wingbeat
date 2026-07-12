#!/usr/bin/env node
import process from "node:process"

const CONVEX_URL = process.env.CONVEX_URL ?? "https://giant-cricket-687.convex.cloud"
const registry = {
  "opportunities.fetchTop": { matches: [/top|latest|first/i, /opportunit/i] },
  "content.curateForX": { matches: [/curat|draft|write|turn|post/i, /x|tweet/i] },
  "x.publish": { matches: [/publish|post|ship/i, /x|tweet/i] },
  "receipts.verify": { matches: [/receipt|verif/i] },
}

function scheduleFor(request) {
  const hourly = request.match(/every\s+(?:(\d+)\s*)?hours?/i)
  if (hourly) return `every ${hourly[1] ?? 1}h`
  const minutes = request.match(/every\s+(\d+)\s*minutes?/i)
  if (minutes) return `every ${minutes[1]}m`
  if (/hourly/i.test(request)) return "every 1h"
  if (/daily|every day/i.test(request)) return "every 24h"
  throw new Error("Automation request needs a schedule such as every hour, every 30 minutes, or daily.")
}

function compile(request) {
  const steps = Object.entries(registry)
    .filter(([, capability]) => capability.matches.every((pattern) => pattern.test(request)))
    .map(([id]) => id)
  if (/opportunit/i.test(request) && !steps.includes("opportunities.fetchTop")) steps.unshift("opportunities.fetchTop")
  if (steps.includes("x.publish")) {
    if (!steps.includes("content.curateForX")) steps.splice(Math.max(steps.indexOf("x.publish"), 0), 0, "content.curateForX")
    if (!steps.includes("receipts.verify")) steps.push("receipts.verify")
  }
  if (steps.length === 0) throw new Error("No registered Wingbeat capabilities match this request.")
  const schedule = scheduleFor(request)
  const name = `Wingbeat: ${request}`.slice(0, 80)
  return {
    version: 1,
    name,
    request,
    schedule,
    steps,
    safety: { deduplicateOpportunities: true, verifiedReceiptRequired: steps.includes("x.publish"), destructiveRecovery: false },
  }
}

async function convexMutation(path, args) {
  const response = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path, args, format: "json" }),
  })
  const result = await response.json()
  if (!response.ok || result.status !== "success") throw new Error(result.errorMessage ?? `Convex mutation failed: ${response.status}`)
  return result.value
}

const [command, ...args] = process.argv.slice(2)
if (command === "compile") {
  console.log(JSON.stringify(compile(args.join(" "))))
} else if (command === "register") {
  const workflow = JSON.parse(args[0])
  const cronId = args[1]
  const id = await convexMutation("ops:upsertAutomation", {
    name: workflow.name,
    channel: workflow.steps.includes("x.publish") ? "x" : "wingbeat",
    trigger: workflow.schedule,
    enabled: true,
    cronId,
    workflow,
    runtimeStatus: "scheduled",
  })
  console.log(JSON.stringify({ id, cronId, workflow }, null, 2))
} else {
  console.error("Usage: automation-builder.mjs {compile REQUEST|register WORKFLOW_JSON CRON_ID}")
  process.exit(2)
}
