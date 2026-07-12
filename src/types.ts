export type Channel = "x" | "reddit"

export type ContentCategory = string

export type RunStatus =
  | "running"
  | "in_review"
  | "veto_window"
  | "overdue"
  | "published"
  | "blocked"
  | "failed"
  | "queue"
  | "veto"
  | "ready"

export type ExecutionJobStatus =
  | "draft"
  | "scheduled"
  | "notifying"
  | "veto_window"
  | "publishing"
  | "published"
  | "blocked"
  | "failed"
  | "overdue"
  | "queue"
  | "veto"
  | "ready"

export type AgentStatus =
  | "queued"
  | "working"
  | "passed"
  | "revising"
  | "failed"

export type TraceEventType =
  | "run_started"
  | "spawn"
  | "tool"
  | "handoff"
  | "evaluation"
  | "revision"
  | "notification"
  | "status_transition"
  | "publish"
  | "receipt"
  | "alert"

export type EvalCheckStatus = "pass" | "warn" | "fail"

export type MemoryLayer = "current_job" | "project_history" | "brand_policy"

export type PublishReceiptStatus = "verified" | "pending" | "failed"

export type RunDataOrigin = "runtime"

export type ExecutionPhase = "draft_evaluated" | "revision_passed" | "handoff_ready" | "receipt_verified"

export interface ProjectContext {
  id: string
  name: string
  repoPath: string
  description: string
  positioning: string
  primaryAudience: Audience
  links: ProjectLink[]
}

export interface ProjectLink {
  label: string
  href: string
  kind: "repo" | "dashboard" | "docs" | "post" | "asset"
}

export interface Audience {
  id: string
  label: string
  segment: string
  pain: string
  desiredOutcome: string
}

export interface SourceEvent {
  id: string
  projectId: string
  kind: "commit" | "manual-note" | "cron" | "issue" | "agent-observation" | "test-result"
  title: string
  summary: string
  occurredAt: string
  url?: string
  metadata?: Record<string, string | number | boolean>
}

export interface Evidence {
  id: string
  sourceEventId?: string
  source: string
  label: string
  detail: string
  url?: string
  confidence?: number
}

export interface Claim {
  id: string
  text: string
  evidenceIds: string[]
  risk: "low" | "medium" | "high"
}

export interface AssetBrief {
  id: string
  objective: string
  format: "none" | "branded-card" | "screenshot" | "demo-video" | "ui-flow" | "short-demo-video"
  instructions: string
  palette: string[]
  requiredText: string[]
}

export type VisualTonePreset =
  | "default"
  | "polished"
  | "yc-parody"
  | "chaotic"
  | "deadpan"
  | "cinematic"
  | "app-store"

export type MarketingAssetStatus = "not_applicable" | "planned" | "blocked" | "ready" | "rendered"

export interface ProjectVisualPlanningAnswer {
  id: string
  question: string
  answer: string
  evidenceIds: string[]
}

export interface MarketingOpportunityAssessment {
  id: string
  kind: "visual" | "demo-video"
  recommended: boolean
  reason: string
  noGoReason?: string
  blockers: string[]
  evidenceIds: string[]
}

export interface VisualBrief {
  id: string
  status: MarketingAssetStatus
  objective: string
  format: "screenshot" | "ui-flow" | "branded-card" | "none"
  tone: VisualTonePreset
  visualIdentity: string
  sourceEvidenceIds: string[]
  uiEvidence: string[]
  instructions: string
  requiredText: string[]
  shareCopy: string
}

export interface DemoVideoBeat {
  id: string
  label: string
  startSecond: number
  endSecond: number
  visual: string
  readableText: string
  evidenceIds: string[]
}

export interface GeneratedMarketingAsset {
  id: string
  kind: "image" | "video"
  status: "ready" | "rendered"
  url: string
  digest: string
  source: "hyperframes" | "external" | "manual"
  createdAt: string
  evidenceIds: string[]
}

export interface DemoVideoPlan {
  id: string
  status: MarketingAssetStatus
  renderer: "hyperframes" | "external" | "manual" | "unavailable"
  rendererAvailable: boolean
  rendererState: "available" | "unavailable" | "blocked" | "ready" | "rendered" | "error"
  rendererError?: string
  handoffCommand?: string
  tone: VisualTonePreset
  format: "landscape" | "vertical" | "square"
  durationSeconds: number
  hook: string
  reveal: string
  productMoments: string[]
  outroCta: string
  readableTiming: string
  visualIdentity: string
  audioPosture: string
  shareCopy: string
  storyboard: DemoVideoBeat[]
  sourceEvidenceIds: string[]
  uiEvidence: string[]
  generatedAssetIds: string[]
  blockedReason?: string
}

export interface VisualVideoQualityEvaluation {
  id: string
  status: EvalCheckStatus
  score: number
  detail: string
  evidenceIds: string[]
}

export interface ExecutionReadyVariant {
  id: string
  channel: Channel
  status: "draft" | "ready" | "blocked"
  copy: string
  visualBriefId?: string
  demoVideoPlanId?: string
  generatedAssetIds: string[]
  evidenceIds: string[]
  xProseCategoryId?: string
  blocker?: string
}

export interface XProseContract {
  playbookVersion: string
  categoryId: string
  category: unknown
  inputContract: unknown
  generatorPrompt: unknown
  evaluation: unknown
  globalRules: unknown
}

export interface Asset {
  id: string
  kind: "image" | "video" | "text"
  label: string
  href: string
  alt: string
  generatedByAgentId?: string
  briefId?: string
}

export interface ChannelAdaptation {
  id: string
  channel: Channel
  status: "draft" | "approved" | "rejected" | "published"
  copy: string
  assetIds: string[]
  callToAction?: string
  createdByAgentId: string
  createdAt: string
}

export interface ExecutionRecord {
  id: string
  executionJobId: string
  channel: Channel
  status: ExecutionJobStatus
  at: string
  note: string
  receiptId?: string
}

export interface EvalCheck {
  id: string
  label: string
  status: EvalCheckStatus
  score: number
  detail: string
  evidenceIds: string[]
}

export interface EvalResult {
  id: string
  runId: string
  contentPackageId: string
  evaluatorAgentId: string
  evaluationSet: string
  passed: boolean
  score: number
  createdAt: string
  checks: EvalCheck[]
  revisionRequest?: string
  capturedAsCase?: EvaluationCase
}

export interface EvaluationCase {
  id: string
  sourceRunId: string
  label: string
  reason: string
  capturedAt: string
}

export interface ContentPackage {
  id: string
  projectContext: ProjectContext
  sourceEvents: SourceEvent[]
  evidence: Evidence[]
  whatChanged: string
  whyItMatters: string
  audience: Audience
  category: ContentCategory
  narrative: string
  supportedClaims: Claim[]
  prohibitedClaims: Claim[]
  hooks: string[]
  channelNeutralBody: string
  assetBrief?: AssetBrief
  visualPlanningRubric?: ProjectVisualPlanningAnswer[]
  visualOpportunity?: MarketingOpportunityAssessment
  demoVideoOpportunity?: MarketingOpportunityAssessment
  visualBrief?: VisualBrief
  demoVideoPlan?: DemoVideoPlan
  visualVideoQuality?: VisualVideoQualityEvaluation[]
  generatedAssets?: GeneratedMarketingAsset[]
  executionReadyVariants?: ExecutionReadyVariant[]
  xProseContract?: XProseContract
  assets: Asset[]
  confidence: number
  evaluations: EvalResult[]
  adaptations: ChannelAdaptation[]
  executionHistory: ExecutionRecord[]
  reuse: {
    usedChannels: Channel[]
    availableFor: Channel[]
    lastUsedAt?: string
  }
}

export interface DashboardContentPackage {
  id: string
  project: string
  category: ContentCategory
  whatChanged: string
  whyItMatters: string
  audience: string
  narrative: string
  supportedClaims: string[]
  prohibitedClaims: string[]
  hooks: string[]
  channelNeutralBody: string
  visualPlanningRubric?: ProjectVisualPlanningAnswer[]
  visualOpportunity?: MarketingOpportunityAssessment
  demoVideoOpportunity?: MarketingOpportunityAssessment
  visualBrief?: VisualBrief
  demoVideoPlan?: DemoVideoPlan
  visualVideoQuality?: VisualVideoQualityEvaluation[]
  generatedAssets?: GeneratedMarketingAsset[]
  executionReadyVariants?: ExecutionReadyVariant[]
  xProseContract?: XProseContract
  evidence: Evidence[]
  confidence: number
  adaptation: {
    channel: "x"
    copy: string
    asset?: string
  }
  evaluations?: RuntimeEvaluationSummary[]
  contextReferences?: RuntimeContextReference[]
  executionHistory?: Array<{
    id: string
    channel: Channel
    status: ExecutionJobStatus
    detail: string
  }>
}

export interface RuntimeEvaluationSummary {
  id: string
  name: string
  passed: boolean
  score: number
  findings: string[]
}

export interface RuntimeContextReference {
  id: string
  layer: MemoryLayer
  source: string
  label: string
  digest?: string
  excerpt: string
}

export interface ToolAccess {
  id: string
  label: string
  kind: "repo" | "telegram" | "x" | "renderer" | "filesystem" | "evaluation"
  enabled: boolean
}

export interface AgentRole {
  id: string
  name: string
  job: string
  tools: ToolAccess[]
  guardrails: string[]
  dynamic: boolean
}

export interface MemoryReference {
  id: string
  layer: MemoryLayer
  label: string
  summary: string
  source: string
  updatedAt: string
}

export interface ContextEnvelope {
  currentJob: MemoryReference[]
  projectHistory: MemoryReference[]
  brandPolicy: MemoryReference[]
}

export interface AgentNode {
  id: string
  parentId?: string
  roleId?: string
  role: string
  objective: string
  status: AgentStatus
  startedAt: string
  finishedAt?: string
  latencyMs?: number
  tokens?: number
  costUsd?: number
  input?: string
  output?: string
  contextEnvelope?: ContextEnvelope
}

export interface TraceEvent {
  id: string
  runId: string
  agentId?: string
  parentEventId?: string
  at: string
  type: TraceEventType
  title: string
  detail: string
  input?: unknown
  output?: unknown
  latencyMs?: number
  tokens?: number
  costUsd?: number
}

export interface ExecutionJob {
  id: string
  runId: string
  contentPackageId?: string
  adaptationId?: string
  channel: Channel
  status: ExecutionJobStatus
  executionPhase?: ExecutionPhase
  scheduledFor: string
  vetoWindowSeconds: number
  vetoEndsAt?: string
  notification?: VetoNotification
  receiptId?: string
  failureReason?: string
  payload?: {
    copy: string
    asset?: string
  }
  handoff?: {
    executor: string
    commandPreview: string
  }
}

export interface VetoNotification {
  id: string
  provider: "telegram" | "whatsapp"
  recipient: string
  sentAt: string
  preview: string
  actions: VetoAction[]
}

export interface VetoAction {
  id: string
  label: "edit" | "delay" | "block" | "reject_angle"
  status: "available" | "used" | "expired"
}

export interface PublishReceipt {
  id: string
  executionJobId: string
  channel: Channel
  status: PublishReceiptStatus
  publishedAt?: string
  verifiedAt?: string
  postId?: string
  url?: string
  account?: string
  preview: string
  verificationLog: string[]
  error?: string
}

export interface Policy {
  id: string
  channel: Channel
  autonomy: "manual" | "veto_window" | "autopublish"
  vetoWindowSeconds: number
  allowedCategories: ContentCategory[]
  blockedClaims: string[]
  requiredEvidenceCount: number
}

export interface RunTotals {
  tokens: number
  costUsd: number
  latencyMs: number
  agentCount: number
  eventCount: number
}

export interface AgencyRun {
  id: string
  project: string
  trigger: string
  status: RunStatus
  dataOrigin?: RunDataOrigin
  startedAt: string
  finishedAt?: string
  scheduledFor?: string
  vetoEndsAt?: string
  publishedUrl?: string
  package: DashboardContentPackage
  contentPackage?: ContentPackage
  agents: AgentNode[]
  events: TraceEvent[]
  executionJobs?: ExecutionJob[]
  executionJob?: ExecutionJob
  receipts?: PublishReceipt[]
  policy?: Policy
  contextReferences?: RuntimeContextReference[]
  selectedCrew?: string[]
  evaluation?: {
    weakDraft?: {
      text: string
      result: RuntimeEvaluationSummary
    }
    revisedDraft?: {
      text: string
      result: RuntimeEvaluationSummary
    }
  }
  metrics?: {
    totalLatencyMs: number
    totalEstimatedCostUsd: number
    agentCount: number
    traceEventCount: number
  }
}

export interface TraceTreeNode {
  agent: AgentNode
  children: TraceTreeNode[]
  events: TraceEvent[]
  totals: RunTotals
}

export interface RunComparison {
  baselineRunId: string
  comparisonRunId: string
  statusChanged: boolean
  scoreDelta: number
  costDeltaUsd: number
  latencyDeltaMs: number
  notes: string[]
}
