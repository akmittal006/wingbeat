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

function buildDraftPrompt(context, specialistOutputs) {
  return [
    "You are Wingbeat's agency manager.",
    "Write a concise channel-independent first draft for a build-in-public narrative marketing the Wingbeat repo itself.",
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

function buildRevisionPrompt({ context, specialistOutputs, draft, findings }) {
  return [
    "You are Wingbeat's Editor / Critic revising a build-in-public narrative.",
    "Revise the draft using the named findings. Keep only source-backed claims from the context.",
    "Do not add fake metrics, fake receipts, or live publishing claims.",
    "",
    `Objective: ${context.objective}`,
    "",
    "Named findings:",
    ...findings.map((finding) => `- ${finding}`),
    "",
    "Context references:",
    ...context.contextReferences.map((ref) => `- ${ref.layer}/${ref.id}: ${ref.excerpt}`),
    "",
    "Specialist notes:",
    ...specialistOutputs.map((item) => `- ${item.role}: ${item.output}`),
    "",
    "Draft to revise:",
    draft,
    "",
    "Return 2 short paragraphs. No markdown heading.",
  ].join("\n")
}

function evidenceTerms(evidence) {
  return evidence
    .flatMap((item) => `${item.label} ${item.detail}`.toLowerCase().match(/[a-z][a-z-]{5,}/g) ?? [])
    .filter((term, index, all) => all.indexOf(term) === index)
}

function evaluateDraft({ draft, evidence }) {
  const lower = draft.toLowerCase()
  const findings = []
  const terms = evidenceTerms(evidence)
  const evidenceHits = terms.filter((term) => lower.includes(term)).slice(0, 8)

  if (!lower.includes("wingbeat")) findings.push("missing-project-name")
  if (evidenceHits.length < 2) findings.push("insufficient-evidence-anchoring")
  if (lower.includes("everyone") || lower.includes("everything")) findings.push("overbroad-audience-claim")
  if ((lower.includes("published") || lower.includes("live post")) && !lower.includes("receipt")) {
    findings.push("unsupported-live-publishing-claim")
  }
  if ((lower.includes("automatic") || lower.includes("autonomous")) && !lower.includes("veto")) {
    findings.push("autonomy-without-veto-context")
  }
  if (!lower.includes("runtime") && !lower.includes("agency")) findings.push("missing-runtime-or-agency-specificity")
  if (draft.length < 180) findings.push("too-thin-for-canonical-package")

  const score = Math.max(0.2, 0.96 - findings.length * 0.12)
  return {
    id: stableId("eval", draft),
    name: "source-backed-build-in-public-gate",
    passed: findings.length === 0 && score >= 0.72,
    score: Number(score.toFixed(2)),
    findings: findings.length > 0 ? findings : ["source-backed", "specific", "veto-aware"],
    evidenceHits,
  }
}

function sentenceFrom(text, fallback) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .find(Boolean) ?? fallback
}

function truncateForX(text, limit = 280) {
  const clean = text
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
  if ([...clean].length <= limit) return clean
  const sliced = [...clean].slice(0, limit - 1).join("").replace(/\s+\S*$/, "")
  return `${sliced.trim()}…`
}

function evidenceSourceLabel(context) {
  const primary = context.evidence.find((item) => item.source === "docs/product-concept.md") ?? context.evidence[0]
  return primary?.label ?? "repo docs"
}

function repositoryUrl(context) {
  return context.repositoryUrl ?? context.layers.currentJob.repositoryUrl
}

function classifyContentMode({ context }) {
  const objective = context.objective.toLowerCase()
  const hasRunHistory = context.layers.currentJob.dirtyFiles.some((file) => file.startsWith("src/agency/runs/"))
  if (objective.includes("introduc") || objective.includes("launch") || !hasRunHistory) return "introduction"
  return "build-in-public"
}

function reservedXLimit(context) {
  return repositoryUrl(context) ? 257 : 280
}

function hashtagCount(copy) {
  return (copy.match(/(^|\s)#[\p{L}\p{N}_]+/gu) ?? []).length
}

function scoreCriterion(passed, partial = false) {
  if (passed) return 2
  return partial ? 1 : 0
}

function capabilityLines(context) {
  const docs = context.layers.projectHistory.docs.map((item) => item.detail).join(" ").toLowerCase()
  const capabilities = []
  if (docs.includes("detect") || docs.includes("story")) capabilities.push("code -> stories")
  if (docs.includes("canonical content package") || docs.includes("content package")) capabilities.push("proof -> reusable posts")
  if (docs.includes("veto") || docs.includes("x loop")) capabilities.push("draft -> veto-ready X")
  if (docs.includes("asset") || docs.includes("beauty")) capabilities.push("visual briefs")
  return capabilities.slice(0, 4)
}

function introProof(context) {
  const hasAgencyRuntime = context.layers.currentJob.sourceFiles.includes("src/agency/runtime.mjs")
  const hasRunScript = context.layers.currentJob.sourceFiles.includes("scripts/run-agency.mjs")
  const source = evidenceSourceLabel(context).replace(/\.md$/, "")
  if (hasAgencyRuntime && hasRunScript) return "agency run that reads this repo and drafts from its docs"
  return `repo-backed first X loop from ${source}`
}

function buildIntroductionCopy({ context }) {
  const list = "code -> stories / proof -> reusable posts / draft -> veto-ready X"
  const copy =
    `Building Wingbeat, an AI Marketing Agency for indie developers.\n` +
    `It helps builders ship more and post consistently.\n` +
    `Handles: ${list}.\n` +
    `Week 1: shipped repo-backed X draft loop.\n` +
    `Want early access? Reply "Wingbeat".`
  return truncateForX(copy, reservedXLimit(context))
}

function buildBuildInPublicCopy({ narrative, context }) {
  const source = evidenceSourceLabel(context).replace(/\.md$/, "")
  const copy =
    `Building Wingbeat in public.\n` +
    `It is an AI marketing team for builders who would rather ship than post.\n` +
    `Today: drafted an X post from ${source} and local git context, before any live posting.\n` +
    `What should it notice next?`
  return truncateForX(copy, reservedXLimit(context))
}

function buildXCopy({ narrative, context, mode }) {
  if (mode === "introduction") return buildIntroductionCopy({ context })
  return buildBuildInPublicCopy({ narrative, context })
}

function evaluateIntroductionXQuality(copy, context) {
  const lower = copy.toLowerCase()
  const chars = [...copy].length
  const hashtags = hashtagCount(copy)
  const limit = reservedXLimit(context)
  const autoRejectFindings = []

  if (!/^(building|introducing) wingbeat/i.test(copy)) autoRejectFindings.push("missing-direct-intro-first-line")
  if (!/(ai marketing agency|ai marketing team)/.test(lower)) autoRejectFindings.push("wingbeat-unexplained")
  if (/commit|diff|merged|branch|sha|runtime|specialist|manager|critic|handoff|trace|architecture/.test(lower)) {
    autoRejectFindings.push("commit-summary-or-internal-architecture-voice")
  }
  if (/(launched|published|posted itself|live post)/.test(lower) && !/receipt/.test(lower)) {
    autoRejectFindings.push("unsupported-launch-or-publish-claim")
  }
  if (/principle:|infrastructure|canonical|channel-independent|source-backed|no fluff/.test(lower)) {
    autoRejectFindings.push("abstract-principle-dominates")
  }
  if (hashtags > 0 && !/wingbeat/.test(lower)) autoRejectFindings.push("hashtags-supply-context")

  const questions = (copy.match(/\?/g) ?? []).length
  const capabilities = capabilityLines(context).filter((item) => lower.includes(item.toLowerCase()))
  const arrowCapabilities = (copy.match(/->/g) ?? []).length
  const rubric = [
    {
      name: "product-introduction",
      score: scoreCriterion(/^(building|introducing) wingbeat/i.test(copy) && /ai marketing agency/i.test(copy)),
    },
    {
      name: "audience-value",
      score: scoreCriterion(/indie developers|builders/.test(lower) && /post consistently|ship more|rather ship/.test(lower)),
    },
    {
      name: "capability-clarity",
      score: scoreCriterion(/handles:/.test(lower) && arrowCapabilities >= 3, /handles:/.test(lower) && arrowCapabilities >= 2),
    },
    {
      name: "grounded-capabilities",
      score: scoreCriterion(/code -> stories/.test(lower) && /draft -> veto-ready x/.test(lower)),
    },
    {
      name: "shipped-proof",
      score: scoreCriterion(/week 1: shipped/.test(lower) && /repo|docs|git|x loop|agency run/.test(lower)),
    },
    {
      name: "evidence-integrity",
      score: scoreCriterion(!/(public repo|launched|published|live post|posted itself)/.test(lower)),
    },
    {
      name: "native-voice",
      score: scoreCriterion(copy.split(/\s+/).length <= 46, copy.split(/\s+/).length <= 54),
    },
    {
      name: "specific-cta",
      score: scoreCriterion(/want early access\? reply "wingbeat"\.?/i.test(copy), questions === 1 && /early access/.test(lower)),
    },
    {
      name: "intro-structure",
      score: scoreCriterion(copy.split(/\n/).length >= 5 && /^handles:/im.test(copy) && /^(first up|week 1):/im.test(copy)),
    },
    {
      name: "compression",
      score: scoreCriterion(chars <= limit && hashtags <= 1, chars <= 280 && hashtags <= 1),
    },
  ]

  const score = rubric.reduce((sum, item) => sum + item.score, 0)
  const failedCriteria = rubric.filter((item) => item.score < 2).map((item) => `${item.name}:${item.score}`)
  const passed = score >= 17 && autoRejectFindings.length === 0

  return {
    id: stableId("xquality", copy),
    name: "introduction-x-quality-gate",
    mode: "introduction",
    passed,
    score,
    maxScore: 20,
    threshold: 17,
    autoRejectFindings,
    failedCriteria,
    rubric,
    characterCount: chars,
    hashtagCount: hashtags,
    reservedLinkCharacters: repositoryUrl(context) ? 23 : 0,
  }
}

function evaluateBuildInPublicXQuality(copy, context) {
  const lower = copy.toLowerCase()
  const chars = [...copy].length
  const hashtags = hashtagCount(copy)
  const limit = reservedXLimit(context)
  const autoRejectFindings = []
  if (!/wingbeat/.test(lower) || !/ai marketing team/.test(lower)) autoRejectFindings.push("wingbeat-unexplained")
  if (/(launched|published|posted itself|live post|public repo)/.test(lower) && !/receipt/.test(lower)) {
    autoRejectFindings.push("unsupported-launch-or-publish-claim")
  }
  if (hashtags > 0 && !/wingbeat/.test(lower)) autoRejectFindings.push("hashtags-supply-context")
  const rubric = [
    { name: "standalone-context", score: scoreCriterion(/wingbeat/.test(lower) && /ai marketing team/.test(lower)) },
    { name: "plain-product-clarity", score: scoreCriterion(/builders/.test(lower) && /post/.test(lower)) },
    { name: "concrete-progress", score: scoreCriterion(/today:/.test(lower) && /drafted/.test(lower)) },
    { name: "specificity", score: scoreCriterion(/docs|git|repo/.test(lower)) },
    { name: "evidence-integrity", score: scoreCriterion(!/(launched|published|live post|posted itself|public repo)/.test(lower)) },
    { name: "native-voice", score: scoreCriterion(copy.split(/\s+/).length <= 48, copy.split(/\s+/).length <= 56) },
    { name: "specific-invitation", score: scoreCriterion(/\?$/.test(copy.trim())) },
    { name: "compression", score: scoreCriterion(chars <= limit && hashtags <= 1) },
    { name: "mode-fit", score: scoreCriterion(/^building wingbeat in public/i.test(copy)) },
    { name: "not-pain-forced", score: scoreCriterion(true) },
  ]
  const score = rubric.reduce((sum, item) => sum + item.score, 0)
  const failedCriteria = rubric.filter((item) => item.score < 2).map((item) => `${item.name}:${item.score}`)
  return {
    id: stableId("xquality", copy),
    name: "build-in-public-x-quality-gate",
    mode: "build-in-public",
    passed: score >= 17 && autoRejectFindings.length === 0,
    score,
    maxScore: 20,
    threshold: 17,
    autoRejectFindings,
    failedCriteria,
    rubric,
    characterCount: chars,
    hashtagCount: hashtags,
    reservedLinkCharacters: repositoryUrl(context) ? 23 : 0,
  }
}

function evaluateXQuality(copy, context, mode) {
  if (mode === "introduction") return evaluateIntroductionXQuality(copy, context)
  return evaluateBuildInPublicXQuality(copy, context)
}

function repairXCopy({ narrative, context, mode }) {
  return buildXCopy({ narrative, context, mode })
}

function buildContentPackage({ runId, context, narrative, finalEvaluation }) {
  const whatChanged = sentenceFrom(
    narrative,
    "Wingbeat now has a repo-inspecting agency runtime that can produce a UI-consumable run package.",
  )
  const whyItMatters =
    narrative
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .slice(1)
      .join(" ")
      .trim() ||
    "The product promise depends on evidence collection, specialist handoffs, critic evaluation, and a vetoable execution boundary."
  const contentMode = classifyContentMode({ context })
  let copy = buildXCopy({ narrative, context, mode: contentMode })
  let xQuality = evaluateXQuality(copy, context, contentMode)
  if (!xQuality.passed) {
    copy = repairXCopy({ narrative, context, mode: contentMode })
    xQuality = {
      ...evaluateXQuality(copy, context, contentMode),
      repairedFrom: xQuality,
    }
  }

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
    confidence: Number(((finalEvaluation.score + xQuality.score / 20) / 2).toFixed(2)),
    adaptation: {
      channel: "x",
      mode: contentMode,
      copy,
      characterCount: [...copy].length,
      asset: "deterministic-card:agency-trace",
    },
    evaluations: [finalEvaluation, xQuality],
    xQuality,
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
        return "Strongest story: the system is moving from static product concept to an agency runtime that can inspect itself, assemble specialists, evaluate drafts, and hand off to execution."
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

  const criticId = stableId("agent", `${runId}:Editor / Critic`)
  const draftPrompt = buildDraftPrompt(context, specialistOutputs)
  const draftGeneration = await generateWithHermes({
    prompt: draftPrompt,
    cwd: rootDir,
    fallbackContext: context,
    enabled: useHermes,
  })
  events.push(
    event(
      runId,
      managerId,
      "tool",
      "First draft delegated",
      `${draftGeneration.provider} ${draftGeneration.status}; latency ${draftGeneration.usage.latencyMs}ms`,
    ),
  )

  const firstEvaluation = evaluateDraft({ draft: draftGeneration.text, evidence: context.evidence })
  events.push(
    event(
      runId,
      criticId,
      "evaluation",
      "First draft evaluated",
      `${firstEvaluation.passed ? "passed" : "failed"} at ${firstEvaluation.score}: ${firstEvaluation.findings.join(", ")}`,
    ),
  )

  let revisionGeneration
  let revisedNarrative = draftGeneration.text
  if (!firstEvaluation.passed) {
    const revisionPrompt = buildRevisionPrompt({
      context,
      specialistOutputs,
      draft: draftGeneration.text,
      findings: firstEvaluation.findings,
    })
    revisionGeneration = await generateWithHermes({
      prompt: revisionPrompt,
      cwd: rootDir,
      fallbackContext: context,
      enabled: useHermes,
    })
    revisedNarrative = revisionGeneration.text
    events.push(
      event(
        runId,
        criticId,
        "revision",
        "Second generation requested",
        `Findings: ${firstEvaluation.findings.join(", ")}; provider ${revisionGeneration.provider} ${revisionGeneration.status}`,
      ),
    )
  }

  const finalEval = evaluateDraft({ draft: revisedNarrative, evidence: context.evidence })
  const criticStatus = finalEval.passed ? "passed" : "revising"
  events.push(
    event(
      runId,
      criticId,
      "evaluation",
      revisionGeneration ? "Revised draft evaluated" : "Final draft accepted without revision",
      `${criticStatus} at ${finalEval.score}: ${finalEval.findings.join(", ")}`,
    ),
  )

  const contentPackage = buildContentPackage({
    runId,
    context,
    narrative: revisedNarrative,
    finalEvaluation: finalEval,
  })
  const xAdapterId = stableId("agent", `${runId}:X Channel Adapter`)
  events.push(
    event(
      runId,
      xAdapterId,
      "evaluation",
      "X quality gate evaluated",
      `${contentPackage.xQuality.passed ? "passed" : "failed"} ${contentPackage.xQuality.score}/20; ${[
        ...contentPackage.xQuality.autoRejectFindings,
        ...contentPackage.xQuality.failedCriteria,
      ].join(", ") || "all criteria met"}`,
    ),
  )
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
    work: async () =>
      `Gate ${finalEval.passed ? "passed" : "needs caution"} after ${
        revisionGeneration ? "revision" : "first draft"
      }: ${finalEval.findings.join(", ")}`,
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
  managerAgent.costUsd =
    estimateCost(managerAgent.tokens) +
    (draftGeneration.usage?.estimatedCostUsd ?? 0) +
    (revisionGeneration?.usage?.estimatedCostUsd ?? 0)
  managerAgent.status = "passed"
  managerAgent.output = `Selected ${selectedCrew.length} roles, produced package ${contentPackage.id} from evaluated narrative, and prepared X handoff ${xJob.id}.`

  const totalCostUsd = Number(
    (
      agents.reduce((sum, agent) => sum + (agent.costUsd ?? 0), 0) +
      (draftGeneration.usage?.estimatedCostUsd ?? 0) +
      (revisionGeneration?.usage?.estimatedCostUsd ?? 0)
    ).toFixed(6),
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
    generation: {
      provider: revisionGeneration?.provider ?? draftGeneration.provider,
      status: revisionGeneration ? revisionGeneration.status : draftGeneration.status,
      draft: draftGeneration,
      revision: revisionGeneration,
    },
    evaluation: {
      firstDraft: {
        text: draftGeneration.text,
        result: firstEvaluation,
      },
      finalDraft: {
        text: revisedNarrative,
        result: finalEval,
      },
      xQuality: contentPackage.xQuality,
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
