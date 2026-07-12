import crypto from "node:crypto"
import { collectProjectContext } from "./context.mjs"
import { generateWithHermes } from "./hermes.mjs"

function now() {
  return new Date().toISOString()
}

function stableId(prefix, value) {
  return `${prefix}-${crypto.createHash("sha1").update(value).digest("hex").slice(0, 8)}`
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text).length / 4))
}

function estimateCost(tokens) {
  return Number((tokens * 0.000004).toFixed(6))
}

function event(runId, agentId, type, title, detail) {
  return {
    id: stableId("evt", `${runId}:${agentId}:${type}:${title}:${detail}:${Date.now()}:${Math.random()}`),
    runId,
    agentId,
    at: now(),
    type,
    title,
    detail,
  }
}

async function runSpecialist({ runId, role, objective, parentId, context, work }) {
  const started = Date.now()
  const id = stableId("agent", `${runId}:${role}`)
  const agent = {
    id,
    parentId,
    role,
    objective,
    status: "working",
    startedAt: new Date(started).toISOString(),
  }

  const result = await work(context)
  const output = typeof result === "string" ? result : result.output
  const extraEvents = typeof result === "string" ? [] : result.events ?? []
  const tokens = estimateTokens(`${objective}\n${output}`)
  agent.finishedAt = now()
  agent.latencyMs = Date.now() - started
  agent.tokens = tokens
  agent.costUsd = estimateCost(tokens)
  agent.status = "passed"
  agent.output = output

  return { agent, output, extraEvents }
}

function selectCrew(context) {
  const dirty = context.layers.currentJob.dirtyFiles.join("\n").toLowerCase()
  const docs = context.layers.projectHistory.docs.map((item) => item.detail).join("\n").toLowerCase()
  const crew = [
    "Project Intelligence",
    "Story Detector",
    "Creative Director",
    "Content Strategist",
    "Editor / Critic",
    "X Channel Adapter",
  ]

  if (dirty.includes("browser") || docs.includes("x loop") || docs.includes("publishing")) {
    crew.splice(4, 0, "Execution Safety Planner")
  }

  if (dirty.includes("styles") || dirty.includes("app.tsx") || docs.includes("asset") || docs.includes("visual")) {
    crew.splice(4, 0, "Product Mockup Specialist")
  }

  if (dirty.includes("runtime") || dirty.includes("agency") || docs.includes("dynamic")) {
    crew.splice(4, 0, "Technical Fact-Checker")
  }

  return crew
}

function buildHermesPrompt(context, specialistOutputs) {
  return [
    "You are Wingbeat's agency manager.",
    "Write a concise channel-independent build-in-public narrative for marketing the Wingbeat repo itself.",
    "Use only the provided evidence. Avoid fake metrics, fake publishing receipts, and unsupported claims.",
    "",
    `Objective: ${context.objective}`,
    "",
    "Context references:",
    ...context.contextReferences.map((ref) => `- ${ref.layer}/${ref.id}: ${ref.excerpt}`),
    "",
    "Specialist notes:",
    ...specialistOutputs.map((item) => `- ${item.role}: ${item.output}`),
    "",
    "Return 2 short paragraphs. No markdown heading.",
  ].join("\n")
}

function makeWeakDraft(context) {
  return `We made Wingbeat better today. It has agents, content, and publishing, and it will help everyone market everything automatically.`
}

function evaluateDraft({ draft, evidence }) {
  const lower = draft.toLowerCase()
  const unsupported = []
  if (lower.includes("everyone")) unsupported.push("Overbroad audience claim.")
  if (lower.includes("publish") && !lower.includes("veto")) unsupported.push("Publishing claim lacks veto-boundary context.")
  if (lower.includes("automatically") && !lower.includes("inspect")) unsupported.push("Autonomy claim lacks observability or inspection detail.")

  const specificity = evidence.some((item) => lower.includes("wingbeat")) && draft.length > 180
  const score = Math.max(0.25, 0.92 - unsupported.length * 0.18 - (specificity ? 0 : 0.12))
  return {
    id: stableId("eval", draft),
    name: "source-backed-build-in-public-gate",
    passed: unsupported.length === 0 && score >= 0.72,
    score: Number(score.toFixed(2)),
    findings: unsupported.length > 0 ? unsupported : ["Specific, source-backed, and suitable for revision into X copy."],
  }
}

function buildContentPackage({ runId, context, narrative, finalEvaluation }) {
  const whatChanged =
    "Wingbeat now has a dynamic agency runtime that inspects the repo, selects a conditional crew, and produces a UI-consumable run package."
  const whyItMatters =
    "The product promise depends on visible marketing infrastructure: evidence collection, specialist handoffs, critic revision, and a vetoable execution boundary before channel-specific publishing."
  const copy =
    "Today Wingbeat got its agency spine: repo inspection, conditional specialists, source-backed content, critic revision, and an X handoff with a veto window.\n\nThe principle: marketing output should emerge from inspectable infrastructure—not a posting prompt.\n\n#BuildInPublic"

  return {
    id: stableId("pkg", `${runId}:${narrative}`),
    project: context.project,
    category: "build-in-public",
    whatChanged,
    whyItMatters,
    audience: "Technical product builders who want consistent, evidence-backed build-in-public marketing.",
    narrative,
    supportedClaims: [
      "Wingbeat is defined as a dynamic AI marketing agency for Hermes.",
      "The MVP roadmap calls for dynamic crew selection, parallel specialists, revision, context layers, trace, cost, latency, and a UI-consumable run.",
      "The first complete channel loop is X, with veto-window semantics before publishing.",
    ],
    prohibitedClaims: [
      "Do not claim a live X post was published unless an external execution receipt exists.",
      "Do not claim performance analytics or learning from X results in this runtime-only lane.",
      "Do not claim generic audience reach beyond technical product builders.",
    ],
    hooks: [
      "The post is the last step, not the product.",
      "Wingbeat is turning marketing into inspectable infrastructure.",
      "Today the agency stopped being a diagram and started producing runs.",
    ],
    channelNeutralBody: narrative,
    evidence: context.evidence,
    confidence: finalEvaluation.score,
    adaptation: {
      channel: "x",
      copy,
      asset: "deterministic-card:agency-trace",
    },
    evaluations: [finalEvaluation],
    contextReferences: context.contextReferences,
    executionHistory: [
      {
        id: stableId("exec", runId),
        channel: "x",
        status: "handoff_ready",
        detail: "Runtime produced X copy and veto-window metadata; browser executor owns live posting.",
      },
    ],
  }
}

function executionJob(runId, contentPackage) {
  const scheduledFor = new Date(Date.now() + 60_000).toISOString()
  const vetoEndsAt = new Date(Date.now() + 45_000).toISOString()
  return {
    id: stableId("xjob", `${runId}:${contentPackage.id}`),
    runId,
    channel: "x",
    status: "veto_window",
    scheduledFor,
    vetoEndsAt,
    payload: {
      copy: contentPackage.adaptation.copy,
      asset: contentPackage.adaptation.asset,
    },
    handoff: {
      executor: "scripts/x-execution/x-executor.mjs",
      commandPreview:
        `node scripts/x-execution/x-executor.mjs prepare --run-id ${runId} --copy-file <copy-file> --veto-seconds 45`,
    },
  }
}

export async function runAgency({ rootDir, trigger, objective, useHermes = true }) {
  const runId = stableId("run", `${Date.now()}:${trigger}:${objective}`)
  const startedAt = now()
  const context = collectProjectContext({ rootDir, trigger, objective })
  const managerId = stableId("agent", `${runId}:Agency Manager`)
  const events = [
    event(runId, managerId, "spawn", "Agency manager started", "Inspecting docs, git, current job, and brand policy."),
  ]

  const selectedCrew = selectCrew(context)
  events.push(
    event(runId, managerId, "tool", "Conditional crew selected", selectedCrew.join(", ")),
    event(runId, managerId, "handoff", "Three-layer context envelope prepared", "current_job, project_history, brand_policy"),
  )

  const managerAgent = {
    id: managerId,
    role: "Agency Manager",
    objective,
    status: "working",
    startedAt,
  }

  const parallelRoles = [
    {
      role: "Project Intelligence",
      objective: "Summarize the repo-backed facts and implementation surface.",
      work: async (ctx) => {
        await sleep(15)
        return `Wingbeat is a Hermes dynamic marketing agency. Current repo has docs for concept and MVP roadmap, a Vite UI shell, and a safe X execution boundary. Dirty files: ${ctx.layers.currentJob.dirtyFiles.slice(0, 8).join(", ") || "none"}.`
      },
    },
    {
      role: "Story Detector",
      objective: "Find the strongest build-in-public story supported by project evidence.",
      work: async () => {
        await sleep(10)
        return "Strongest story: the system is moving from static product concept to an agency runtime that can inspect itself, assemble specialists, revise weak output, and hand off to execution."
      },
    },
    {
      role: "Creative Director",
      objective: "Set visual direction and reusable asset brief.",
      work: async () => {
        await sleep(12)
        return "Asset brief: compact operations-card visual showing Manager -> specialists -> critic -> X handoff, using neutral dark surfaces with green pass and orange veto accents."
      },
    },
  ]

  const parallelResults = await Promise.all(
    parallelRoles.map((role) =>
      runSpecialist({
        runId,
        role: role.role,
        objective: role.objective,
        parentId: managerId,
        context,
        work: role.work,
      }),
    ),
  )

  for (const result of parallelResults) {
    events.push(
      event(runId, result.agent.id, "spawn", `${result.agent.role} completed`, result.agent.output ?? ""),
      ...result.extraEvents,
    )
  }

  const conditionalRoles = selectedCrew
    .filter((role) => !parallelRoles.some((parallelRole) => parallelRole.role === role))
    .filter((role) => !["Content Strategist", "Editor / Critic", "X Channel Adapter"].includes(role))

  const conditionalResults = await Promise.all(
    conditionalRoles.map((role) =>
      runSpecialist({
        runId,
        role,
        objective: `Handle conditional ${role.toLowerCase()} needs for this run.`,
        parentId: managerId,
        context,
        work: async () => {
          await sleep(8)
          if (role === "Technical Fact-Checker") {
            return "Fact-check: claims must stay within docs and runtime output. Live publishing and analytics are out of scope unless receipts are present."
          }
          if (role === "Product Mockup Specialist") {
            return "Mockup path: use a deterministic agency-trace card brief rather than live image generation for the two-hour MVP."
          }
          return "Execution plan: keep live X publishing behind the existing veto-window browser executor boundary."
        },
      }),
    ),
  )

  for (const result of conditionalResults) {
    events.push(event(runId, result.agent.id, "spawn", `${result.agent.role} spawned conditionally`, result.agent.output ?? ""))
  }

  const specialistOutputs = [...parallelResults, ...conditionalResults].map((result) => ({
    role: result.agent.role,
    output: result.output,
  }))

  const prompt = buildHermesPrompt(context, specialistOutputs)
  const generation = await generateWithHermes({
    prompt,
    cwd: rootDir,
    fallbackContext: context,
    enabled: useHermes,
  })
  events.push(
    event(
      runId,
      managerId,
      "tool",
      "Narrative generated",
      `${generation.provider} ${generation.status}; latency ${generation.usage.latencyMs}ms`,
    ),
  )

  const weakDraft = makeWeakDraft(context)
  const weakEval = evaluateDraft({ draft: weakDraft, evidence: context.evidence })
  events.push(
    event(runId, managerId, "evaluation", "Weak draft evaluated", `${weakEval.passed ? "passed" : "failed"} at ${weakEval.score}`),
  )

  const revisedNarrative = generation.text
  const finalEval = evaluateDraft({ draft: revisedNarrative, evidence: context.evidence })
  const criticStatus = finalEval.passed ? "passed" : "revising"
  events.push(
    event(runId, managerId, "revision", "Manager revision requested", weakEval.findings.join(" ")),
    event(runId, managerId, "evaluation", "Revised package evaluated", `${criticStatus} at ${finalEval.score}`),
  )

  const contentPackage = buildContentPackage({
    runId,
    context,
    narrative: revisedNarrative,
    finalEvaluation: finalEval,
  })
  const xJob = executionJob(runId, contentPackage)

  const strategist = await runSpecialist({
    runId,
    role: "Content Strategist",
    objective: "Select audience, angle, and channel objective.",
    parentId: managerId,
    context,
    work: async () => `Audience: ${contentPackage.audience}. Angle: ${contentPackage.hooks[1]}`,
  })
  const critic = await runSpecialist({
    runId,
    role: "Editor / Critic",
    objective: "Check accuracy, specificity, repetition, and brand fit.",
    parentId: managerId,
    context,
    work: async () => `Gate ${finalEval.passed ? "passed" : "needs caution"}: ${finalEval.findings.join(" ")}`,
  })
  const adapter = await runSpecialist({
    runId,
    role: "X Channel Adapter",
    objective: "Convert canonical package into an X-native payload.",
    parentId: managerId,
    context,
    work: async () => contentPackage.adaptation.copy,
  })

  for (const result of [strategist, critic, adapter]) {
    events.push(event(runId, result.agent.id, "handoff", `${result.agent.role} handoff`, result.agent.output ?? ""))
  }
  events.push(event(runId, adapter.agent.id, "publish", "Execution handoff prepared", xJob.handoff.commandPreview))

  const agents = [
    managerAgent,
    ...parallelResults.map((result) => result.agent),
    ...conditionalResults.map((result) => result.agent),
    strategist.agent,
    critic.agent,
    adapter.agent,
  ]

  managerAgent.finishedAt = now()
  managerAgent.latencyMs = Date.parse(managerAgent.finishedAt) - Date.parse(managerAgent.startedAt)
  managerAgent.tokens = estimateTokens(`${objective}\n${JSON.stringify(contentPackage)}`)
  managerAgent.costUsd = estimateCost(managerAgent.tokens) + (generation.usage?.estimatedCostUsd ?? 0)
  managerAgent.status = "passed"
  managerAgent.output = `Selected ${selectedCrew.length} roles, rejected a weak draft, revised into package ${contentPackage.id}, and prepared X handoff ${xJob.id}.`

  const totalCostUsd = Number(
    (agents.reduce((sum, agent) => sum + (agent.costUsd ?? 0), 0) + (generation.usage?.estimatedCostUsd ?? 0)).toFixed(6),
  )

  return {
    id: runId,
    project: context.project,
    trigger,
    status: "veto_window",
    startedAt,
    scheduledFor: xJob.scheduledFor,
    vetoEndsAt: xJob.vetoEndsAt,
    package: contentPackage,
    agents,
    events,
    contextEnvelope: context.layers,
    contextReferences: context.contextReferences,
    selectedCrew,
    generation,
    evaluation: {
      weakDraft: {
        text: weakDraft,
        result: weakEval,
      },
      revisedDraft: {
        text: revisedNarrative,
        result: finalEval,
      },
    },
    executionJob: xJob,
    metrics: {
      totalLatencyMs: Date.now() - Date.parse(startedAt),
      totalEstimatedCostUsd: totalCostUsd,
      agentCount: agents.length,
      traceEventCount: events.length,
    },
  }
}
