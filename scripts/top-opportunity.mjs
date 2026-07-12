#!/usr/bin/env node
import process from "node:process"
import { ConvexHttpClient } from "convex/browser"
import { makeFunctionReference } from "convex/server"

const convexUrl = process.env.CONVEX_URL ?? "https://giant-cricket-687.convex.cloud"

const listOpportunities = makeFunctionReference("ops:listOpportunities")
const rows = await new ConvexHttpClient(convexUrl).query(listOpportunities, { status: "new" })
const top = rows[0]
if (!top) {
  console.error("No new opportunities are available.")
  process.exit(1)
}

console.log(JSON.stringify(top, null, 2))
