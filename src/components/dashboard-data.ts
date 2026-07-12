import type { AgencyRun, ExecutionJob, PublishReceipt } from "../types"

export type ViewKey = "operations" | "catalog" | "agency" | "observability"

type EvaluationSummary = {
  id: string
  name: string
  passed: boolean
  score: number
  findings: string[]
}

export type ReviewMoment = {
  weakDraft: {
    text: string
    result: EvaluationSummary
  }
  revisedDraft: {
    text: string
    result: EvaluationSummary
  }
}

export type RuntimeMetrics = {
  totalLatencyMs?: number
  totalEstimatedCostUsd?: number
  agentCount?: number
  traceEventCount?: number
}

export type DashboardRun = AgencyRun & {
  executionJob?: ExecutionJob
  metrics?: RuntimeMetrics
  evaluation?: unknown
}

export const fallbackRun: DashboardRun = {
  id: "no-live-run",
  project: "Wingbeat",
  trigger: "Waiting for /data/latest-run.json",
  status: "running",
  startedAt: new Date(0).toISOString(),
  package: {
    id: "no-package",
    project: "Wingbeat",
    category: "build-in-public",
    whatChanged: "No live run has been loaded yet.",
    whyItMatters: "The console is ready, but it is not inventing run output.",
    audience: "Operator",
    narrative: "Waiting for real run data from /data/latest-run.json.",
    supportedClaims: [],
    prohibitedClaims: [],
    hooks: [],
    channelNeutralBody: "No channel-neutral package loaded.",
    evidence: [],
    confidence: 0,
    adaptation: {
      channel: "x",
      copy: "No X adaptation loaded.",
    },
  },
  agents: [],
  events: [],
}

export function getExecutionJobs(run: DashboardRun): ExecutionJob[] {
  return run.executionJobs ?? (run.executionJob ? [run.executionJob] : [])
}

export function getReceipts(run: DashboardRun): PublishReceipt[] {
  return run.receipts ?? []
}

export function getPrimaryReceipt(run: DashboardRun): PublishReceipt | undefined {
  const jobs = getExecutionJobs(run)
  const receipts = getReceipts(run)

  return (
    receipts.find((receipt) => receipt.url) ??
    receipts.find((receipt) => jobs.some((job) => job.receiptId === receipt.id)) ??
    receipts[0]
  )
}

export function getReviewMoment(run: DashboardRun): ReviewMoment | undefined {
  const rawEvaluation = run.evaluation
  if (!isRecord(rawEvaluation)) return undefined
  const evaluation = rawEvaluation as Record<string, unknown>

  const weakDraft = toDraftReview(evaluation.weakDraft)
  const revisedDraft = toDraftReview(evaluation.revisedDraft)
  if (weakDraft && revisedDraft && !weakDraft.result.passed && revisedDraft.result.passed) {
    return { weakDraft, revisedDraft }
  }

  const firstDraft = toDraftReview(evaluation.firstDraft)
  const finalDraft = toDraftReview(evaluation.finalDraft)
  if (firstDraft && finalDraft && !firstDraft.result.passed && finalDraft.result.passed) {
    return { weakDraft: firstDraft, revisedDraft: finalDraft }
  }

  return undefined
}

export function getRuntimeMetrics(run: DashboardRun): RuntimeMetrics {
  return {
    totalLatencyMs:
      run.metrics?.totalLatencyMs ??
      sumRecorded(run.agents.map((agent) => agent.latencyMs), run.events.map((event) => event.latencyMs)),
    totalEstimatedCostUsd:
      run.metrics?.totalEstimatedCostUsd ??
      sumRecorded(run.agents.map((agent) => agent.costUsd), run.events.map((event) => event.costUsd)),
    agentCount: run.metrics?.agentCount ?? run.agents.length,
    traceEventCount: run.metrics?.traceEventCount ?? run.events.length,
  }
}

function sumRecorded(...groups: Array<Array<number | undefined>>): number | undefined {
  const values = groups.flat().filter((value): value is number => typeof value === "number")
  if (values.length === 0) return undefined
  return values.reduce((sum, value) => sum + value, 0)
}

function toDraftReview(value: unknown): ReviewMoment["weakDraft"] | undefined {
  if (!isRecord(value) || typeof value.text !== "string") return undefined
  const result = toEvaluationSummary(value.result)
  if (!result) return undefined
  return { text: value.text, result }
}

function toEvaluationSummary(value: unknown): EvaluationSummary | undefined {
  if (!isRecord(value)) return undefined
  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.passed !== "boolean" ||
    typeof value.score !== "number" ||
    !Array.isArray(value.findings)
  ) {
    return undefined
  }

  return {
    id: value.id,
    name: value.name,
    passed: value.passed,
    score: value.score,
    findings: value.findings.filter((finding): finding is string => typeof finding === "string"),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
