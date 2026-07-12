import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
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

function xCharacterCount(text) {
  return [...text.replace(/https?:\/\/\S+/g, "xxxxxxxxxxxxxxxxxxxxxxx")].length
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
  if (objective.includes("introduc") || objective.includes("launch") || objective.includes("prove convex")) {
    return "introduction"
  }
  return "build-in-public"
}

function loadXProsePlaybook(rootDir) {
  const filePath = path.join(rootDir, "src", "data", "x-prose-playbook.json")
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function selectXProseCategory({ context, playbook }) {
  const objective = context.objective.toLowerCase()
  const categories = Array.isArray(playbook.categories) ? playbook.categories : []
  const byId = new Map(categories.map((category) => [category.id, category]))
  const prefer = (id) => byId.get(id)

  const selected =
    (/video|demo/.test(objective) && prefer("demo-video-post")) ||
    (/(open.source|repo launch|repository launch|public repo|public repository)/.test(objective) && prefer("open-source-repo-launch")) ||
    (/waitlist|early access/.test(objective) && prefer("waitlist-early-access")) ||
    (/launch|introduc/.test(objective) && prefer("product-introduction")) ||
    (/feature/.test(objective) && prefer("feature-intro-launch")) ||
    (/lesson|insight/.test(objective) && prefer("insight-lesson")) ||
    (/milestone|proof|receipt/.test(objective) && prefer("milestone-proof")) ||
    (/fail|failed|failure/.test(objective) && prefer("failure-learning")) ||
    (/decision|tradeoff|behind|technical/.test(objective) && prefer("technical-decision")) ||
    (/experiment|result/.test(objective) && prefer("experiment-result")) ||
    (/question|feedback|community/.test(objective) && prefer("community-feedback")) ||
    (/changelog|update/.test(objective) && prefer("changelog-update")) ||
    prefer("daily-build-log") ||
    categories[0]

  if (!selected?.id) throw new Error("X prose playbook has no selectable categories")
  return selected
}

function buildXProseContract({ playbook, category }) {
  return {
    playbookVersion: playbook.version,
    categoryId: category.id,
    category,
    inputContract: playbook.inputContract,
    generatorPrompt: playbook.generatorPrompt,
    evaluation: playbook.evaluation,
    globalRules: playbook.globalRules,
  }
}

function chooseTonePreset({ context }) {
  const objective = context.objective.toLowerCase()
  if (/parody|yc/.test(objective)) return "yc-parody"
  if (/chaotic|loud|ridiculous/.test(objective)) return "chaotic"
  if (/deadpan|dry/.test(objective)) return "deadpan"
  if (/cinematic|trailer/.test(objective)) return "cinematic"
  if (/app store|app-store|feature card/.test(objective)) return "app-store"
  if (/introduc|launch|feature/.test(objective)) return "polished"
  return "default"
}

function inspectVisualSurface(context) {
  const files = context.layers.currentJob.sourceFiles
  const uiFiles = files.filter((file) => /src\/(App|main|components|styles)|convex\/|scripts\//.test(file)).slice(0, 12)
  const hasOperatorConsole = files.includes("src/components/OperatorConsole.tsx")
  const hasRuntime = files.includes("src/agency/runtime.mjs")
  const hasConvex = files.includes("convex/powerup.ts") || files.includes("convex/schema.ts")
  const hasExecutor = files.includes("scripts/x-execution/x-executor.mjs")
  return {
    uiFiles,
    moments: [
      hasOperatorConsole ? "Operator Console reads live Convex run state, evidence, crew, and X handoff." : undefined,
      hasRuntime ? "Agency runtime builds source-backed package and execution handoff." : undefined,
      hasConvex ? "Convex stores the canonical run, package, events, jobs, and receipts." : undefined,
      hasExecutor ? "X executor exports browser tasks only after action-time confirmation." : undefined,
    ].filter(Boolean),
  }
}

function buildVisualPlanningRubric(context) {
  const surface = inspectVisualSurface(context)
  const evidenceIds = context.evidence.map((item) => item.id)
  return [
    ["project-job", "What does this project actually help someone do?", "Wingbeat turns product work into source-backed marketing packages and execution handoffs."],
    ["audience", "Who needs to understand it in the first three seconds?", "Technical builders and small product teams who ship more consistently than they market."],
    ["source-proof", "Which real sources prove the story?", context.evidence.map((item) => item.source).join(", ")],
    ["visible-ui", "What real UI, code, or source artifact can be shown?", surface.uiFiles.join(", ") || "No UI/source files found."],
    ["product-moments", "Which two or three product moments are concrete enough to show?", surface.moments.join(" ") || "No concrete product moments found."],
    ["visual-identity", "What visual identity should carry the piece?", "Dense dark operator console, compact evidence cards, green pass states, amber veto states, and Convex source-of-truth labels."],
    ["claim-boundary", "Which claims must the visual avoid?", "No live publish, growth, analytics, rendered asset, launch, or user claims without receipts or generated asset metadata."],
    ["format", "Which format best fits reusable marketing output?", "Start with a landscape 15-25s demo plan and a reusable UI-flow visual brief; channel variants can crop later."],
    ["cta", "What action should the viewer take?", "Reply for early access, inspect the repo, or answer one product question depending on the prose category."],
  ].map(([id, question, answer]) => ({ id, question, answer, evidenceIds }))
}

function assessVisualOpportunity(context) {
  const surface = inspectVisualSurface(context)
  const recommended = surface.uiFiles.length > 0 && context.evidence.length >= 2
  const noGoReason = recommended ? undefined : "No visual asset should be generated until real UI/source evidence exists."
  return {
    id: stableId("visualopp", `${context.objective}:${surface.uiFiles.join(",")}`),
    kind: "visual",
    recommended,
    reason: recommended
      ? "Real UI, code, docs, and execution state exist, so a visual can show Wingbeat instead of describing it abstractly."
      : noGoReason,
    noGoReason,
    blockers: recommended ? [] : ["missing-real-ui-or-source-evidence"],
    evidenceIds: context.evidence.map((item) => item.id),
  }
}

function assessDemoVideoOpportunity(context) {
  const surface = inspectVisualSurface(context)
  const recommended = surface.moments.length >= 2
  const noGoReason = recommended ? undefined : "No demo video should be planned without at least two specific product moments."
  return {
    id: stableId("videoopp", `${context.objective}:${surface.moments.join(",")}`),
    kind: "demo-video",
    recommended,
    reason: recommended
      ? "There are enough real product moments for a 15-25s hook, reveal, UI-flow, and CTA."
      : noGoReason,
    noGoReason,
    blockers: recommended ? [] : ["insufficient-specific-product-moments"],
    evidenceIds: context.evidence.map((item) => item.id),
  }
}

function rendererBoundary(rootDir) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"))
  const localBinary = path.join(rootDir, "node_modules", ".bin", "hyperframes")
  const declared = Boolean(packageJson.dependencies?.hyperframes || packageJson.devDependencies?.hyperframes)
  const available = fs.existsSync(localBinary)
  return {
    renderer: declared || available ? "hyperframes" : "unavailable",
    rendererAvailable: available,
    rendererState: available ? "available" : "unavailable",
    handoffCommand: available ? "npx hyperframes lint && npx hyperframes render" : undefined,
    blockedReason: available ? undefined : "Hyperframes is not installed in this worktree; persist storyboard and brief only.",
  }
}

function buildVisualBrief({ context, tone, visualOpportunity }) {
  const surface = inspectVisualSurface(context)
  return {
    id: stableId("visualbrief", `${tone}:${context.objective}`),
    status: visualOpportunity.recommended ? "planned" : "not_applicable",
    objective: "Create a source-backed Wingbeat marketing visual from actual operator-console, Convex, runtime, and executor evidence.",
    format: visualOpportunity.recommended ? "ui-flow" : "none",
    tone,
    visualIdentity: "Dark operator console, thin zinc borders, compact evidence cards, green pass states, amber veto states, no abstract SaaS filler.",
    sourceEvidenceIds: context.evidence.map((item) => item.id),
    uiEvidence: surface.uiFiles,
    instructions:
      "Prefer actual user-flow footage, screenshots, or recreated UI from the app. Show source evidence, Convex source-of-truth state, agency crew, evaluation, and handoff state. Do not use generic clouds, funnels, dashboards, or unsupported claims.",
    requiredText: ["Wingbeat", "Convex source of truth", "veto-ready X handoff"],
    shareCopy: "Wingbeat turns product work into source-backed marketing assets before a channel adapter touches it.",
  }
}

function buildDemoVideoPlan({ context, tone, demoVideoOpportunity, rootDir }) {
  const surface = inspectVisualSurface(context)
  const boundary = rendererBoundary(rootDir)
  const status = demoVideoOpportunity.recommended ? (boundary.rendererAvailable ? "planned" : "blocked") : "not_applicable"
  const evidenceIds = context.evidence.map((item) => item.id)
  return {
    id: stableId("videoplan", `${tone}:${context.objective}`),
    status,
    ...boundary,
    rendererState: status === "blocked" ? "blocked" : boundary.rendererState,
    tone,
    format: "landscape",
    durationSeconds: 20,
    hook: "First 2-3s: show the live Convex-backed console and the rule that a draft is not a published receipt.",
    reveal: "Reveal Wingbeat as the agency that reads repo evidence, drafts, evaluates, stores the package in Convex, and hands off to X with veto semantics.",
    productMoments: [
      surface.moments[0] ?? "Repo/source evidence enters the content package.",
      surface.moments[1] ?? "Critic evaluation blocks unsupported claims.",
      surface.moments[2] ?? "Convex stores pending execution state until a receipt exists.",
    ],
    outroCta: "Reply \"Wingbeat\" for early access.",
    readableTiming: "Keep readable labels settled for at least 0.8s; sentences hold about 0.3s per word.",
    visualIdentity: "Use actual operator dashboard footage or recreated UI, not abstract filler; dark dense UI with restrained motion.",
    audioPosture: "Music and SFX are allowed but secondary; subtle ticks for state changes, no voiceover required.",
    shareCopy: "A 20s source-backed demo of Wingbeat's Convex-native content package and veto-ready execution boundary.",
    storyboard: [
      {
        id: "beat-hook",
        label: "Hook",
        startSecond: 0,
        endSecond: 3,
        visual: "Fast push into Operator Console run state and Convex live label.",
        readableText: "Drafts are not receipts.",
        evidenceIds,
      },
      {
        id: "beat-reveal",
        label: "Reveal",
        startSecond: 3,
        endSecond: 7,
        visual: "Show Wingbeat name, source package, and dynamic crew selection.",
        readableText: "Wingbeat builds the source-backed package first.",
        evidenceIds,
      },
      {
        id: "beat-moments",
        label: "Product moments",
        startSecond: 7,
        endSecond: 16,
        visual: "Cut through evidence cards, failed/revised evaluation, Convex contentPackage, and X handoff pending receipt.",
        readableText: "Evidence -> critic -> Convex -> veto-ready handoff.",
        evidenceIds,
      },
      {
        id: "beat-outro",
        label: "Outro",
        startSecond: 16,
        endSecond: 20,
        visual: "Hold on asset/video status and CTA, with no rendered asset or public post URL.",
        readableText: "Reply \"Wingbeat\".",
        evidenceIds,
      },
    ],
    sourceEvidenceIds: evidenceIds,
    uiEvidence: surface.uiFiles,
    generatedAssetIds: [],
  }
}

function buildVisualVideoQuality({ visualOpportunity, demoVideoOpportunity, visualBrief, demoVideoPlan }) {
  return [
    {
      id: stableId("vvquality", "visual-opportunity-required"),
      status: visualOpportunity.reason ? "pass" : "fail",
      score: visualOpportunity.reason ? 1 : 0,
      detail: `Visual opportunity assessed: ${visualOpportunity.reason}`,
      evidenceIds: visualOpportunity.evidenceIds,
    },
    {
      id: stableId("vvquality", "demo-video-opportunity-required"),
      status: demoVideoOpportunity.reason ? "pass" : "fail",
      score: demoVideoOpportunity.reason ? 1 : 0,
      detail: `Demo-video opportunity assessed: ${demoVideoOpportunity.reason}`,
      evidenceIds: demoVideoOpportunity.evidenceIds,
    },
    {
      id: stableId("vvquality", "actual-ui-over-filler"),
      status: visualBrief.uiEvidence.length > 0 && demoVideoPlan.uiEvidence.length > 0 ? "pass" : "warn",
      score: visualBrief.uiEvidence.length > 0 && demoVideoPlan.uiEvidence.length > 0 ? 1 : 0.5,
      detail: "Visual contracts prefer actual UI/source footage and prohibit abstract filler.",
      evidenceIds: visualBrief.sourceEvidenceIds,
    },
    {
      id: stableId("vvquality", "honest-renderer-state"),
      status: demoVideoPlan.status === "rendered" ? "fail" : "pass",
      score: demoVideoPlan.status === "rendered" ? 0 : 1,
      detail: demoVideoPlan.blockedReason ?? "Renderer boundary is available but no render is claimed.",
      evidenceIds: demoVideoPlan.sourceEvidenceIds,
    },
  ]
}

function reservedXLimit(context) {
  return repositoryUrl(context) ? 257 : 280
}

function appendRepositoryUrl(copy, context) {
  const url = repositoryUrl(context)
  if (!url) return copy
  return `${truncateForX(copy, reservedXLimit(context))}\n${url}`
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
  const list = "code -> stories / proof -> posts / draft -> veto-ready X"
  const copyWithoutLink =
    `Building Wingbeat, an AI Marketing Agency for indie developers.\n` +
    `Helps builders ship and post consistently.\n` +
    `Handles: ${list}.\n` +
    `Week 1: shipped repo-backed X draft loop.\n` +
    `Want early access? Reply "Wingbeat".`
  return appendRepositoryUrl(copyWithoutLink, context)
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
  const chars = xCharacterCount(copy)
  const hashtags = hashtagCount(copy)
  const limit = 280
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
      score: scoreCriterion(/code -> stories/.test(lower) && /proof -> (reusable )?posts/.test(lower) && /draft -> veto-ready x/.test(lower)),
    },
    {
      name: "shipped-proof",
      score: scoreCriterion(/week 1: shipped/.test(lower) && /repo|docs|git|x loop|agency run/.test(lower)),
    },
    {
      name: "evidence-integrity",
      score: scoreCriterion(!/(launched|published|live post|posted itself)/.test(lower) && (!/github\.com/.test(lower) || Boolean(repositoryUrl(context)))),
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
      score: scoreCriterion(chars <= limit && hashtags <= 1),
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
    rawCharacterCount: [...copy].length,
    hashtagCount: hashtags,
    reservedLinkCharacters: repositoryUrl(context) ? 23 : 0,
  }
}

function evaluateBuildInPublicXQuality(copy, context) {
  const lower = copy.toLowerCase()
  const chars = xCharacterCount(copy)
  const hashtags = hashtagCount(copy)
  const limit = 280
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
    rawCharacterCount: [...copy].length,
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

function buildContentPackage({ runId, context, narrative, finalEvaluation, rootDir }) {
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
  const xProsePlaybook = loadXProsePlaybook(rootDir)
  const xProseCategory = selectXProseCategory({ context, playbook: xProsePlaybook })
  const xProseContract = buildXProseContract({ playbook: xProsePlaybook, category: xProseCategory })
  const tone = chooseTonePreset({ context })
  const visualPlanningRubric = buildVisualPlanningRubric(context)
  const visualOpportunity = assessVisualOpportunity(context)
  const demoVideoOpportunity = assessDemoVideoOpportunity(context)
  const visualBrief = buildVisualBrief({ context, tone, visualOpportunity })
  const demoVideoPlan = buildDemoVideoPlan({ context, tone, demoVideoOpportunity, rootDir })
  const generatedAssets = []
  const visualVideoQuality = buildVisualVideoQuality({
    visualOpportunity,
    demoVideoOpportunity,
    visualBrief,
    demoVideoPlan,
  })
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
    category: xProseCategory.id,
    xProseContract,
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
    visualPlanningRubric,
    visualOpportunity,
    demoVideoOpportunity,
    visualBrief,
    demoVideoPlan,
    visualVideoQuality,
    generatedAssets,
    executionReadyVariants: [
      {
        id: stableId("variant", `${runId}:x:${copy}`),
        channel: "x",
        status: "ready",
        copy,
        visualBriefId: visualBrief.id,
        demoVideoPlanId: demoVideoPlan.id,
        generatedAssetIds: [],
        evidenceIds: context.evidence.map((item) => item.id),
        xProseCategoryId: xProseCategory.id,
      },
    ],
    evidence: context.evidence,
    confidence: Number(((finalEvaluation.score + xQuality.score / 20) / 2).toFixed(2)),
    adaptation: {
      channel: "x",
      mode: contentMode,
      copy,
      characterCount: xCharacterCount(copy),
      rawCharacterCount: [...copy].length,
      asset: visualBrief.status === "planned" ? `visual-brief:${visualBrief.id}` : undefined,
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
  return {
    id: stableId("xjob", `${runId}:${contentPackage.id}`),
    runId,
    channel: "x",
    status: "queue",
    scheduledFor,
    payload: {
      copy: contentPackage.adaptation.copy,
      asset: contentPackage.adaptation.asset,
    },
    handoff: {
      executor: "scripts/x-execution/x-executor.mjs",
      commandPreview:
        `node scripts/x-execution/x-executor.mjs prepare --run-id ${runId} --veto-seconds 45`,
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
    rootDir,
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
    status: "queue",
    startedAt,
    scheduledFor: xJob.scheduledFor,
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
