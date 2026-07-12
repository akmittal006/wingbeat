import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"

function now() {
  return new Date().toISOString()
}

// ----------------------------------------------------------------------------
// Overview: automations
// ----------------------------------------------------------------------------

export const listAutomations = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("automations").collect()
    return rows.map((row) => ({
      id: row._id as string,
      name: row.name,
      channel: row.channel,
      trigger: row.trigger,
      enabled: row.enabled,
      nextRunAt: row.nextRunAt,
    }))
  },
})

export const upsertAutomation = mutation({
  args: {
    name: v.string(),
    channel: v.string(),
    trigger: v.string(),
    enabled: v.optional(v.boolean()),
    nextRunAt: v.optional(v.string()),
  },
  handler: async (ctx, { name, channel, trigger, enabled, nextRunAt }) => {
    const at = now()
    const existing = await ctx.db
      .query("automations")
      .withIndex("by_name", (q) => q.eq("name", name))
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, {
        channel,
        trigger,
        enabled: enabled ?? existing.enabled,
        nextRunAt,
        updatedAt: at,
      })
      return existing._id as string
    }
    const id = await ctx.db.insert("automations", {
      name,
      channel,
      trigger,
      enabled: enabled ?? true,
      nextRunAt,
      createdAt: at,
      updatedAt: at,
    })
    return id as string
  },
})

export const toggleAutomation = mutation({
  args: { id: v.id("automations"), enabled: v.boolean() },
  handler: async (ctx, { id, enabled }) => {
    await ctx.db.patch(id, { enabled, updatedAt: now() })
  },
})

// ----------------------------------------------------------------------------
// Overview: context sensors
// ----------------------------------------------------------------------------

export const listSensors = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("sensors").collect()
    return rows.map((row) => ({
      id: row._id as string,
      source: row.source,
      lastSyncedAt: row.lastSyncedAt,
      findingsCount: row.findingsCount,
    }))
  },
})

export const recordSensorSync = mutation({
  args: { source: v.string(), findingsCount: v.number(), lastSyncedAt: v.optional(v.string()) },
  handler: async (ctx, { source, findingsCount, lastSyncedAt }) => {
    const at = now()
    const syncedAt = lastSyncedAt ?? at
    const existing = await ctx.db
      .query("sensors")
      .withIndex("by_source", (q) => q.eq("source", source))
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, { findingsCount, lastSyncedAt: syncedAt, updatedAt: at })
      return existing._id as string
    }
    const id = await ctx.db.insert("sensors", {
      source,
      lastSyncedAt: syncedAt,
      findingsCount,
      createdAt: at,
      updatedAt: at,
    })
    return id as string
  },
})

// ----------------------------------------------------------------------------
// Overview: opportunities inbox
// ----------------------------------------------------------------------------

export const listOpportunities = query({
  args: { status: v.optional(v.union(v.literal("new"), v.literal("drafting"), v.literal("skipped"))) },
  handler: async (ctx, { status }) => {
    const rows = status
      ? await ctx.db
          .query("opportunities")
          .withIndex("by_status", (q) => q.eq("status", status))
          .collect()
      : await ctx.db.query("opportunities").collect()
    return rows
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((row) => ({
        id: row._id as string,
        type: row.type,
        source: row.source,
        description: row.description,
        evidenceRef: row.evidenceRef,
        status: row.status,
        createdAt: row.createdAt,
      }))
  },
})

export const createOpportunity = mutation({
  args: {
    type: v.union(v.literal("content"), v.literal("automation")),
    source: v.string(),
    description: v.string(),
    evidenceRef: v.optional(v.string()),
  },
  handler: async (ctx, { type, source, description, evidenceRef }) => {
    const at = now()
    const id = await ctx.db.insert("opportunities", {
      type,
      source,
      description,
      evidenceRef,
      status: "new",
      createdAt: at,
      updatedAt: at,
    })
    return id as string
  },
})

async function setOpportunityStatus(
  ctx: { db: { patch: (id: Id<"opportunities">, patch: Record<string, unknown>) => Promise<void> } },
  id: Id<"opportunities">,
  status: "drafting" | "skipped",
) {
  await ctx.db.patch(id, { status, updatedAt: now() })
}

export const draftOpportunity = mutation({
  args: { id: v.id("opportunities") },
  handler: async (ctx, { id }) => {
    await setOpportunityStatus(ctx, id, "drafting")
  },
})

export const skipOpportunity = mutation({
  args: { id: v.id("opportunities") },
  handler: async (ctx, { id }) => {
    await setOpportunityStatus(ctx, id, "skipped")
  },
})

// Authorized cleanup: hard-delete opportunity rows for a given source (and
// optionally only certain statuses). Introduced to purge the ~456 junk rows a
// previous "parse every session into a row" sensor flooded the inbox with. It
// is intentionally narrow — it never deletes across sources in one call — so it
// cannot be used to wipe the table blindly. Returns the number of rows deleted.
export const purgeOpportunities = mutation({
  args: {
    source: v.string(),
    statuses: v.optional(
      v.array(v.union(v.literal("new"), v.literal("drafting"), v.literal("skipped"))),
    ),
  },
  handler: async (ctx, { source, statuses }) => {
    const rows = await ctx.db.query("opportunities").collect()
    const statusSet = statuses && statuses.length > 0 ? new Set(statuses) : null
    let deleted = 0
    for (const row of rows) {
      if (row.source !== source) continue
      if (statusSet && !statusSet.has(row.status)) continue
      await ctx.db.delete(row._id)
      deleted += 1
    }
    return { deleted, source, statuses: statuses ?? null }
  },
})

// ----------------------------------------------------------------------------
// Pipeline + Catalog: runs, packages, receipts
// ----------------------------------------------------------------------------

export const listRuns = query({
  args: {},
  handler: async (ctx) => {
    const runs = await ctx.db.query("runs").withIndex("by_createdAt").order("desc").collect()
    return runs.map((run) => ({
      id: run.runId,
      project: run.project,
      trigger: run.trigger,
      status: run.status,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      createdAt: run.createdAt,
    }))
  },
})

export const listContentPackages = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("contentPackages").collect()
    return rows.map((row) => ({
      runId: row.runId,
      packageId: row.packageId,
      project: row.project,
      category: row.category,
      narrative: row.narrative,
      package: row.package,
      evaluations: row.evaluations,
      createdAt: row.createdAt,
    }))
  },
})

export const listReceipts = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("receipts").collect()
    return rows.map((row) => ({
      id: row.receiptId,
      jobId: row.jobId,
      runId: row.runId,
      channel: row.channel,
      status: row.status,
      url: row.postUrl,
      verifiedAt: row.verifiedAt,
    }))
  },
})

// ----------------------------------------------------------------------------
// Overview: activity feed (bounded scan across events + receipts)
// ----------------------------------------------------------------------------

export const recentActivity = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect()
    const receipts = await ctx.db.query("receipts").collect()
    const receiptByJob = new Map(receipts.map((receipt) => [receipt.jobId, receipt]))
    const activity = events
      .slice()
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 20)
      .map((event) => {
        const jobId = (event.payload && (event.payload.jobId as string | undefined)) ?? undefined
        const receipt = jobId ? receiptByJob.get(jobId) : undefined
        return {
          id: event.eventId,
          kind: event.type,
          at: event.at,
          title: event.title,
          detail: event.detail,
          runId: event.runId,
          agentId: event.agentId,
          receiptUrl: event.type === "receipt" || event.type === "publish" ? receipt?.postUrl : undefined,
        }
      })
    return activity
  },
})
