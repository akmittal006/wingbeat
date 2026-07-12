import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { assertVisualVideoContract } from "./visuals"

const EXECUTION_STATUSES = ["queue", "veto", "ready", "published", "blocked"] as const
const TRANSITIONS: Record<(typeof EXECUTION_STATUSES)[number], Array<(typeof EXECUTION_STATUSES)[number]>> = {
  queue: ["veto", "blocked"],
  veto: ["ready", "blocked"],
  ready: ["published", "blocked"],
  published: [],
  blocked: [],
}

function now() {
  return new Date().toISOString()
}

function assertTransition(from: string, to: string) {
  if (!EXECUTION_STATUSES.includes(from as never) || !EXECUTION_STATUSES.includes(to as never)) {
    throw new Error(`Unknown execution status transition: ${from} -> ${to}`)
  }
  if (!TRANSITIONS[from as keyof typeof TRANSITIONS].includes(to as never)) {
    throw new Error(`Invalid execution status transition: ${from} -> ${to}`)
  }
}

async function runById(ctx: any, runId: string) {
  const run = await ctx.db
    .query("runs")
    .withIndex("by_runId", (q: any) => q.eq("runId", runId))
    .unique()
  if (!run) throw new Error(`Run not found: ${runId}`)
  return run
}

async function jobById(ctx: any, jobId: string) {
  const job = await ctx.db
    .query("executionJobs")
    .withIndex("by_jobId", (q: any) => q.eq("jobId", jobId))
    .unique()
  if (!job) throw new Error(`Execution job not found: ${jobId}`)
  return job
}

async function queuedJobForRun(ctx: any, runId: string) {
  const job = await ctx.db
    .query("executionJobs")
    .withIndex("by_run_status", (q: any) => q.eq("runId", runId).eq("status", "queue"))
    .first()
  if (!job) throw new Error(`Queued execution job not found for run: ${runId}`)
  return job
}

async function patchRunStatus(ctx: any, runId: string, status: string, extra: Record<string, unknown> = {}) {
  const run = await runById(ctx, runId)
  await ctx.db.patch(run._id, {
    status,
    updatedAt: now(),
    ...extra,
  })
}

function receiptShape(receipt: any) {
  return {
    id: receipt.receiptId,
    executionJobId: receipt.jobId,
    channel: receipt.channel,
    status: receipt.status,
    publishedAt: receipt.publishedAt,
    verifiedAt: receipt.verifiedAt,
    postId: receipt.postId,
    url: receipt.postUrl,
    account: receipt.account,
    preview: receipt.preview,
    verificationLog: receipt.verificationLog,
  }
}

function jobShape(job: any, receipt?: any) {
  return {
    id: job.jobId,
    runId: job.runId,
    contentPackageId: job.contentPackageId,
    channel: job.channel,
    status: job.status,
    scheduledFor: job.scheduledFor,
    vetoWindowSeconds: job.vetoEndsAt ? Math.max(0, Math.round((Date.parse(job.vetoEndsAt) - Date.parse(job.createdAt)) / 1000)) : 0,
    vetoEndsAt: job.vetoEndsAt,
    receiptId: receipt?.receiptId,
    failureReason: job.blockReason,
    payload: job.payload,
    handoff: job.handoff,
  }
}

export const recordAgencyRun = mutation({
  args: {
    run: v.any(),
  },
  handler: async (ctx, { run }) => {
    const createdAt = now()
    assertVisualVideoContract(run.package)
    const existing = await ctx.db
      .query("runs")
      .withIndex("by_runId", (q) => q.eq("runId", run.id))
      .unique()
    if (existing) throw new Error(`Run already exists in Convex: ${run.id}`)

    let project = await ctx.db
      .query("projects")
      .withIndex("by_name", (q) => q.eq("name", run.project))
      .unique()
    if (!project) {
      const projectId = await ctx.db.insert("projects", {
        name: run.project,
        repositoryUrl: run.contextEnvelope?.currentJob?.repositoryUrl,
        objective: run.contextEnvelope?.currentJob?.objective ?? run.trigger,
        policy: run.policy ?? run.contextEnvelope?.brandPolicy ?? {},
        createdAt,
        updatedAt: createdAt,
      })
      project = await ctx.db.get(projectId)
    }
    if (!project) throw new Error(`Failed to create project for ${run.project}`)

    await ctx.db.insert("runs", {
      runId: run.id,
      projectId: project._id,
      project: run.project,
      trigger: run.trigger,
      status: "queue",
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      scheduledFor: run.scheduledFor,
      vetoEndsAt: undefined,
      selectedCrew: run.selectedCrew ?? [],
      generation: run.generation ?? {},
      evaluation: run.evaluation ?? {},
      agents: run.agents ?? [],
      contextEnvelope: run.contextEnvelope ?? {},
      contextReferences: run.contextReferences ?? [],
      metrics: run.metrics ?? {},
      createdAt,
      updatedAt: createdAt,
    })

    await ctx.db.insert("contentPackages", {
      runId: run.id,
      packageId: run.package.id,
      project: run.package.project,
      category: run.package.category,
      narrative: run.package.narrative,
      package: run.package,
      visualOpportunity: run.package.visualOpportunity,
      demoVideoOpportunity: run.package.demoVideoOpportunity,
      visualBrief: run.package.visualBrief,
      demoVideoPlan: run.package.demoVideoPlan,
      visualVideoQuality: run.package.visualVideoQuality ?? [],
      generatedAssets: run.package.generatedAssets ?? [],
      executionReadyVariants: run.package.executionReadyVariants ?? [],
      xProseContract: run.package.xProseContract,
      evaluations: run.package.evaluations ?? [],
      createdAt,
      updatedAt: createdAt,
    })

    for (const [sequence, event] of (run.events ?? []).entries()) {
      await ctx.db.insert("events", {
        runId: run.id,
        eventId: event.id,
        sequence,
        agentId: event.agentId,
        at: event.at,
        type: event.type,
        title: event.title,
        detail: event.detail,
        payload: event,
      })
    }

    for (const ref of run.contextReferences ?? []) {
      await ctx.db.insert("memoryRecords", {
        runId: run.id,
        layer: ref.layer,
        referenceId: ref.id,
        label: ref.label,
        source: ref.source,
        digest: ref.digest,
        excerpt: ref.excerpt,
        createdAt,
        updatedAt: createdAt,
      })
    }

    const job = run.executionJob
    if (!job) throw new Error(`Run ${run.id} has no execution job`)
    await ctx.db.insert("executionJobs", {
      jobId: job.id,
      runId: run.id,
      contentPackageId: run.package.id,
      channel: job.channel,
      status: "queue",
      scheduledFor: job.scheduledFor,
      vetoEndsAt: undefined,
      payload: job.payload ?? {},
      handoff: job.handoff ?? {},
      statusHistory: [{ status: "queue", at: createdAt, detail: "Runtime created queued execution job in Convex." }],
      createdAt,
      updatedAt: createdAt,
    })

    return { runId: run.id, jobId: job.id, projectId: project._id }
  },
})

export const latestRun = query({
  args: {},
  handler: async (ctx) => {
    const run = await ctx.db.query("runs").withIndex("by_createdAt").order("desc").first()
    if (!run) return null
    const contentPackage = await ctx.db
      .query("contentPackages")
      .withIndex("by_runId", (q) => q.eq("runId", run.runId))
      .first()
    if (!contentPackage) throw new Error(`Run ${run.runId} has no content package`)
    const events = await ctx.db
      .query("events")
      .withIndex("by_run_sequence", (q) => q.eq("runId", run.runId))
      .collect()
    const jobs = await ctx.db
      .query("executionJobs")
      .withIndex("by_runId", (q) => q.eq("runId", run.runId))
      .collect()
    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_runId", (q) => q.eq("runId", run.runId))
      .collect()
    const receiptByJob = new Map(receipts.map((receipt) => [receipt.jobId, receipt]))
    const shapedJobs = jobs.map((job) => jobShape(job, receiptByJob.get(job.jobId)))
    return {
      id: run.runId,
      project: run.project,
      trigger: run.trigger,
      status: run.status,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      scheduledFor: run.scheduledFor,
      vetoEndsAt: run.vetoEndsAt,
      package: contentPackage.package,
      agents: run.agents,
      events: events.map((event) => event.payload),
      contextEnvelope: run.contextEnvelope,
      contextReferences: run.contextReferences,
      selectedCrew: run.selectedCrew,
      generation: run.generation,
      evaluation: run.evaluation,
      executionJobs: shapedJobs,
      executionJob: shapedJobs[0],
      receipts: receipts.map(receiptShape),
      metrics: run.metrics,
    }
  },
})

export const runProof = query({
  args: { runId: v.string() },
  handler: async (ctx, { runId }) => {
    const run = await ctx.db
      .query("runs")
      .withIndex("by_runId", (q) => q.eq("runId", runId))
      .unique()
    if (!run) return null
    const project = await ctx.db.get(run.projectId)
    const contentPackage = await ctx.db
      .query("contentPackages")
      .withIndex("by_runId", (q) => q.eq("runId", runId))
      .first()
    const events = await ctx.db
      .query("events")
      .withIndex("by_run_sequence", (q) => q.eq("runId", runId))
      .collect()
    const memory = await ctx.db
      .query("memoryRecords")
      .withIndex("by_run_layer", (q) => q.eq("runId", runId))
      .collect()
    const jobs = await ctx.db
      .query("executionJobs")
      .withIndex("by_runId", (q) => q.eq("runId", runId))
      .collect()

    return {
      project,
      run,
      eventCount: events.length,
      events,
      contentPackage,
      memoryCount: memory.length,
      memory,
      jobs,
    }
  },
})

export const getJob = query({
  args: { jobId: v.string() },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db
      .query("executionJobs")
      .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
      .unique()
    if (!job) return null
    const receipt = await ctx.db
      .query("receipts")
      .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
      .unique()
    return { ...jobShape(job, receipt), statusHistory: job.statusHistory, browserTask: job.browserTask, blockReason: job.blockReason, receipt: receipt ? receiptShape(receipt) : undefined }
  },
})

export const listJobs = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db.query("executionJobs").collect()
    const receipts = await ctx.db.query("receipts").collect()
    const receiptByJob = new Map(receipts.map((receipt) => [receipt.jobId, receipt]))
    return jobs.map((job) => ({ ...jobShape(job, receiptByJob.get(job.jobId)), statusHistory: job.statusHistory }))
  },
})

export const openVeto = mutation({
  args: { runId: v.string(), jobId: v.optional(v.string()), vetoSeconds: v.number(), operator: v.string() },
  handler: async (ctx, { runId, jobId, vetoSeconds, operator }) => {
    const job = jobId ? await jobById(ctx, jobId) : await queuedJobForRun(ctx, runId)
    if (job.runId !== runId) throw new Error(`Job ${job.jobId} does not belong to run ${runId}`)
    assertTransition(job.status, "veto")
    const at = now()
    const vetoEndsAt = new Date(Date.now() + vetoSeconds * 1000).toISOString()
    const statusHistory = [...job.statusHistory, { status: "veto", at, detail: `Veto window opened for ${vetoSeconds} seconds by ${operator}.` }]
    await ctx.db.patch(job._id, { status: "veto", vetoEndsAt, statusHistory, updatedAt: at })
    await patchRunStatus(ctx, runId, "veto", { vetoEndsAt })
    return { ...jobShape({ ...job, status: "veto", vetoEndsAt, statusHistory, updatedAt: at }), statusHistory }
  },
})

export const advanceReady = mutation({
  args: { jobId: v.string(), force: v.optional(v.boolean()) },
  handler: async (ctx, { jobId, force }) => {
    const job = await jobById(ctx, jobId)
    assertTransition(job.status, "ready")
    if (!force && job.vetoEndsAt && Date.now() < Date.parse(job.vetoEndsAt)) {
      throw new Error(`Veto window is still open until ${job.vetoEndsAt}`)
    }
    const at = now()
    const statusHistory = [...job.statusHistory, { status: "ready", at, detail: "Veto window elapsed without a block." }]
    await ctx.db.patch(job._id, { status: "ready", statusHistory, updatedAt: at })
    await patchRunStatus(ctx, job.runId, "ready")
    return { ...jobShape({ ...job, status: "ready", statusHistory, updatedAt: at }), statusHistory }
  },
})

export const blockJob = mutation({
  args: { jobId: v.string(), reason: v.string() },
  handler: async (ctx, { jobId, reason }) => {
    const job = await jobById(ctx, jobId)
    assertTransition(job.status, "blocked")
    const at = now()
    const statusHistory = [...job.statusHistory, { status: "blocked", at, detail: reason }]
    await ctx.db.patch(job._id, { status: "blocked", blockReason: reason, statusHistory, updatedAt: at })
    await patchRunStatus(ctx, job.runId, "blocked")
    return { ...jobShape({ ...job, status: "blocked", blockReason: reason, statusHistory, updatedAt: at }), statusHistory, blockReason: reason }
  },
})

export const exportBrowserTask = mutation({
  args: { jobId: v.string(), confirmation: v.string() },
  handler: async (ctx, { jobId, confirmation }) => {
    const job = await jobById(ctx, jobId)
    if (job.status !== "ready") throw new Error(`Job ${job.jobId} is ${job.status}; only ready jobs can be exported for publishing.`)
    if (confirmation !== `PUBLISH ${job.jobId}`) throw new Error(`Action-time confirmation must exactly equal: PUBLISH ${job.jobId}`)
    const at = now()
    const task = {
      jobId: job.jobId,
      runId: job.runId,
      channel: job.channel,
      createdAt: at,
      targetUrl: "https://x.com/compose/post",
      copy: job.payload?.copy,
      assetPath: job.payload?.asset,
      instructions: [
        "Use an already signed-in browser session only.",
        "Do not inspect, export, print, or store cookies, localStorage, sessionStorage, auth headers, or browser profile files.",
        "Open the target URL, paste the copy exactly, and pause before the final Post click unless the operator has confirmed this exact job at action time.",
        "After posting, copy only the public post URL and update this job with update-receipt.",
      ],
      forbidden: ["OAuth token creation", "Cookie extraction", "Credential prompts", "Background publish without action-time confirmation"],
    }
    const statusHistory = [...job.statusHistory, { status: "ready", at, detail: "Browser publishing task exported after action-time confirmation." }]
    await ctx.db.patch(job._id, { browserTask: task, statusHistory, updatedAt: at })
    return task
  },
})

export const recordVerifiedReceipt = mutation({
  args: {
    jobId: v.string(),
    postUrl: v.string(),
    postId: v.optional(v.string()),
    verifiedBy: v.string(),
    account: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { jobId, postUrl, postId, verifiedBy, account, notes }) => {
    const job = await jobById(ctx, jobId)
    if (job.status === "published") {
      const existing = await ctx.db
        .query("receipts")
        .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
        .unique()
      if (existing && existing.postUrl === postUrl) return receiptShape(existing)
      throw new Error(`Job ${jobId} is already published with a different receipt.`)
    }
    assertTransition(job.status, "published")
    if (!/^https:\/\/(x\.com|twitter\.com)\//.test(postUrl)) {
      throw new Error("Receipt URL must be an https://x.com/ or https://twitter.com/ URL")
    }
    const at = now()
    const receiptId = `receipt-${jobId}`
    const receipt = {
      receiptId,
      jobId,
      runId: job.runId,
      channel: job.channel,
      status: "verified" as const,
      postUrl,
      postId,
      publishedAt: at,
      verifiedAt: at,
      verifiedBy,
      account,
      preview: String(job.payload?.copy ?? "").slice(0, 180),
      verificationLog: [`Verified public URL ${postUrl}`, ...(notes ? [notes] : [])],
      createdAt: at,
      updatedAt: at,
    }
    await ctx.db.insert("receipts", receipt)
    const statusHistory = [...job.statusHistory, { status: "published", at, detail: `Verified receipt recorded for ${postUrl}` }]
    await ctx.db.patch(job._id, { status: "published", statusHistory, updatedAt: at })
    await patchRunStatus(ctx, job.runId, "published")
    return receiptShape(receipt)
  },
})
