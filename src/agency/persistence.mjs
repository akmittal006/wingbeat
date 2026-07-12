import { ConvexHttpClient } from "convex/browser"
import { api } from "../../convex/_generated/api.js"

function convexUrl() {
  const url = process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL
  if (!url) {
    throw new Error("Convex is required. Set CONVEX_URL or VITE_CONVEX_URL before running Wingbeat.")
  }
  return url
}

export async function persistRun(rootDir, run) {
  void rootDir
  const client = new ConvexHttpClient(convexUrl())
  const result = await client.mutation(api.powerup.recordAgencyRun, { run })
  return {
    convexUrl: convexUrl(),
    runId: result.runId,
    jobId: result.jobId,
    projectId: result.projectId,
  }
}
