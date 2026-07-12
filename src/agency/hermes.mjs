import { spawn } from "node:child_process"

function estimateTokens(text) {
  return Math.max(1, Math.ceil(text.length / 4))
}

export function deterministicNarrative(context) {
  const dirtyFiles = context.layers.currentJob.dirtyFiles
  const changedSurface = dirtyFiles.length > 0 ? dirtyFiles.slice(0, 5).join(", ") : "the MVP agency spine"
  return {
    provider: "deterministic-fallback",
    status: "fallback",
    text:
      `Today Wingbeat crossed from product concept into an inspectable agency runtime. ` +
      `The manager reads the repo, assembles specialists only when the work calls for them, and turns evidence from docs and git into a reusable content package before any X-specific copy exists. ` +
      `That matters because the product promise is not another posting prompt; it is marketing infrastructure that can explain its work, revise weak drafts, and hand execution to a vetoable publishing boundary. ` +
      `Current implementation surface: ${changedSurface}.`,
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
    const child = spawn("hermes", ["-z", prompt, "chat"], {
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
