// WRITER: persist curated survivors to Convex via the existing ops mutations.
//
// Uses the deployment's public function API (ConvexHttpClient) — the same path
// the rest of Wingbeat uses. Convex is the single source of truth; there is no
// local JSON mirror.
//
// Contract:
//   - each survivor -> ops:createOpportunity {type:"content", source:"codex logs",
//       description, evidenceRef: <real excerpt> + " | " + sessionRef}
//   - ops:recordSensorSync {source:"codex logs", findingsCount: <survivors count>,
//       lastSyncedAt: <real sync time>}   (findings = what survived curation)

import { ConvexHttpClient } from "convex/browser"

export const SENSOR_SOURCE = "codex logs"

export function convexClient(url = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL) {
  if (!url) {
    throw new Error(
      "Convex is required. Set CONVEX_URL (or VITE_CONVEX_URL). No local fallback exists; the sensor fails visibly.",
    )
  }
  return new ConvexHttpClient(url)
}

function evidenceRef(survivor) {
  // Full provenance in one string: the real (already-redacted) excerpt plus its
  // traceable sessionRef, so every row can be verified back to a real moment.
  return `${survivor.evidence}\n\n[${survivor.sessionRef}]`
}

/**
 * Write survivors + honest sensor sync. Returns ids and the recorded count.
 * @param {object[]} survivors from a curator
 * @param {{ client?: ConvexHttpClient, syncTime?: string, dryRun?: boolean }} [opts]
 */
export async function writeSurvivors(survivors, opts = {}) {
  const dryRun = opts.dryRun ?? false
  const syncTime = opts.syncTime ?? new Date().toISOString()
  const client = opts.client ?? (dryRun ? null : convexClient())

  const created = []
  for (const s of survivors) {
    const args = {
      type: "content",
      source: SENSOR_SOURCE,
      description: s.description,
      evidenceRef: evidenceRef(s),
    }
    if (dryRun) {
      created.push({ dryRun: true, args })
      continue
    }
    const id = await client.mutation("ops:createOpportunity", args)
    created.push({ id, description: s.description })
  }

  let sensor = null
  if (dryRun) {
    sensor = { dryRun: true, source: SENSOR_SOURCE, findingsCount: survivors.length, lastSyncedAt: syncTime }
  } else {
    sensor = await client.mutation("ops:recordSensorSync", {
      source: SENSOR_SOURCE,
      findingsCount: survivors.length, // curated survivors, NOT raw candidates
      lastSyncedAt: syncTime,
    })
  }

  return { created, sensor, findingsCount: survivors.length, syncTime }
}

/**
 * One-time authorized cleanup of the junk left by the previous flooding failure.
 * Requires the ops:purgeOpportunities mutation to be deployed.
 * @param {{ client?: ConvexHttpClient, source: string, statuses?: string[] }} opts
 */
export async function purgeJunk(opts) {
  const client = opts.client ?? convexClient()
  return client.mutation("ops:purgeOpportunities", {
    source: opts.source,
    statuses: opts.statuses,
  })
}
