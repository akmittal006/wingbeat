import type {
  AgencyRun,
  AgentNode,
  AgentRole,
  ContextEnvelope,
  ContentPackage,
  Evidence,
  ExecutionJob,
  MemoryReference,
  Policy,
  ProjectContext,
  PublishReceipt,
  SourceEvent,
  TraceEvent,
} from "../types"
import { createContextEnvelope } from "../lib/memory"

const projectContext: ProjectContext = {
  id: "project-wingbeat",
  name: "Wingbeat",
  repoPath: "/Users/ankurmittal/Documents/wingbeat",
  description:
    "A dynamic AI marketing agency that turns real product work into reusable stories, assets, and published posts.",
  positioning:
    "For technical builders who need consistent marketing without turning every product milestone into manual campaign work.",
  primaryAudience: {
    id: "aud-builders",
    label: "Technical product builders",
    segment: "Indie developers, developer-tool startups, and small product teams",
    pain: "Meaningful progress happens in code and notes but rarely becomes credible public marketing.",
    desiredOutcome: "Keep a publishing cadence that is specific, source-backed, and beautiful.",
  },
  links: [
    { label: "Local repo", href: "/Users/ankurmittal/Documents/wingbeat", kind: "repo" },
    { label: "Product concept", href: "docs/product-concept.md", kind: "docs" },
  ],
}

export const agentRoles: AgentRole[] = [
  {
    id: "role-manager",
    name: "Hermes Agency Manager",
    job: "Assemble the specialist crew, own the objective, and keep the run moving through publish.",
    dynamic: false,
    tools: [
      { id: "tool-repo", label: "Repository reader", kind: "repo", enabled: true },
      { id: "tool-eval", label: "Evaluation gate", kind: "evaluation", enabled: true },
    ],
    guardrails: ["Only use source-backed claims", "Escalate or revise failed evaluation checks"],
  },
  {
    id: "role-story",
    name: "Story Detector",
    job: "Convert source events into credible build-in-public narratives.",
    dynamic: false,
    tools: [{ id: "tool-repo", label: "Repository reader", kind: "repo", enabled: true }],
    guardrails: ["Do not publish raw commit summaries", "Preserve uncertainty in claims"],
  },
  {
    id: "role-critic",
    name: "Editor / Critic",
    job: "Evaluate accuracy, specificity, repetition, and channel fit before execution.",
    dynamic: false,
    tools: [{ id: "tool-eval", label: "Evaluation gate", kind: "evaluation", enabled: true }],
    guardrails: ["Fail vague copy", "Require evidence for product claims"],
  },
  {
    id: "role-mockup",
    name: "Product Mockup Specialist",
    job: "Create deterministic branded-card assets when a story needs visual proof.",
    dynamic: true,
    tools: [{ id: "tool-renderer", label: "Branded card renderer", kind: "renderer", enabled: true }],
    guardrails: ["Use templates instead of live generative imagery", "Keep asset text source-backed"],
  },
  {
    id: "role-x",
    name: "X Execution Agent",
    job: "Notify, wait through the veto window, publish, verify, and write the receipt.",
    dynamic: false,
    tools: [
      { id: "tool-telegram", label: "Telegram notification", kind: "telegram", enabled: true },
      { id: "tool-x", label: "X posting adapter", kind: "x", enabled: true },
    ],
    guardrails: ["Respect block/edit/delay actions", "Do not mutate canonical evidence"],
  },
]

export const policy: Policy = {
  id: "policy-x-autopublish",
  channel: "x",
  autonomy: "veto_window",
  vetoWindowSeconds: 60,
  allowedCategories: ["build-in-public", "product-update", "educational"],
  blockedClaims: ["Guaranteed growth", "Unverified live integrations", "Performance claims without receipts"],
  requiredEvidenceCount: 2,
}

const memoryReferences: MemoryReference[] = [
  {
    id: "mem-current-roadmap",
    layer: "current_job",
    label: "Two-hour MVP target",
    summary:
      "Build the agency spine around one real X build-in-public loop with visible trace, evaluation, veto, and receipt.",
    source: "docs/two-hour-mvp-roadmap.md",
    updatedAt: "2026-07-12T09:15:00.000Z",
  },
  {
    id: "mem-current-scope",
    layer: "current_job",
    label: "Lane B ownership",
    summary: "Own shared schemas, seed data, trace helpers, status transitions, and publish receipts.",
    source: "delegation input",
    updatedAt: "2026-07-12T09:20:00.000Z",
  },
  {
    id: "mem-history-laws",
    layer: "project_history",
    label: "Core product laws",
    summary:
      "No meaningful progress stays private; beauty is infrastructure; remove bottlenecks, not just symptoms.",
    source: "docs/product-concept.md",
    updatedAt: "2026-07-12T08:50:00.000Z",
  },
  {
    id: "mem-history-catalog",
    layer: "project_history",
    label: "Canonical catalog",
    summary:
      "Stories, claims, assets, usage, and performance should remain channel-independent for future reuse.",
    source: "docs/product-concept.md",
    updatedAt: "2026-07-12T08:52:00.000Z",
  },
  {
    id: "mem-policy-veto",
    layer: "brand_policy",
    label: "Autonomy with veto",
    summary:
      "Send a preview with edit, delay, block, and reject controls; silence during the window means publish.",
    source: "docs/product-concept.md",
    updatedAt: "2026-07-12T08:55:00.000Z",
  },
  {
    id: "mem-policy-tone",
    layer: "brand_policy",
    label: "Build-in-public tone",
    summary:
      "Prefer decisions, trade-offs, failures, lessons, and progress over generic launch or commit-summary copy.",
    source: "docs/two-hour-mvp-roadmap.md",
    updatedAt: "2026-07-12T09:00:00.000Z",
  },
]

const contextEnvelope = createContextEnvelope(memoryReferences)

const sourceEvents: SourceEvent[] = [
  {
    id: "event-schema-freeze",
    projectId: "project-wingbeat",
    kind: "agent-observation",
    title: "Shared contract frozen for MVP lanes",
    summary:
      "Lane B turned the roadmap entities into typed objects so dashboard, runtime, and execution can share one shape.",
    occurredAt: "2026-07-12T09:28:00.000Z",
    url: "src/types.ts",
  },
  {
    id: "event-weak-draft",
    projectId: "project-wingbeat",
    kind: "test-result",
    title: "First draft failed specificity gate",
    summary:
      "The evaluator rejected broad agency claims because the copy lacked concrete source evidence and receipt language.",
    occurredAt: "2026-07-12T09:36:00.000Z",
  },
  {
    id: "event-asset-need",
    projectId: "project-wingbeat",
    kind: "agent-observation",
    title: "Visual progress story needed a deterministic asset",
    summary:
      "Manager spawned a Product Mockup Specialist because the run-detail trace is easier to trust with a branded proof card.",
    occurredAt: "2026-07-12T09:42:00.000Z",
  },
]

const evidence: Evidence[] = [
  {
    id: "ev-roadmap-entities",
    sourceEventId: "event-schema-freeze",
    source: "docs/two-hour-mvp-roadmap.md",
    label: "Lane B required entities",
    detail: "Run, AgentNode, TraceEvent, ContentPackage, EvalResult, ExecutionJob, PublishReceipt, Policy, and AgentRole.",
    confidence: 0.98,
  },
  {
    id: "ev-canonical-contract",
    sourceEventId: "event-schema-freeze",
    source: "docs/product-concept.md",
    label: "Canonical content package",
    detail: "Content intelligence is stored channel-independently before channel-specific execution agents adapt it.",
    confidence: 0.96,
  },
  {
    id: "ev-veto-contract",
    sourceEventId: "event-schema-freeze",
    source: "docs/product-concept.md",
    label: "Autonomous publishing contract",
    detail: "Preview notification includes remaining veto duration and edit, delay, block, or reject controls.",
    confidence: 0.94,
  },
  {
    id: "ev-failed-draft",
    sourceEventId: "event-weak-draft",
    source: "evaluation log",
    label: "Failed evaluation preserved",
    detail: "The first run scored 0.48 because it made unsupported claims and had no receipt.",
    confidence: 0.9,
  },
  {
    id: "ev-asset-specialist",
    sourceEventId: "event-asset-need",
    source: "trace log",
    label: "Dynamic specialist spawned",
    detail: "The manager added a Product Mockup Specialist only after the visual-progress story needed an asset.",
    confidence: 0.89,
  },
]

export const latestContentPackage: ContentPackage = {
  id: "pkg-wingbeat-typed-spine",
  projectContext,
  sourceEvents,
  evidence,
  whatChanged:
    "Wingbeat now has a typed agency spine covering runs, agents, traces, evaluations, execution jobs, receipts, and memory.",
  whyItMatters:
    "The dashboard and runtime can show the same source-backed story from detection through evaluation, veto, publish, and verification.",
  audience: projectContext.primaryAudience,
  category: "build-in-public",
  narrative:
    "The interesting part of building an AI marketing agency is not the first post. It is making the handoffs inspectable enough that the agency can learn and be trusted.",
  supportedClaims: [
    {
      id: "claim-shared-contract",
      text: "Wingbeat stores content packages separately from X-specific adaptations.",
      evidenceIds: ["ev-canonical-contract"],
      risk: "low",
    },
    {
      id: "claim-visible-trace",
      text: "Every specialist step can carry latency, token, cost, input, output, and evaluation details.",
      evidenceIds: ["ev-roadmap-entities"],
      risk: "low",
    },
    {
      id: "claim-veto",
      text: "Publishing uses a veto window where silence means the job can proceed.",
      evidenceIds: ["ev-veto-contract"],
      risk: "medium",
    },
  ],
  prohibitedClaims: [
    {
      id: "claim-no-live-proof-yet",
      text: "Do not claim real X posting is fully integrated unless a verified receipt exists.",
      evidenceIds: ["ev-veto-contract"],
      risk: "high",
    },
  ],
  hooks: [
    "The hard part of an AI marketing agency is not writing the post. It is making the agency auditable.",
    "Today Wingbeat got its spine: traces, evaluations, veto windows, receipts, and memory in one shared contract.",
    "A publish button is easy. A source-backed agency loop you can inspect is the useful part.",
  ],
  channelNeutralBody:
    "Wingbeat's MVP now treats every marketing run as an inspectable object: source events become a canonical content package, specialists add work through trace nodes, the critic can fail a weak draft, and execution writes a receipt only after notification and verification. That keeps the agency focused on credible stories instead of generic content output.",
  assetBrief: {
    id: "brief-trace-card",
    objective: "Show the agency spine as proof: detect, revise, veto, publish, verify.",
    format: "branded-card",
    instructions: "Render a compact dark card with a trace tree, pass/fail badge, and receipt strip.",
    palette: ["#111827", "#2563eb", "#22c55e", "#f97316", "#ef4444"],
    requiredText: ["Trace visible", "Evaluation passed", "Receipt verified"],
  },
  assets: [
    {
      id: "asset-trace-card",
      kind: "image",
      label: "Agency trace proof card",
      href: "/data/wingbeat-trace-card.png",
      alt: "A compact Wingbeat proof card showing a trace tree, evaluation pass, veto window, and verified receipt.",
      generatedByAgentId: "agent-mockup",
      briefId: "brief-trace-card",
    },
  ],
  confidence: 0.88,
  evaluations: [
    {
      id: "eval-weak-draft",
      runId: "run-failed-001",
      contentPackageId: "pkg-wingbeat-typed-spine-failed",
      evaluatorAgentId: "agent-critic-failed",
      evaluationSet: "x-build-in-public-gate-v1",
      passed: false,
      score: 0.48,
      createdAt: "2026-07-12T09:37:12.000Z",
      revisionRequest:
        "Replace broad agency claims with concrete schema, trace, veto, and receipt details backed by project docs.",
      capturedAsCase: {
        id: "case-unsupported-agency-claims",
        sourceRunId: "run-failed-001",
        label: "Unsupported agency claims",
        reason: "Draft described live autonomous publishing without a verified receipt.",
        capturedAt: "2026-07-12T09:37:14.000Z",
      },
      checks: [
        {
          id: "check-accuracy-failed",
          label: "Accuracy",
          status: "fail",
          score: 0.35,
          detail: "Claimed live posting before receipt verification existed.",
          evidenceIds: ["ev-failed-draft"],
        },
        {
          id: "check-specificity-failed",
          label: "Specificity",
          status: "fail",
          score: 0.41,
          detail: "Did not mention trace, evaluation, veto, or receipt mechanics.",
          evidenceIds: ["ev-failed-draft"],
        },
      ],
    },
    {
      id: "eval-pass-typed-spine",
      runId: "run-live-003",
      contentPackageId: "pkg-wingbeat-typed-spine",
      evaluatorAgentId: "agent-critic",
      evaluationSet: "x-build-in-public-gate-v1",
      passed: true,
      score: 0.91,
      createdAt: "2026-07-12T09:50:02.000Z",
      checks: [
        {
          id: "check-accuracy-pass",
          label: "Accuracy",
          status: "pass",
          score: 0.94,
          detail: "All claims tie back to product concept or roadmap evidence.",
          evidenceIds: ["ev-roadmap-entities", "ev-canonical-contract", "ev-veto-contract"],
        },
        {
          id: "check-specificity-pass",
          label: "Specificity",
          status: "pass",
          score: 0.9,
          detail: "Names the exact agency mechanics being built.",
          evidenceIds: ["ev-roadmap-entities"],
        },
        {
          id: "check-aesthetic-warn",
          label: "Aesthetic support",
          status: "warn",
          score: 0.78,
          detail: "Asset is deterministic and useful, but not yet generated from live screenshots.",
          evidenceIds: ["ev-asset-specialist"],
        },
      ],
    },
  ],
  adaptations: [
    {
      id: "adapt-x-typed-spine",
      channel: "x",
      status: "published",
      copy:
        "The hard part of an AI marketing agency is not the first post. It is the spine around it: source-backed story packages, visible specialist traces, a critic that can fail weak drafts, veto-window execution, and receipts you can inspect after publish.",
      assetIds: ["asset-trace-card"],
      callToAction: "Build the agency loop before polishing the copy.",
      createdByAgentId: "agent-strategist",
      createdAt: "2026-07-12T09:49:20.000Z",
    },
  ],
  executionHistory: [
    {
      id: "exec-record-notify",
      executionJobId: "job-x-003",
      channel: "x",
      status: "veto_window",
      at: "2026-07-12T09:50:20.000Z",
      note: "Telegram preview sent with 60-second veto window.",
    },
    {
      id: "exec-record-published",
      executionJobId: "job-x-003",
      channel: "x",
      status: "published",
      at: "2026-07-12T09:51:28.000Z",
      note: "Silence during veto window; X post published and verified.",
      receiptId: "receipt-x-003",
    },
  ],
  reuse: {
    usedChannels: ["x"],
    availableFor: ["reddit"],
    lastUsedAt: "2026-07-12T09:51:28.000Z",
  },
}

const failedContentPackage: ContentPackage = {
  ...latestContentPackage,
  id: "pkg-wingbeat-typed-spine-failed",
  confidence: 0.44,
  narrative:
    "Wingbeat can now autonomously market any project end to end with beautiful assets and live publishing.",
  supportedClaims: latestContentPackage.supportedClaims.slice(0, 1),
  assets: [],
  adaptations: [
    {
      id: "adapt-x-failed",
      channel: "x",
      status: "rejected",
      copy:
        "Wingbeat is a fully autonomous AI agency that turns every product change into perfect marketing across every channel.",
      assetIds: [],
      createdByAgentId: "agent-strategist-failed",
      createdAt: "2026-07-12T09:36:40.000Z",
    },
  ],
  executionHistory: [],
}

const latestAgents: AgentNode[] = [
  agent("agent-manager", undefined, "role-manager", "Hermes Agency Manager", "Select specialists and own the run.", "passed", 1600, 0.0132, 4200, contextEnvelope, "Spawned story, critic, mockup, and X execution agents."),
  agent("agent-story", "agent-manager", "role-story", "Story Detector", "Find the source-backed build-in-public angle.", "passed", 1380, 0.0098, 3100, contextEnvelope, "Selected the typed agency spine as the credible story."),
  agent("agent-critic", "agent-manager", "role-critic", "Editor / Critic", "Evaluate the revised X adaptation.", "passed", 940, 0.0067, 1900, contextEnvelope, "Passed the revised copy with one asset-quality warning."),
  agent("agent-mockup", "agent-manager", "role-mockup", "Product Mockup Specialist", "Create deterministic proof-card brief.", "passed", 680, 0.0024, 1400, contextEnvelope, "Produced branded-card requirements for the dashboard renderer."),
  agent("agent-x", "agent-manager", "role-x", "X Execution Agent", "Notify, publish after veto, verify, and receipt.", "passed", 1180, 0.0056, 7300, contextEnvelope, "Recorded verified publish receipt."),
]

const latestEvents: TraceEvent[] = [
  event("trace-start", "run-live-003", "agent-manager", "run_started", "Run started", "Cron deadline triggered build-in-public story selection.", 320),
  event("trace-story", "run-live-003", "agent-story", "handoff", "Story selected", "Story Detector chose the shared agency spine based on roadmap entities.", 1380, 3100, 0.0098),
  event("trace-fail-reference", "run-live-003", "agent-critic", "revision", "Prior failure loaded", "Critic loaded the preserved failed run to avoid unsupported autonomy claims.", 240),
  event("trace-mockup", "run-live-003", "agent-mockup", "tool", "Asset brief generated", "Dynamic mockup specialist produced deterministic branded-card requirements.", 680, 1400, 0.0024),
  event("trace-eval-pass", "run-live-003", "agent-critic", "evaluation", "Evaluation passed", "x-build-in-public-gate-v1 passed at 0.91.", 940, 1900, 0.0067),
  event("trace-notify", "run-live-003", "agent-x", "notification", "Veto notification sent", "Telegram preview sent with edit, delay, block, and reject controls.", 430, 900, 0.0011),
  event("trace-publish", "run-live-003", "agent-x", "publish", "Published after silence", "Veto window expired without action; X adapter published the approved copy.", 620, 2100, 0.0023),
  event("trace-receipt", "run-live-003", "agent-x", "receipt", "Receipt verified", "Live post identifier and URL were recorded.", 130, 700, 0.0009),
]

const latestExecutionJob: ExecutionJob = {
  id: "job-x-003",
  runId: "run-live-003",
  contentPackageId: "pkg-wingbeat-typed-spine",
  adaptationId: "adapt-x-typed-spine",
  channel: "x",
  status: "published",
  scheduledFor: "2026-07-12T09:50:00.000Z",
  vetoWindowSeconds: 60,
  vetoEndsAt: "2026-07-12T09:51:20.000Z",
  receiptId: "receipt-x-003",
  notification: {
    id: "notify-telegram-003",
    provider: "telegram",
    recipient: "@ankur",
    sentAt: "2026-07-12T09:50:20.000Z",
    preview: latestContentPackage.adaptations[0].copy,
    actions: [
      { id: "veto-edit", label: "edit", status: "expired" },
      { id: "veto-delay", label: "delay", status: "expired" },
      { id: "veto-block", label: "block", status: "expired" },
      { id: "veto-reject", label: "reject_angle", status: "expired" },
    ],
  },
}

const latestReceipt: PublishReceipt = {
  id: "receipt-x-003",
  executionJobId: "job-x-003",
  channel: "x",
  status: "verified",
  publishedAt: "2026-07-12T09:51:28.000Z",
  verifiedAt: "2026-07-12T09:51:34.000Z",
  postId: "demo-typed-spine-003",
  url: "https://x.com/wingbeat_demo/status/demo-typed-spine-003",
  account: "@wingbeat_demo",
  preview: latestContentPackage.adaptations[0].copy,
  verificationLog: ["posted copy matched approved adaptation", "post id returned", "public URL resolved"],
}

export const latestRun: AgencyRun = {
  id: "run-live-003",
  project: "Wingbeat",
  trigger: "Daily build-in-public deadline",
  status: "published",
  startedAt: "2026-07-12T09:45:10.000Z",
  finishedAt: "2026-07-12T09:51:34.000Z",
  scheduledFor: "2026-07-12T09:50:00.000Z",
  vetoEndsAt: "2026-07-12T09:51:20.000Z",
  publishedUrl: latestReceipt.url,
  package: toDashboardPackage(latestContentPackage),
  contentPackage: latestContentPackage,
  agents: latestAgents,
  events: latestEvents,
  executionJobs: [latestExecutionJob],
  receipts: [latestReceipt],
  policy,
}

export const failedRun: AgencyRun = {
  id: "run-failed-001",
  project: "Wingbeat",
  trigger: "First ugly vertical slice rehearsal",
  status: "failed",
  startedAt: "2026-07-12T09:34:20.000Z",
  finishedAt: "2026-07-12T09:37:14.000Z",
  scheduledFor: "2026-07-12T09:36:00.000Z",
  package: toDashboardPackage(failedContentPackage),
  contentPackage: failedContentPackage,
  agents: [
    agent("agent-manager-failed", undefined, "role-manager", "Hermes Agency Manager", "Attempt first vertical slice.", "failed", 800, 0.0053, 2100, contextEnvelope, "Sent vague draft to critic too early."),
    agent("agent-critic-failed", "agent-manager-failed", "role-critic", "Editor / Critic", "Evaluate first X draft.", "failed", 620, 0.0041, 1600, contextEnvelope, "Failed unsupported autonomy and specificity checks."),
  ],
  events: [
    event("trace-failed-start", "run-failed-001", "agent-manager-failed", "run_started", "Failed run started", "First vertical slice generated an overbroad draft.", 280),
    event("trace-failed-eval", "run-failed-001", "agent-critic-failed", "evaluation", "Evaluation failed", "Draft scored 0.48 and was captured as a regression case.", 620, 1600, 0.0041),
    event("trace-failed-alert", "run-failed-001", "agent-critic-failed", "alert", "Unsupported claim alert", "Copy claimed live autonomous publishing without a verified receipt.", 90),
  ],
  executionJobs: [
    {
      id: "job-x-failed-001",
      runId: "run-failed-001",
      contentPackageId: "pkg-wingbeat-typed-spine-failed",
      adaptationId: "adapt-x-failed",
      channel: "x",
      status: "failed",
      scheduledFor: "2026-07-12T09:36:00.000Z",
      vetoWindowSeconds: 60,
      failureReason: "Evaluation gate blocked unsupported claims before notification.",
    },
  ],
  receipts: [
    {
      id: "receipt-x-failed-001",
      executionJobId: "job-x-failed-001",
      channel: "x",
      status: "failed",
      preview: failedContentPackage.adaptations[0].copy,
      verificationLog: ["publish skipped because evaluation failed"],
      error: "Blocked by x-build-in-public-gate-v1.",
    },
  ],
  policy,
}

export const overdueRun: AgencyRun = {
  ...latestRun,
  id: "run-overdue-002",
  trigger: "Laptop offline during scheduled deadline",
  status: "overdue",
  startedAt: "2026-07-12T09:39:00.000Z",
  finishedAt: undefined,
  vetoEndsAt: undefined,
  publishedUrl: undefined,
  executionJobs: [
    {
      ...latestExecutionJob,
      id: "job-x-overdue-002",
      runId: "run-overdue-002",
      status: "overdue",
      scheduledFor: "2026-07-12T09:40:00.000Z",
      vetoEndsAt: undefined,
      receiptId: undefined,
      notification: undefined,
    },
  ],
  receipts: [],
  events: [
    event("trace-overdue-start", "run-overdue-002", "agent-manager", "run_started", "Deadline detected", "Scheduled job found after device wake.", 210),
    event("trace-overdue-transition", "run-overdue-002", "agent-x", "status_transition", "Marked overdue", "Job is overdue rather than cancelled; recovery notification pending.", 120),
  ],
}

export const runs: AgencyRun[] = [latestRun, overdueRun, failedRun]

function agent(
  id: string,
  parentId: string | undefined,
  roleId: string,
  role: string,
  objective: string,
  status: AgentNode["status"],
  latencyMs: number,
  costUsd: number,
  tokens: number,
  envelope: ContextEnvelope,
  output: string,
): AgentNode {
  return {
    id,
    parentId,
    roleId,
    role,
    objective,
    status,
    startedAt: "2026-07-12T09:45:10.000Z",
    finishedAt: "2026-07-12T09:51:34.000Z",
    latencyMs,
    costUsd,
    tokens,
    input: objective,
    output,
    contextEnvelope: envelope,
  }
}

function toDashboardPackage(contentPackage: ContentPackage): AgencyRun["package"] {
  const adaptation = contentPackage.adaptations.find((item) => item.channel === "x") ?? contentPackage.adaptations[0]
  const asset = adaptation?.assetIds[0]
    ? contentPackage.assets.find((item) => item.id === adaptation.assetIds[0])?.label
    : undefined

  return {
    id: contentPackage.id,
    project: contentPackage.projectContext.name,
    category: contentPackage.category,
    whatChanged: contentPackage.whatChanged,
    whyItMatters: contentPackage.whyItMatters,
    audience: contentPackage.audience.label,
    narrative: contentPackage.narrative,
    supportedClaims: contentPackage.supportedClaims.map((claim) => claim.text),
    prohibitedClaims: contentPackage.prohibitedClaims.map((claim) => claim.text),
    hooks: contentPackage.hooks,
    channelNeutralBody: contentPackage.channelNeutralBody,
    evidence: contentPackage.evidence,
    confidence: contentPackage.confidence,
    adaptation: {
      channel: "x",
      copy: adaptation?.copy ?? "",
      asset,
    },
  }
}

function event(
  id: string,
  runId: string,
  agentId: string,
  type: TraceEvent["type"],
  title: string,
  detail: string,
  latencyMs: number,
  tokens?: number,
  costUsd?: number,
): TraceEvent {
  return {
    id,
    runId,
    agentId,
    at: "2026-07-12T09:50:00.000Z",
    type,
    title,
    detail,
    latencyMs,
    tokens,
    costUsd,
  }
}
