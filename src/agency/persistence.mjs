function convexUrl() {
  const url = process.env.CONVEX_URL
  if (!url) {
    throw new Error("Convex is required. Set CONVEX_URL before running Wingbeat. Retry after starting or configuring Convex; no local JSON fallback is available.")
  }
  return url
}

async function callConvex(url, type, path, args) {
  const response = await fetch(`${url}/api/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Convex-Client": "wingbeat-hermes-plugin",
    },
    body: JSON.stringify({
      path,
      format: "convex_encoded_json",
      args: [args],
    }),
  })
  if (!response.ok && response.status !== 560) {
    throw new Error(await response.text())
  }
  const payload = await response.json()
  if (payload.status === "success") {
    return payload.value
  }
  if (payload.status === "error") {
    throw new Error(payload.errorMessage ?? JSON.stringify(payload))
  }
  throw new Error(`Invalid Convex response: ${JSON.stringify(payload)}`)
}

export async function persistRun(rootDir, run) {
  void rootDir
  const url = convexUrl()
  let result
  try {
    result = await callConvex(url, "mutation", "powerup:recordAgencyRun", { run })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(`Convex persistence failed at ${url}. Retry after verifying CONVEX_URL and Convex availability. No local JSON fallback was written. ${detail}`)
  }
  return {
    convexUrl: url,
    runId: result.runId,
    jobId: result.jobId,
    projectId: result.projectId,
  }
}
