import type {
  AgencyRun,
  AgentRole,
  ContentPackage,
  ExecutionJob,
  Policy,
  ProjectContext,
  RuntimeContextReference,
} from "../types"

const projectContext: ProjectContext = {
  id: "project-wingbeat",
  name: "Wingbeat",
  repoPath: "/Users/ankurmittal/Documents/wingbeat",
  description:
    "A dynamic AI marketing agency that turns real product work into reusable stories, assets, and channel handoffs.",
  positioning:
    "For technical builders who need consistent marketing without turning each product milestone into manual campaign work.",
  primaryAudience: {
    id: "aud-builders",
    label: "Technical product builders",
    segment: "Indie developers, developer-tool startups, and small product teams",
    pain: "Meaningful progress happens in code and notes but rarely becomes credible public marketing.",
    desiredOutcome: "Keep a publishing cadence that is specific, source-backed, and inspectable.",
  },
  links: [
    { label: "Local repo", href: "/Users/ankurmittal/Documents/wingbeat", kind: "repo" },
    { label: "Product concept", href: "docs/product-concept.md", kind: "docs" },
    { label: "MVP roadmap", href: "docs/two-hour-mvp-roadmap.md", kind: "docs" },
  ],
}

export const agentRoles: AgentRole[] = [
  {
    id: "role-manager",
    name: "Hermes Agency Manager",
    job: "Assemble the specialist crew, own the objective, and keep the run moving toward a truthful execution boundary.",
    dynamic: false,
    tools: [
      { id: "tool-repo", label: "Repository reader", kind: "repo", enabled: true },
      { id: "tool-eval", label: "Evaluation gate", kind: "evaluation", enabled: true },
    ],
    guardrails: ["Only use source-backed claims", "Do not mark a run published without a verified receipt"],
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
    guardrails: ["Fail vague copy", "Require evidence for product and publishing claims"],
  },
  {
    id: "role-x",
    name: "X Channel Adapter",
    job: "Convert canonical package copy into an X-native payload without claiming live publish.",
    dynamic: false,
    tools: [{ id: "tool-x", label: "X handoff adapter", kind: "x", enabled: true }],
    guardrails: ["Do not mutate canonical evidence", "Receipt is owned by the external executor"],
  },
]

export const policy: Policy = {
  id: "policy-x-veto-boundary",
  channel: "x",
  autonomy: "veto_window",
  vetoWindowSeconds: 45,
  allowedCategories: ["build-in-public", "product-update", "educational"],
  blockedClaims: ["Guaranteed growth", "Verified live publish without receipt", "Performance claims without analytics"],
  requiredEvidenceCount: 2,
}

const contextReferences: RuntimeContextReference[] = [
  {
    id: "ctx-current-job",
    layer: "current_job",
    source: "runtime fixture",
    label: "Current agency objective",
    digest: "f8ce2a590f",
    excerpt: "Market the Wingbeat repository itself with a build-in-public story.",
  },
  {
    id: "ctx-project-history",
    layer: "project_history",
    source: "git log/status",
    label: "Recent repository movement",
    digest: "21964ef797",
    excerpt: "Docs, runtime, UI, and safe browser X executor work are present in the current worktree.",
  },
  {
    id: "ctx-brand-policy",
    layer: "brand_policy",
    source: "docs/product-concept.md",
    label: "Wingbeat product laws and publishing policy",
    digest: "9264429687",
    excerpt:
      "Content must be source-backed, channel-independent, and published only through a vetoable execution contract.",
  },
]

export const latestContentPackage: ContentPackage = {
  id: "pkg-runtime-handoff",
  projectContext,
  sourceEvents: [
    {
      id: "event-runtime-handoff",
      projectId: "project-wingbeat",
      kind: "agent-observation",
      title: "Runtime produced a UI-consumable X handoff",
      summary:
        "The runtime inspected docs and repo state, selected a conditional crew, revised a weak draft, and prepared a veto-window X handoff.",
      occurredAt: "2026-07-12T06:30:00.052Z",
      url: "public/data/latest-run.json",
    },
  ],
  evidence: [
    {
      id: "evidence-doc-1",
      source: "docs/product-concept.md",
      label: "Product concept",
      detail: "Wingbeat is defined as a dynamic AI marketing agency with channel-independent content and a veto contract.",
    },
    {
      id: "evidence-doc-2",
      source: "docs/two-hour-mvp-roadmap.md",
      label: "MVP roadmap",
      detail: "The MVP calls for dynamic crew selection, revision, context layers, trace, cost, latency, and a UI-consumable run.",
    },
    {
      id: "evidence-doc-3",
      source: "docs/browser-x-executor.md",
      label: "Safe X executor boundary",
      detail:
        "The browser executor prepares a payload and records a receipt only after live post verification.",
    },
  ],
  whatChanged:
    "Wingbeat produced a runtime run package that is ready for veto-window X execution handoff.",
  whyItMatters:
    "The UI can show draft failure, revision, context, crew selection, and execution state without pretending a live post already exists.",
  audience: projectContext.primaryAudience,
  category: "build-in-public",
  narrative:
    "Wingbeat crossed from product concept into an inspectable agency runtime: repo inspection, conditional specialists, critic revision, and a vetoable X handoff.",
  supportedClaims: [
    {
      id: "claim-runtime-handoff",
      text: "The current run prepared an X execution handoff, not a verified live post.",
      evidenceIds: ["evidence-doc-3"],
      risk: "low",
    },
    {
      id: "claim-revision",
      text: "The runtime preserved a weak-draft failure and revised it into a passing draft.",
      evidenceIds: ["evidence-doc-2"],
      risk: "low",
    },
  ],
  prohibitedClaims: [
    {
      id: "claim-no-published-receipt",
      text: "Do not claim a live X post was published unless an external receipt exists.",
      evidenceIds: ["evidence-doc-3"],
      risk: "high",
    },
  ],
  hooks: [
    "The post is the last step, not the product.",
    "Wingbeat is turning marketing into inspectable infrastructure.",
    "Today the agency stopped being a diagram and started producing runs.",
  ],
  channelNeutralBody:
    "Today Wingbeat crossed from product concept into an inspectable agency runtime. The manager reads the repo, assembles specialists only when the work calls for them, and turns evidence from docs and git into a reusable content package before any X-specific copy exists.",
  assets: [],
  confidence: 0.92,
  evaluations: [
    {
      id: "eval-weak-draft-runtime",
      runId: "run-runtime-handoff",
      contentPackageId: "pkg-runtime-handoff",
      evaluatorAgentId: "agent-critic",
      evaluationSet: "source-backed-build-in-public-gate",
      passed: false,
      score: 0.26,
      createdAt: "2026-07-12T06:30:00.052Z",
      revisionRequest:
        "Remove overbroad audience and automation claims; name the veto-boundary and observability mechanics.",
      checks: [
        {
          id: "check-overbroad-audience",
          label: "Audience scope",
          status: "fail",
          score: 0.2,
          detail: "The weak draft claimed Wingbeat helps everyone market everything automatically.",
          evidenceIds: ["evidence-doc-1"],
        },
      ],
    },
    {
      id: "eval-revised-runtime",
      runId: "run-runtime-handoff",
      contentPackageId: "pkg-runtime-handoff",
      evaluatorAgentId: "agent-critic",
      evaluationSet: "source-backed-build-in-public-gate",
      passed: true,
      score: 0.92,
      createdAt: "2026-07-12T06:30:00.052Z",
      checks: [
        {
          id: "check-source-backed",
          label: "Source-backed",
          status: "pass",
          score: 0.92,
          detail: "The revised draft is specific, source-backed, and suitable for X handoff.",
          evidenceIds: ["evidence-doc-1", "evidence-doc-2", "evidence-doc-3"],
        },
      ],
    },
  ],
  adaptations: [
    {
      id: "adapt-x-runtime",
      channel: "x",
      status: "approved",
      copy:
        "Today Wingbeat got its agency spine: repo inspection, conditional specialists, source-backed content, critic revision, and an X handoff with a veto window.\n\nThe principle: marketing output should emerge from inspectable infrastructure-not a posting prompt.\n\n#BuildInPublic",
      assetIds: [],
      createdByAgentId: "agent-x-adapter",
      createdAt: "2026-07-12T06:30:00.052Z",
    },
  ],
  executionHistory: [
    {
      id: "exec-handoff-ready",
      executionJobId: "xjob-runtime-handoff",
      channel: "x",
      status: "veto_window",
      at: "2026-07-12T06:30:00.052Z",
      note: "Runtime produced X copy and veto-window metadata; browser executor owns live posting and receipt.",
    },
  ],
  reuse: {
    usedChannels: [],
    availableFor: ["x", "reddit"],
  },
}

const latestExecutionJob: ExecutionJob = {
  id: "xjob-runtime-handoff",
  runId: "run-runtime-handoff",
  contentPackageId: "pkg-runtime-handoff",
  adaptationId: "adapt-x-runtime",
  channel: "x",
  status: "veto_window",
  executionPhase: "handoff_ready",
  scheduledFor: "2026-07-12T06:31:00.052Z",
  vetoWindowSeconds: 45,
  vetoEndsAt: "2026-07-12T06:30:45.052Z",
  payload: {
    copy: latestContentPackage.adaptations[0].copy,
    asset: "deterministic-card:agency-trace",
  },
  handoff: {
    executor: "scripts/x-execution/x-executor.mjs",
    commandPreview:
      "node scripts/x-execution/x-executor.mjs prepare --run-id run-runtime-handoff --copy-file <copy-file> --veto-seconds 45",
  },
}

export const latestRun: AgencyRun = {
  id: "run-runtime-handoff",
  project: "wingbeat",
  trigger: "manual-demo",
  status: "veto_window",
  dataOrigin: "runtime",
  startedAt: "2026-07-12T06:29:59.994Z",
  finishedAt: "2026-07-12T06:30:00.052Z",
  scheduledFor: "2026-07-12T06:31:00.052Z",
  vetoEndsAt: "2026-07-12T06:30:45.052Z",
  package: toDashboardPackage(latestContentPackage),
  contentPackage: latestContentPackage,
  agents: [
    agent("agent-manager", undefined, "Agency Manager", "Market the Wingbeat repository itself with a build-in-public story.", "passed", 58, 0.006976, 1744),
    agent("agent-intel", "agent-manager", "Project Intelligence", "Summarize the repo-backed facts and implementation surface.", "passed", 16, 0.00036, 90),
    agent("agent-story", "agent-manager", "Story Detector", "Find the strongest build-in-public story supported by project evidence.", "passed", 11, 0.000252, 63),
    agent("agent-critic", "agent-manager", "Editor / Critic", "Check accuracy, specificity, repetition, and brand fit.", "passed", 0, 0.000132, 33),
    agent("agent-x-adapter", "agent-manager", "X Channel Adapter", "Convert canonical package into an X-native payload.", "passed", 0, 0.000324, 81),
  ],
  events: [
    event("evt-runtime-start", "run-runtime-handoff", "agent-manager", "spawn", "Agency manager started", "Inspecting docs, git, current job, and brand policy."),
    event("evt-runtime-weak", "run-runtime-handoff", "agent-manager", "evaluation", "Weak draft evaluated", "failed at 0.26"),
    event("evt-runtime-revision", "run-runtime-handoff", "agent-manager", "revision", "Manager revision requested", "Overbroad audience claim. Publishing claim lacks veto-boundary context."),
    event("evt-runtime-pass", "run-runtime-handoff", "agent-critic", "evaluation", "Revised package evaluated", "passed at 0.92"),
    event("evt-runtime-handoff", "run-runtime-handoff", "agent-x-adapter", "publish", "Execution handoff prepared", latestExecutionJob.handoff?.commandPreview ?? "handoff prepared"),
  ],
  executionJobs: [latestExecutionJob],
  executionJob: latestExecutionJob,
  receipts: [],
  policy,
  contextReferences,
  selectedCrew: ["Project Intelligence", "Story Detector", "Editor / Critic", "X Channel Adapter"],
  evaluation: {
    weakDraft: {
      text: "We made Wingbeat better today. It has agents, content, and publishing, and it will help everyone market everything automatically.",
      result: {
        id: "eval-weak-draft-runtime",
        name: "source-backed-build-in-public-gate",
        passed: false,
        score: 0.26,
        findings: [
          "Overbroad audience claim.",
          "Publishing claim lacks veto-boundary context.",
          "Autonomy claim lacks observability or inspection detail.",
        ],
      },
    },
    revisedDraft: {
      text: latestContentPackage.channelNeutralBody,
      result: {
        id: "eval-revised-runtime",
        name: "source-backed-build-in-public-gate",
        passed: true,
        score: 0.92,
        findings: ["Specific, source-backed, and suitable for revision into X copy."],
      },
    },
  },
  metrics: {
    totalLatencyMs: 58,
    totalEstimatedCostUsd: 0.008044,
    agentCount: 5,
    traceEventCount: 5,
  },
}

const failedFixturePackage: ContentPackage = {
  ...latestContentPackage,
  id: "pkg-fixture-failed-overclaim",
  confidence: 0.26,
  narrative:
    "Historical fixture: a weak draft overclaimed audience scope and implied autonomous publishing without receipt proof.",
  supportedClaims: latestContentPackage.supportedClaims.slice(0, 1),
  prohibitedClaims: latestContentPackage.prohibitedClaims,
  adaptations: [
    {
      id: "adapt-fixture-failed",
      channel: "x",
      status: "rejected",
      copy:
        "We made Wingbeat better today. It has agents, content, and publishing, and it will help everyone market everything automatically.",
      assetIds: [],
      createdByAgentId: "agent-fixture-strategist",
      createdAt: "2026-07-12T06:29:59.000Z",
    },
  ],
  executionHistory: [],
}

export const failedRun: AgencyRun = {
  id: "fixture-failed-overclaim-001",
  project: "wingbeat",
  trigger: "historical-fixture",
  status: "failed",
  dataOrigin: "fixture",
  fixtureLabel: "Historical failed draft fixture; not a real publish attempt",
  startedAt: "2026-07-12T06:29:59.000Z",
  finishedAt: "2026-07-12T06:30:00.000Z",
  package: toDashboardPackage(failedFixturePackage),
  contentPackage: failedFixturePackage,
  agents: [
    agent("agent-fixture-manager", undefined, "Agency Manager", "Preserve a failed draft for UI comparison.", "failed", 12, 0, 0),
    agent("agent-fixture-critic", "agent-fixture-manager", "Editor / Critic", "Reject unsupported claims.", "failed", 8, 0, 0),
  ],
  events: [
    event("evt-fixture-failed", "fixture-failed-overclaim-001", "agent-fixture-critic", "evaluation", "Historical fixture failed", "Weak draft failed at 0.26 before notification or publish."),
  ],
  executionJobs: [
    {
      id: "xjob-fixture-failed",
      runId: "fixture-failed-overclaim-001",
      contentPackageId: "pkg-fixture-failed-overclaim",
      adaptationId: "adapt-fixture-failed",
      channel: "x",
      status: "failed",
      scheduledFor: "2026-07-12T06:30:00.000Z",
      vetoWindowSeconds: 45,
      failureReason: "Historical fixture blocked by evaluation gate before execution handoff.",
    },
  ],
  receipts: [],
  policy,
}

export const overdueRun: AgencyRun = {
  ...latestRun,
  id: "fixture-overdue-recovery-001",
  trigger: "historical-fixture",
  status: "overdue",
  dataOrigin: "fixture",
  fixtureLabel: "Historical overdue recovery fixture; not current runtime output",
  startedAt: "2026-07-12T06:31:00.000Z",
  finishedAt: undefined,
  vetoEndsAt: undefined,
  executionJobs: [
    {
      ...latestExecutionJob,
      id: "xjob-fixture-overdue",
      runId: "fixture-overdue-recovery-001",
      status: "overdue",
      receiptId: undefined,
      notification: undefined,
    },
  ],
  executionJob: {
    ...latestExecutionJob,
    id: "xjob-fixture-overdue",
    runId: "fixture-overdue-recovery-001",
    status: "overdue",
  },
  receipts: [],
}

export const runs: AgencyRun[] = [latestRun, overdueRun, failedRun]

function agent(
  id: string,
  parentId: string | undefined,
  role: string,
  objective: string,
  status: AgencyRun["agents"][number]["status"],
  latencyMs: number,
  costUsd: number,
  tokens: number,
): AgencyRun["agents"][number] {
  return {
    id,
    parentId,
    role,
    objective,
    status,
    startedAt: "2026-07-12T06:30:00.000Z",
    finishedAt: "2026-07-12T06:30:00.052Z",
    latencyMs,
    costUsd,
    tokens,
    output: objective,
  }
}

function event(
  id: string,
  runId: string,
  agentId: string,
  type: AgencyRun["events"][number]["type"],
  title: string,
  detail: string,
): AgencyRun["events"][number] {
  return {
    id,
    runId,
    agentId,
    at: "2026-07-12T06:30:00.052Z",
    type,
    title,
    detail,
  }
}

function toDashboardPackage(contentPackage: ContentPackage): AgencyRun["package"] {
  const adaptation = contentPackage.adaptations.find((item) => item.channel === "x") ?? contentPackage.adaptations[0]

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
    },
    evaluations: contentPackage.evaluations.map((evaluation) => ({
      id: evaluation.id,
      name: evaluation.evaluationSet,
      passed: evaluation.passed,
      score: evaluation.score,
      findings: evaluation.checks.map((check) => check.detail),
    })),
    contextReferences,
    executionHistory: contentPackage.executionHistory.map((record) => ({
      id: record.id,
      channel: record.channel,
      status: record.status,
      detail: record.note,
    })),
  }
}
