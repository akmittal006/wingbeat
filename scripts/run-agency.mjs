#!/usr/bin/env node
import path from "node:path"
import process from "node:process"
import { runAgency } from "../src/agency/runtime.mjs"
import { persistRun } from "../src/agency/persistence.mjs"

function parseArgs(argv) {
  const args = {
    trigger: "manual-demo",
    objective: "Market the Wingbeat repository itself with a build-in-public story.",
    useHermes: true,
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
  node scripts/run-agency.mjs [--trigger NAME] [--objective TEXT] [--no-hermes]

Outputs:
  Writes a UI-consumable AgencyRun JSON file under src/agency/runs/.
  Prints the exact output path and a compact run summary.`
}

const args = parseArgs(process.argv.slice(2))

if (args.help) {
  console.log(usage())
  process.exit(0)
}

try {
  const rootDir = path.resolve(new URL("..", import.meta.url).pathname)
  const run = await runAgency({
    rootDir,
    trigger: args.trigger,
    objective: args.objective,
    useHermes: args.useHermes,
  })
  const output = persistRun(rootDir, run)

  console.log(`Wingbeat agency run complete`)
  console.log(`runId: ${run.id}`)
  console.log(`status: ${run.status}`)
  console.log(`crew: ${run.agents.map((agent) => agent.role).join(" -> ")}`)
  console.log(`hermes: ${run.generation?.provider ?? "unknown"} (${run.generation?.status ?? "unknown"})`)
  console.log(`output: ${output.runPath}`)
  console.log(`latest: ${output.latestPath}`)
  console.log(`dashboard: ${output.publicLatestPath}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
