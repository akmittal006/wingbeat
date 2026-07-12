import { makeFunctionReference } from "convex/server"

// Codegen cannot run in this environment (no Convex deployment/auth), so the
// generated `api` object does not yet include the `ops` module. These typed
// function references bind to convex/ops.ts by name without editing any
// _generated file. Names use the "<module>:<function>" convention.

export type OpportunityType = "content" | "automation"
export type OpportunityStatus = "new" | "drafting" | "skipped"

export interface Automation {
  id: string
  name: string
  channel: string
  trigger: string
  enabled: boolean
  nextRunAt?: string
}

export interface Sensor {
  id: string
  source: string
  lastSyncedAt: string
  findingsCount: number
}

export interface Opportunity {
  id: string
  type: OpportunityType
  source: string
  description: string
  evidenceRef?: string
  status: OpportunityStatus
  createdAt: string
}

export interface RunLite {
  id: string
  project: string
  trigger: string
  status: string
  startedAt: string
  finishedAt?: string
  createdAt: string
}

export interface PackageLite {
  runId: string
  packageId: string
  project: string
  category: string
  narrative: string
  package: {
    category?: string
    narrative?: string
    confidence?: number
    evaluations?: Array<{ id: string; name: string; passed: boolean; score: number; findings: string[] }>
    adaptation?: { channel?: string; copy?: string; asset?: string }
  }
  evaluations: unknown
  createdAt: string
}

export interface ReceiptLite {
  id: string
  jobId: string
  runId: string
  channel: string
  status: string
  url: string
  verifiedAt: string
}

export interface ActivityItem {
  id: string
  kind: string
  at: string
  title: string
  detail: string
  runId?: string
  agentId?: string
  receiptUrl?: string
}

type NoArgs = Record<string, never>

export const opsApi = {
  listAutomations: makeFunctionReference<"query", NoArgs, Automation[]>("ops:listAutomations"),
  listSensors: makeFunctionReference<"query", NoArgs, Sensor[]>("ops:listSensors"),
  listOpportunities: makeFunctionReference<"query", { status?: OpportunityStatus }, Opportunity[]>(
    "ops:listOpportunities",
  ),
  listRuns: makeFunctionReference<"query", NoArgs, RunLite[]>("ops:listRuns"),
  listContentPackages: makeFunctionReference<"query", NoArgs, PackageLite[]>("ops:listContentPackages"),
  listReceipts: makeFunctionReference<"query", NoArgs, ReceiptLite[]>("ops:listReceipts"),
  recentActivity: makeFunctionReference<"query", NoArgs, ActivityItem[]>("ops:recentActivity"),
  draftOpportunity: makeFunctionReference<"mutation", { id: string }, null>("ops:draftOpportunity"),
  skipOpportunity: makeFunctionReference<"mutation", { id: string }, null>("ops:skipOpportunity"),
}
