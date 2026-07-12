import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const status = v.union(
  v.literal("queue"),
  v.literal("veto"),
  v.literal("ready"),
  v.literal("published"),
  v.literal("blocked"),
  v.literal("running"),
  v.literal("failed"),
)

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    repositoryUrl: v.optional(v.string()),
    objective: v.string(),
    policy: v.any(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_name", ["name"]),

  runs: defineTable({
    runId: v.string(),
    projectId: v.id("projects"),
    project: v.string(),
    trigger: v.string(),
    status,
    startedAt: v.string(),
    finishedAt: v.optional(v.string()),
    scheduledFor: v.optional(v.string()),
    vetoEndsAt: v.optional(v.string()),
    selectedCrew: v.array(v.string()),
    generation: v.any(),
    evaluation: v.any(),
    agents: v.any(),
    contextEnvelope: v.any(),
    contextReferences: v.any(),
    metrics: v.any(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_runId", ["runId"])
    .index("by_createdAt", ["createdAt"]),

  events: defineTable({
    runId: v.string(),
    eventId: v.string(),
    sequence: v.number(),
    agentId: v.optional(v.string()),
    at: v.string(),
    type: v.string(),
    title: v.string(),
    detail: v.string(),
    payload: v.any(),
  })
    .index("by_run_sequence", ["runId", "sequence"])
    .index("by_eventId", ["eventId"]),

  contentPackages: defineTable({
    runId: v.string(),
    packageId: v.string(),
    project: v.string(),
    category: v.string(),
    narrative: v.string(),
    package: v.any(),
    evaluations: v.any(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_runId", ["runId"])
    .index("by_packageId", ["packageId"]),

  executionJobs: defineTable({
    jobId: v.string(),
    runId: v.string(),
    contentPackageId: v.string(),
    channel: v.string(),
    status,
    scheduledFor: v.string(),
    vetoEndsAt: v.optional(v.string()),
    payload: v.any(),
    handoff: v.any(),
    browserTask: v.optional(v.any()),
    blockReason: v.optional(v.string()),
    statusHistory: v.array(v.any()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_runId", ["runId"])
    .index("by_run_status", ["runId", "status"]),

  receipts: defineTable({
    receiptId: v.string(),
    jobId: v.string(),
    runId: v.string(),
    channel: v.string(),
    status: v.union(v.literal("verified"), v.literal("pending"), v.literal("failed")),
    postUrl: v.string(),
    postId: v.optional(v.string()),
    publishedAt: v.string(),
    verifiedAt: v.string(),
    verifiedBy: v.string(),
    account: v.optional(v.string()),
    preview: v.string(),
    verificationLog: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_runId", ["runId"])
    .index("by_receiptId", ["receiptId"]),

  memoryRecords: defineTable({
    runId: v.string(),
    layer: v.union(v.literal("current_job"), v.literal("project_history"), v.literal("brand_policy")),
    referenceId: v.string(),
    label: v.string(),
    source: v.string(),
    digest: v.optional(v.string()),
    excerpt: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_run_layer", ["runId", "layer"])
    .index("by_referenceId", ["referenceId"]),

  // --- Ops center tables (appended; see convex/ops.ts) ---
  automations: defineTable({
    name: v.string(),
    channel: v.string(),
    trigger: v.string(),
    enabled: v.boolean(),
    nextRunAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_name", ["name"]),

  sensors: defineTable({
    source: v.string(),
    lastSyncedAt: v.string(),
    findingsCount: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_source", ["source"]),

  opportunities: defineTable({
    type: v.union(v.literal("content"), v.literal("automation")),
    source: v.string(),
    description: v.string(),
    evidenceRef: v.optional(v.string()),
    status: v.union(v.literal("new"), v.literal("drafting"), v.literal("skipped")),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_status", ["status"]),
})
