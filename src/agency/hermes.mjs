import { spawn } from "node:child_process"

function estimateTokens(text) {
  return Math.max(1, Math.ceil(text.length / 4))
}

export function deterministicNarrative(context) {
  const dirtyFiles = context.layers.currentJob.dirtyFiles
  const changedSurface = dirtyFiles.length > 0 ? dirtyFiles.slice(0, 5).join(", ") : "the current repository state"
  const latestCommit = context.layers.projectHistory.recentCommits.split(/\r?\n/).find(Boolean) ?? "no commit history"
  const evidenceLabels = context.evidence.map((item) => item.label.replace(/\.md$/, "")).join(", ")
  const workspaceDigest = context.contextReferences.find((item) => item.id === "ctx-workspace-shape")?.digest ?? "unknown"
  const project = context.project || "this project"
  return {
    provider: "deterministic-fallback",
    status: "fallback",
    text:
      `Building ${project} in public. ` +
      `This Wingbeat run used ${evidenceLabels || "local evidence"} plus git context (${latestCommit}) to prepare a source-backed story without publishing it. ` +
      `${context.description || "The project was summarized from local files."} ` +
      `Current proof ${workspaceDigest}: ${changedSurface}.`,
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      estimatedCostUsd: 0,
      latencyMs: 0,
    },
  }
}

export async function generateWithHermes({ prompt, cwd, fallbackContext, timeoutMs = 25000, enabled = true }) {
  if (!enabled) {
    return deterministicNarrative(fallbackContext)
  }

  const started = Date.now()
  return new Promise((resolve) => {
    const child = spawn("hermes", ["-z", prompt], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""
    const timer = setTimeout(() => {
      child.kill("SIGTERM")
    }, timeoutMs)

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString()
    })

    child.on("close", (code, signal) => {
      clearTimeout(timer)
      const latencyMs = Date.now() - started
      const clean = stdout.trim()
      if (code === 0 && clean.length > 0) {
        const promptTokens = estimateTokens(prompt)
        const completionTokens = estimateTokens(clean)
        resolve({
          provider: "hermes",
          status: "ok",
          text: clean,
          usage: {
            promptTokens,
            completionTokens,
            estimatedCostUsd: Number(((promptTokens * 0.000002) + (completionTokens * 0.000006)).toFixed(6)),
            latencyMs,
          },
          stderr: stderr.trim() || undefined,
        })
        return
      }

      const fallback = deterministicNarrative(fallbackContext)
      resolve({
        ...fallback,
        status: signal ? `fallback:${signal}` : `fallback:${code ?? "unknown"}`,
        usage: {
          ...fallback.usage,
          latencyMs,
        },
        error: (stderr || stdout || "Hermes returned no output.").trim(),
      })
    })

    child.on("error", (error) => {
      clearTimeout(timer)
      const fallback = deterministicNarrative(fallbackContext)
      resolve({
        ...fallback,
        status: "fallback:error",
        usage: {
          ...fallback.usage,
          latencyMs: Date.now() - started,
        },
        error: error.message,
      })
    })
  })
}
