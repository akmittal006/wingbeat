import type { ExecutionJobStatus, RunStatus } from "../types"

export const RUN_STATUS_LABELS: Record<RunStatus, string> = {
  running: "Running",
  in_review: "In review",
  veto_window: "Veto window",
  overdue: "Overdue",
  published: "Published",
  blocked: "Blocked",
  failed: "Failed",
}

export const RUN_STATUS_TONE: Record<RunStatus, "neutral" | "blue" | "green" | "orange" | "red"> = {
  running: "blue",
  in_review: "orange",
  veto_window: "orange",
  overdue: "orange",
  published: "green",
  blocked: "red",
  failed: "red",
}

const runTransitions: Record<RunStatus, RunStatus[]> = {
  running: ["in_review", "veto_window", "failed", "blocked"],
  in_review: ["veto_window", "blocked", "running"],
  veto_window: ["published", "blocked", "overdue", "failed"],
  overdue: ["veto_window", "published", "blocked", "failed"],
  published: [],
  blocked: ["running"],
  failed: ["running"],
}

const executionJobTransitions: Record<ExecutionJobStatus, ExecutionJobStatus[]> = {
  draft: ["scheduled", "failed"],
  scheduled: ["notifying", "overdue", "blocked"],
  notifying: ["veto_window", "failed"],
  veto_window: ["publishing", "blocked", "overdue"],
  publishing: ["published", "failed"],
  published: [],
  blocked: ["scheduled"],
  failed: ["scheduled"],
  overdue: ["notifying", "publishing", "blocked", "failed"],
}

export function canTransitionRun(from: RunStatus, to: RunStatus): boolean {
  return runTransitions[from].includes(to)
}

export function nextRunStatuses(from: RunStatus): RunStatus[] {
  return [...runTransitions[from]]
}

export function transitionRunStatus(from: RunStatus, to: RunStatus): RunStatus {
  if (!canTransitionRun(from, to)) {
    throw new Error(`Invalid run status transition: ${from} -> ${to}`)
  }

  return to
}

export function canTransitionExecutionJob(from: ExecutionJobStatus, to: ExecutionJobStatus): boolean {
  return executionJobTransitions[from].includes(to)
}

export function nextExecutionJobStatuses(from: ExecutionJobStatus): ExecutionJobStatus[] {
  return [...executionJobTransitions[from]]
}

export function isTerminalRunStatus(status: RunStatus): boolean {
  return status === "published" || status === "blocked" || status === "failed"
}
