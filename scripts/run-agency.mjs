#!/usr/bin/env node
import path from "node:path"
import fs from "node:fs"
import process from "node:process"
import { runAgency } from "../src/agency/runtime.mjs"
import { persistRun } from "../src/agency/persistence.mjs"

function parseArgs(argv) {
  const args = {
    trigger: "manual-demo",
    objective: "Create one source-backed build-in-public story for this project. Do not publish.",
    useHermes: true,
    project: undefined,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    const next = argv[index + 1]
    if (token === "--trigger" && next) {
      args.trigger = next
      index += 1
    } else if (token === "--objective" && next) {
      args.objective = next
      index += 1
    } else if (token === "--project" && next) {
      args.project = next
      index += 1
    } else if (token === "--no-hermes") {
      args.useHermes = false
    } else if (token === "--help" || token === "-h") {
      args.help = true
    }
  }

  return args
}

function usage() {
  return `Wingbeat agency runtime

Usage:
  node scripts/run-agency.mjs [--project PATH] [--trigger NAME] [--objective TEXT] [--no-hermes]

Outputs:
  Writes the run, trace events, package, memory, and queued execution job to Convex.
  Prints the Convex identifiers and a compact run summary.`
}

const args = parseArgs(process.argv.slice(2))

if (args.help) {
  console.log(usage())
  process.exit(0)
}

try {
  const rootDir = args.project ? path.resolve(args.project) : process.cwd()
  if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
    throw new Error(`Project path does not exist or is not a directory: ${rootDir}`)
  }
  const run = await runAgency({
    rootDir,
    trigger: args.trigger,
    objective: args.objective,
    useHermes: args.useHermes,
  })
  const output = await persistRun(rootDir, run)

  console.log(`Wingbeat agency run complete`)
  console.log(`project: ${rootDir}`)
  console.log(`runId: ${run.id}`)
  console.log(`status: ${run.status}`)
  console.log(`crew: ${run.agents.map((agent) => agent.role).join(" -> ")}`)
  console.log(`hermes: ${run.generation?.provider ?? "unknown"} (${run.generation?.status ?? "unknown"})`)
  console.log(`convex: ${output.convexUrl}`)
  console.log(`convexRunId: ${output.runId}`)
  console.log(`convexJobId: ${output.jobId}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
