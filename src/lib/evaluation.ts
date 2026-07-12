import type { AgencyRun, EvalResult, RunComparison } from "../types"
import { getRunTotals } from "./trace"

export function getLatestEvaluation(run: Pick<AgencyRun, "contentPackage">): EvalResult | undefined {
  return [...(run.contentPackage?.evaluations ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
}

export function hasPassingPublishGate(run: Pick<AgencyRun, "contentPackage">): boolean {
  const latest = getLatestEvaluation(run)
  return Boolean(latest?.passed && latest.score >= 0.82)
}

export function summarizeEvaluation(result: EvalResult): string {
  const failedChecks = result.checks.filter((check) => check.status === "fail")
  const warningChecks = result.checks.filter((check) => check.status === "warn")

  if (result.passed) {
    return `Passed ${result.evaluationSet} with ${result.score.toFixed(2)}.`
  }

  return `Failed ${result.evaluationSet}: ${failedChecks.length} failed, ${warningChecks.length} warned.`
}

export function compareRuns(baseline: AgencyRun, comparison: AgencyRun): RunComparison {
  const baselineEval = getLatestEvaluation(baseline)
  const comparisonEval = getLatestEvaluation(comparison)
  const baselineTotals = getRunTotals(baseline)
  const comparisonTotals = getRunTotals(comparison)

  return {
    baselineRunId: baseline.id,
    comparisonRunId: comparison.id,
    statusChanged: baseline.status !== comparison.status,
    scoreDelta: round((comparisonEval?.score ?? 0) - (baselineEval?.score ?? 0)),
    costDeltaUsd: round(comparisonTotals.costUsd - baselineTotals.costUsd),
    latencyDeltaMs: comparisonTotals.latencyMs - baselineTotals.latencyMs,
    notes: [
      `Status: ${baseline.status} -> ${comparison.status}`,
      `Evaluation: ${(baselineEval?.score ?? 0).toFixed(2)} -> ${(comparisonEval?.score ?? 0).toFixed(2)}`,
      `Cost: $${baselineTotals.costUsd.toFixed(4)} -> $${comparisonTotals.costUsd.toFixed(4)}`,
    ],
  }
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000
}
