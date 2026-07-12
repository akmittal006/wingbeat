#!/usr/bin/env node
import process from "node:process"

const convexUrl = process.env.CONVEX_URL ?? "https://giant-cricket-687.convex.cloud"
const response = await fetch(`${convexUrl}/api/query`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ path: "ops:listOpportunities", args: { status: "new" }, format: "json" }),
})
if (!response.ok) throw new Error(`Convex query failed: HTTP ${response.status}`)
const result = await response.json()
if (result.status !== "success") throw new Error(result.errorMessage ?? "Convex query failed.")
const rows = result.value
const top = rows[0]
if (!top) {
  console.error("No new opportunities are available.")
  process.exit(1)
}

console.log(JSON.stringify(top, null, 2))
