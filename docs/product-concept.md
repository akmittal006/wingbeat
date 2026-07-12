# Wingbeat: Living Product Concept

Status: Working document. This records decisions as they are made and should be updated throughout product design.

Execution companion: [Two-hour AI agency MVP roadmap](./two-hour-mvp-roadmap.md)

External review: [Fable architecture review notes](./fable-architecture-review-notes.md)

## One-line definition

Wingbeat is a dynamic AI marketing agency for Hermes that understands a software project, continuously finds credible stories inside the work, turns them into reusable channel-independent content and beautiful assets, and dispatches specialist execution agents to publish them consistently.

## Motto

**Break down every barrier preventing you from marketing consistently.**

Wingbeat promotes automation over recurring manual work. If consistent, high-quality marketing requires a capability that does not exist yet, the agency should build it. For example, if the project repeatedly needs aesthetically pleasing product-mockup videos, Wingbeat should not merely recommend a video tool or make one disposable video. It should create a reusable mockup-video generator or pipeline that future campaigns and execution agents can invoke.

The agency therefore delivers two kinds of output:

- **Marketing output:** stories, copy, campaigns, visuals, and published posts.
- **Marketing capability:** reusable tools, templates, workflows, integrations, and pipelines that make every later campaign easier and better.

## Who it serves

Wingbeat serves technical product builders across three operating scales:

- Indie developers building in public.
- Developer-tools startups.
- Small product teams and companies.

These are not three separate products. The agency adapts its depth, approval context, cadence, and number of agents to the size and complexity of the project.

## Core product laws

### 1. No meaningful progress stays private

Wingbeat monitors project activity, detects stories worth telling, and maintains publishing momentum. Doing nothing should not silently kill the marketing cadence.

### 2. Beauty is infrastructure

Wingbeat does not settle for repeatedly generating disposable graphics. It detects aesthetic weaknesses and builds or recommends reusable systems: brand rules, asset templates, screenshot pipelines, demo pipelines, visual primitives, and other creative infrastructure.

### 3. Remove the bottleneck, not just the symptom

When Wingbeat encounters a recurring barrier to publishing consistently, it should diagnose the missing capability and automate it. The barrier might be weak screenshots, no demo-video workflow, scattered product facts, unclear positioning, slow approvals, missing distribution access, or an unreliable publishing process. The durable fix becomes part of the project's marketing infrastructure and is available to future agents.

### 4. Intent before content

Wingbeat must understand what changed, why it matters, who should care, and what claims the evidence supports before it creates content. It should translate development activity into a credible human story, not publish raw commit summaries.

### 5. Content is channel-independent; execution is channel-specific

Detected stories, evidence, copy, and assets are stored as canonical content objects. X, Reddit, and future execution agents consume those objects and adapt them to channel-specific formats and norms. Content intelligence must not be trapped inside a posting integration.

### 6. Autonomy with a veto window

Wingbeat is autonomous by default. Before publishing, it sends a preview notification through Telegram or WhatsApp with a countdown and controls to edit, delay, block, or reject an angle. If the user takes no action, the post is published.

## The agency loop

1. **Gather** project context, history, positioning, audience, content, and visual assets.
2. **Observe** new project activity and scheduled cadence deadlines.
3. **Interpret** what happened, why it matters, and whether a credible story exists.
4. **Catalog** evidence, story candidates, approved copy, unused ideas, and assets.
5. **Plan** the strongest next narrative and select the appropriate channel strategy.
6. **Diagnose** the barriers preventing consistent, high-quality execution.
7. **Build** missing tools, templates, integrations, or pipelines when the capability will be reused.
8. **Create** channel-independent content packages and visual assets using the upgraded infrastructure.
9. **Dispatch** packages to channel-specific execution agents.
10. **Notify** the user with a time-limited veto window.
11. **Publish** automatically if the user does not intervene.
12. **Observe** the execution, result, user edits, vetoes, and performance.
13. **Learn** and update project memory, brand preferences, future strategy, and the backlog of capability upgrades.

## Dynamic AI agency for Hermes

Wingbeat is not one large marketing prompt. It is a dynamic agency whose manager assembles specialist agents based on the work required.

Initial roles:

- **Agency manager:** owns the objective, creates the plan, delegates work, and enforces completion.
- **Project intelligence agent:** gathers and refreshes project context.
- **Story detector:** converts activity and project evidence into candidate narratives.
- **Content strategist:** selects audience, angle, timing, and content objective.
- **Catalog curator:** maintains canonical stories, claims, copy, assets, usage history, and relationships.
- **Creative director:** defines the visual direction and identifies aesthetic upgrades.
- **Capability architect:** diagnoses recurring marketing bottlenecks and specifies the durable tool or automation needed to remove them.
- **Tool builder:** creates reusable marketing tools, templates, integrations, and generation pipelines.
- **Asset builder:** uses those capabilities to create campaign assets and improves the underlying asset system when needed.
- **Editor/critic:** checks accuracy, specificity, quality, repetition, and brand fit.
- **Channel adapter:** converts a canonical content package into a native channel payload.
- **Execution agent:** schedules, notifies, publishes, verifies, and recovers failed or missed jobs.
- **Performance analyst:** reads results and feeds learning back into strategy.

The manager may skip unnecessary roles, fan work out to multiple agents, or request another pass when evaluation fails. The resulting organization and handoffs must be visible in the product.

## Canonical content package

Every detected or generated story should become a reusable object rather than an X-specific draft. At minimum it contains:

- Project and source event identifiers.
- Source evidence and links.
- What changed.
- Why it matters.
- Intended audience.
- Core narrative and angle.
- Supported claims and prohibited/uncertain claims.
- Content category: build-in-public, product update, or educational.
- Candidate hooks and long-form body.
- Asset references and asset-generation instructions.
- Brand and aesthetic constraints.
- Confidence and quality scores.
- Recommended channels and timing.
- Channel adaptations and execution history.
- User edits, approvals, vetoes, and rejection reasons.
- Performance results and learned preferences.

This package is the contract between content intelligence and execution agents.

## Content catalog

The catalog is active marketing memory, not a media folder. It should organize:

- Project facts, positioning, audiences, and vocabulary.
- Source-backed claims and their evidence.
- Development events and decisions.
- Candidate and published stories.
- Product updates, build-in-public logs, and educational insights.
- Copy variants, hooks, and calls to action.
- Screenshots, demos, diagrams, templates, and brand assets.
- Relationships between source events, stories, assets, channels, and results.
- What has been used, what remains unused, and what should not be repeated.

The catalog enables layered fallback, cross-channel reuse, auditability, and learning.

## Cadence model: hybrid

Wingbeat combines event-driven detection with scheduled accountability.

- Meaningful project events create candidates as they happen.
- A daily cron selects the strongest unused candidate by the publishing deadline.
- The system should only use claims supported by project evidence.
- A deadline cannot disappear merely because the laptop was offline.

### Layered fallback

If the deadline arrives without a strong new event:

1. Mine the catalog for an unused decision, lesson, failure, technical insight, or behind-the-scenes asset.
2. If no credible candidate exists, ask the user one sharp contextual question and turn the answer into a story.
3. Skip only when neither path produces content that clears the quality and evidence bar.

## Autonomous publishing contract

Before execution, Wingbeat sends a Telegram or WhatsApp notification containing:

- The final preview.
- The target channel and scheduled time.
- Why this story was chosen.
- Its project sources.
- The remaining veto-window duration.
- Actions to edit, delay, block, or permanently reject the angle.

No response means the job proceeds automatically.

If a scheduled job was missed because the device was offline:

1. Mark the job overdue rather than cancelled.
2. Revalidate the content and its timing when Hermes starts again.
3. Send a recovery notification with a shorter veto window.
4. Publish unless blocked.
5. Record the missed schedule and recovery in the run log.

## Channel roadmap

### Loop 1: X

X is the first complete channel loop.

The product will eventually support three content categories:

- Build-in-public logs.
- Product updates.
- Educational posts.

The first production workflow prioritizes **build-in-public logs**. It translates real work into a useful narrative about decisions, trade-offs, failures, lessons, and progress. It must not behave like a commit-summary bot.

The X loop is complete only when it can:

1. Gather project context.
2. Detect or generate a credible build-in-public story.
3. Create a reusable canonical content package.
4. Produce X-native copy and an appropriate visual asset.
5. Evaluate the output against accuracy, specificity, aesthetics, and repetition.
6. Schedule it.
7. Send a veto-window notification.
8. Publish autonomously when not blocked.
9. Verify the live post.
10. Record the run, decisions, artifacts, and result.

### Loop 2: Reddit

Reddit is the second channel loop. It will reuse the same canonical content packages but must have its own community-selection, subreddit-rule, tone, disclosure, and anti-spam logic. Reddit requirements must not complicate the X MVP.

## Product surfaces

### CRM dashboard

The CRM dashboard represents the people and organizations the agency is marketing to or learning from. Initial responsibilities:

- Audiences and audience segments.
- Relevant people, accounts, communities, and relationships.
- Interaction history and engagement signals.
- Leads or users originating from published content.
- Follow-up opportunities and status.

The exact MVP boundary for CRM remains to be decided.

### Agent visibility dashboard

This dashboard explains the live agency organization:

- Which agents were created for a job.
- Their roles, objectives, and current status.
- Delegation and handoff relationships.
- Inputs, outputs, and pending decisions.
- Where human intervention is possible.

Its purpose is to make the dynamic agency understandable rather than presenting an opaque spinner.

### Observability dashboard

This dashboard proves how the system worked:

- Complete run timeline.
- Trigger and cron history.
- Agent steps and tool calls.
- Source evidence and generated artifacts.
- Evaluations, scores, retries, and failure reasons.
- Notification, veto, scheduling, publishing, and recovery events.
- Cost and latency by agent and job.
- Final live-output receipt and performance metrics.

Agent visibility answers **who is doing what now**. Observability answers **what happened, why, at what cost, and with what result**.

## Buildathon MVP

The buildathon MVP should demonstrate one complete, real X workflow rather than shallow coverage of every planned feature.

### Required end-to-end proof

- A user points Hermes at a real project.
- Wingbeat gathers enough context to explain the project and its audience.
- A real project event becomes a source-backed build-in-public story.
- The dynamic agency visibly delegates detection, strategy, creation, critique, and execution.
- The system creates a canonical content package plus an X adaptation and visual asset.
- The user receives a real Telegram notification with a veto countdown.
- With no intervention, the system posts to a real X account.
- The live post and execution receipt appear in the observability dashboard.
- The catalog retains the story and assets for later reuse by a different execution agent.

### MVP dashboard slices

- **Catalog:** inspect the selected story, its evidence, copy, assets, and reuse status.
- **Agency:** inspect the active agent team, delegation, and handoffs.
- **Observability:** inspect the run timeline, evaluations, notification, publish action, cost, latency, and live receipt.
- **CRM:** show the target audience or account context used for the post; deeper lead management can follow after the core loop works.

### Explicitly deferred

- Full Reddit execution.
- Multiple social networks.
- A complete general-purpose CRM.
- Fully autonomous generation of every asset format.
- Comprehensive performance optimization requiring days or weeks of data.
- Large-company approval hierarchies.

## Buildathon success definition

The MVP succeeds when a judge can watch a real project event travel through a visible multi-agent organization into a high-quality, source-backed X post, receive the notification, allow the veto window to expire, open the live post, and trace every decision and artifact afterward.

## Open design decisions

- Which project sources the first context gatherer supports.
- What constitutes a meaningful event and how candidates are scored.
- Daily publishing time and veto-window length.
- The exact X post formats supported in the first workflow.
- The first visual asset type and reusable aesthetic system.
- Which X publishing method is reliable within the buildathon constraints.
- Telegram versus WhatsApp for the first notification path.
- The minimum CRM data model.
- The orchestration and persistence architecture for dynamic agents.
- The evaluation rubric and retry thresholds.
- The buildathon test project and real X account used for proof.
