# Wingbeat Architecture Review Brief

You are acting as a principal agent-systems architect and hackathon scoring strategist. We are building **Wingbeat**, a dynamic AI marketing agency for Hermes, for the GrowthX Hermes Buildathon **AI as Agency** track.

Do not write code or edit files. Brainstorm, pressure-test, and recommend an architecture for the first complete workflow: an autonomous X build-in-public pipeline.

Challenge our assumptions. Optimize for verified score rather than feature count. Favor inspectable, repeatable real work over architecture theatre. Be candid where an L5 score is unrealistic within eight hours and recommend the strongest demonstrable alternative.

## Product definition

Wingbeat is a dynamic AI marketing agency for Hermes. A user points Hermes at a software project. Wingbeat gathers its context, activity, positioning, audience, existing content, and visual assets. It continuously identifies credible stories inside the work, turns them into channel-independent content packages and beautiful assets, and dispatches specialist execution agents to publish them consistently.

Wingbeat serves:

- Indie developers building in public.
- Developer-tools startups.
- Small product teams and companies.

These are three operating scales of one product, not three separate products.

## Motto

> Break down every barrier preventing you from marketing consistently.

Wingbeat favors automation over recurring manual work. When consistent marketing requires a capability that does not exist, the agency should build that capability.

For example, if the project repeatedly needs aesthetically pleasing product-mockup videos, Wingbeat should not merely suggest a tool or produce one disposable video. Its Capability Architect and Tool Builder should create a reusable mockup-video generator or pipeline that later campaigns and channel execution agents can invoke.

The agency therefore produces two kinds of value:

- **Marketing output:** stories, copy, campaigns, visuals, and published posts.
- **Marketing capability:** reusable tools, templates, workflows, integrations, and asset-generation pipelines.

## Product laws

1. **No meaningful progress stays private.** Wingbeat maintains publishing momentum. Inaction should not silently kill the cadence.
2. **Beauty is infrastructure.** It should improve reusable visual systems instead of repeatedly making disposable graphics.
3. **Remove the bottleneck, not only the symptom.** Diagnose recurring barriers and build durable automation to remove them.
4. **Intent before content.** Understand what changed, why it matters, who cares, and what the evidence supports. Do not post raw commit summaries.
5. **Content is channel-independent; execution is channel-specific.** Content intelligence produces canonical packages. X, Reddit, and future channel agents adapt and execute them.
6. **Autonomy with a veto window.** The system notifies the user before publishing, but silence means it proceeds.

## Agency operating loop

1. Gather project context, history, positioning, audience, content, and assets.
2. Observe project events and cadence deadlines.
3. Interpret what happened and determine whether a credible story exists.
4. Catalog evidence, candidates, approved copy, unused stories, and assets.
5. Plan the strongest narrative, audience, and channel strategy.
6. Diagnose barriers to consistent, high-quality execution.
7. Build missing reusable tools, templates, integrations, or pipelines.
8. Create a canonical content package and visual assets.
9. Dispatch it to channel-specific execution agents.
10. Notify the user with a time-limited veto window.
11. Publish automatically if the user does not intervene.
12. Observe the run, live result, user edits, vetoes, failures, cost, and performance.
13. Learn and update project memory, brand preferences, strategy, evals, and the capability-upgrade backlog.

## Dynamic agency concept

Wingbeat must not be one large prompt disguised as a multi-agent product. An Agency Manager should assemble only the roles a particular job needs, potentially including:

- Project Intelligence Agent.
- Story Detector.
- Content Strategist.
- Catalog Curator.
- Creative Director.
- Capability Architect.
- Tool Builder.
- Asset Builder.
- Editor/Critic.
- Channel Adapter.
- Execution Agent.
- Performance Analyst.

The manager may skip unnecessary roles, dynamically spawn a new specialist, fan out work, review outputs, request revisions, and receive precise escalations from blocked specialists. The organization, handoffs, decisions, and artifacts must be visible.

## Channel-independent content contract

Detected or generated content must become a reusable canonical object, not an X-specific draft. It should include at least:

- Project and source-event identifiers.
- Source evidence and links.
- What changed and why it matters.
- Intended audience.
- Core narrative and selected angle.
- Supported, uncertain, and prohibited claims.
- Category: build-in-public, product update, or educational.
- Candidate hooks and channel-neutral body.
- Asset references and generation instructions.
- Brand and aesthetic constraints.
- Confidence and quality scores.
- Recommended channels and timing.
- Channel adaptations and execution history.
- User edits, vetoes, approvals, and rejection reasons.
- Performance results and learned preferences.

This object is the contract between content intelligence and X, Reddit, or any later execution agent.

## Cadence and autonomy

The cadence is hybrid:

- Meaningful project events create candidates as they happen.
- A daily cron selects the strongest unused candidate by the deadline.

If no strong new event exists, use layered fallback:

1. Mine the catalog for an unused decision, failure, lesson, technical insight, or behind-the-scenes asset.
2. If nothing qualifies, ask the user one sharp contextual question and turn the answer into a story.
3. Skip only if neither produces credible content.

Before publishing, Telegram or WhatsApp sends:

- Final preview.
- Target channel and scheduled time.
- Why the story was selected.
- Project sources.
- Remaining veto time.
- Edit, delay, block, and permanently reject-angle controls.

No response means the post proceeds automatically.

If the laptop was offline at the scheduled time, the job becomes overdue rather than cancelled. When Hermes restarts, Wingbeat revalidates it, sends a shorter recovery warning, publishes unless blocked, and records the recovery in the trace.

## First complete workflow: X

The eventual content categories are:

- Build-in-public logs.
- Product updates.
- Educational posts.

The first production workflow prioritizes **build-in-public logs**. It should turn real development activity into useful narratives about decisions, trade-offs, failures, lessons, and progress. It must not act like a commit-summary bot.

The X workflow is complete when it:

1. Gathers context from a real project.
2. Detects or generates a credible build-in-public story.
3. Creates the canonical content package.
4. Produces X-native copy and an appropriate visual asset.
5. Evaluates accuracy, specificity, aesthetics, repetition, and brand fit.
6. Schedules the post.
7. Sends a real Telegram veto notification.
8. Publishes autonomously when not blocked.
9. Verifies the real live X post.
10. Records every decision, handoff, artifact, cost, evaluation, and receipt.

The content package and assets must remain reusable by a future Reddit execution agent. Reddit itself is outside the first workflow.

## Product surfaces

The product needs four focused surfaces:

### Catalog

Inspect project facts, evidence, candidates, published stories, copy, assets, usage history, and cross-channel reuse.

### CRM

Represent audiences, relevant people/accounts/communities, relationships, engagement history, content-originated users or leads, and follow-up opportunities. A comprehensive general-purpose CRM is not required for the MVP.

### Agent visibility

Show which agents exist for the current job, their roles, plans, status, delegation and handoff relationships, inputs, outputs, blockers, and intervention points.

### Observability

Show the historical run timeline, trigger/cron history, trace tree, agent steps, tools, evidence, artifacts, evaluations, retries, failures, tokens, cost, latency, notifications, vetoes, scheduling, publishing, recovery, live receipt, and performance.

Agent visibility answers **who is doing what now**. Observability answers **what happened, why, at what cost, and with what result**.

## Buildathon proof

The live proof should end with:

- A real project event.
- A visibly dynamic agent organization.
- A source-backed build-in-public content package.
- X-native copy and an attractive visual.
- A real Telegram notification and countdown.
- No user intervention.
- A real X post published after the veto window expires.
- A live execution receipt and fully inspectable trace.
- The catalog retaining the same package for later channel reuse.

## Official AI-as-Agency scoring rubric

Formula: `points = (level - 1) × weight`. Base maximum: **164 points**. Real-output overflow is uncapped.

### 1. Working product shipping real output — 20x, maximum 80

This is the root parameter. A real surface means something a paying customer could use tomorrow. Staged WordPress, sandbox Gmail, mocked CRM, and similar test surfaces cannot score above L3. After L5, each additional real task completed autonomously during judging earns another 20 points.

- **L1:** Demo or canned responses only; zero completed tasks.
- **L2:** Agents run, but output is broken, hallucinated, incomplete, or unusable; under 30% task success.
- **L3:** Useful working output on staged or test surfaces; approximately 50–70% success. This is the ceiling for staged surfaces.
- **L4:** Real output on real surfaces, but a human approves every final action; approximately 70–85% success.
- **L5:** End-to-end production-quality work on live surfaces, at least 85% success across three or more repeated runs. The crew retrieves, classifies, decides, and writes without judge intervention. Humans see exceptions only, with full context instead of a restart.

### 2. Agent organization structure — 5x, maximum 20

- **L1:** One monolithic agent does everything.
- **L2:** Two or three agents with hard-coded handoffs and no manager.
- **L3:** Manager plus distinct specialists, but routing remains static.
- **L4:** Manager reads the specific request, decomposes it dynamically, delegates subtasks, reviews outputs, and sends at least one weak result back for revision.
- **L5:** Emergent organization. The manager spawns new specialists on demand, roles adjust to the task, and blocked agents escalate precise blockers. A mentor should see a role that did not exist at kickoff.

### 3. Observability — 7x, maximum 28

The tool or vendor does not matter; demonstrated capability does.

- **L1:** Console prints only.
- **L2:** Persistent structured logs, but no viewing interface.
- **L3:** A UI can open a specific historical run and show each agent's inputs, outputs, and steps.
- **L4:** Cross-agent trace tree showing who called whom, token and cost per step, and filtering by agent or task.
- **L5:** Production-grade run comparison, failure/cost-spike alerts, and search across runs. A mentor can diagnose a regression from a passing-versus-failing diff and inspect an alert that actually fired.

### 4. Evaluation and iteration — 5x, maximum 20

- **L1:** No evaluations.
- **L2:** Informal manual spot-checking.
- **L3:** A named, fixed evaluation set with expected outcomes, manually run to compare versions.
- **L4:** Automated CI-style evaluations block a release when quality drops; the team can show a real blocked release.
- **L5:** Failed production runs automatically become versioned evaluation cases. Prompts and agent definitions are version-controlled, and score trends show measurable gains across versions. A mentor can trace one real failure into the growing evaluation set.

### 5. Agent handoffs and memory — 2x, maximum 8

- **L1:** No memory; every turn begins from zero.
- **L2:** One or two basic identity fields persist, but not meaningful task context.
- **L3:** Current-task context persists within one run but is lost at a handoff.
- **L4:** Context crosses one or two handoffs and includes relevant recent history.
- **L5:** Three layers survive all handoffs: the current job, this user/project's history, and business/brand/publishing policy.

### 6. Cost and latency per task — 1x, maximum 4

The worse of cost or latency determines the level.

- **L1:** More than 30 minutes or more than $5.
- **L2:** 10–30 minutes or $2–$5.
- **L3:** 5–10 minutes or $0.50–$2.
- **L4:** 1–5 minutes or $0.10–$0.50.
- **L5:** Under one minute and under $0.10 for the entire representative real task.

### 7. Management UI — 1x, maximum 4

- **L1:** Code or CLI only.
- **L2:** Basic developer-only web UI.
- **L3:** Functional interface a PM can use with documentation to pause agents, edit prompts, review output, and retry work.
- **L4:** Clean interface a non-engineer can operate after one walkthrough.
- **L5:** During judging, an unchosen non-engineer creates a new role—job, tools, and guardrails—in under 10 minutes without help, and that role works.

## Partner power-ups

Each genuine integration earns 25 points. A decorative integration earns nothing.

- **Convex:** Stores real product state or acts as the main backend. Evidence: repository and Convex dashboard.
- **Cloudflare:** Hosting, Workers, or another Cloudflare product performs real work. Evidence: live URL and dashboard.
- **Linkup:** Live search performs real product work. Evidence: code and live query.
- **ElevenLabs:** Voice performs a real product function, not a dead demo snippet. Evidence: live interaction.
- **Wispr Flow:** At least 500 words dictated during the event. Evidence: usage screenshot.
- **Dodo Payments:** A real live checkout exists; creating an account alone does not qualify. Evidence: checkout and dashboard.

## Requested architecture deliverable

Produce a concrete recommendation covering all of the following:

1. The manager, dynamic specialist spawning, delegation, review, handoffs, escalation, and exception-only human involvement.
2. The exact X happy path and at least three repeated live runs that can credibly satisfy the L5 root-output test.
3. The canonical channel-independent content-package contract.
4. Three-layer memory: current job, project/user history, and business/brand/publishing policy. State exactly what crosses every handoff.
5. L5 observability: trace tree, tokens/cost/latency per step, filters, cross-run search, passing-versus-failing diff, failure and cost alerts, regression diagnosis, and publish receipt.
6. Closed-loop evaluation: the initial named evaluation set, automatic release gates, real failures becoming versioned cases, and measurable score trends.
7. The smallest credible management UI path toward the L5 non-engineer volunteer test.
8. How the Capability Architect and Tool Builder can detect a recurring marketing bottleneck and build a reusable asset pipeline without making the demo scope explode.
9. A mapping from every architectural component to the relevant rubric parameter and an honest expected L1–L5 score.
10. A score-maximizing priority order for an eight-hour build.
11. Architecture theatre that mentors would reject even if it looks multi-agent.
12. Only the partner power-ups that genuinely strengthen this workflow.

End your response with:

- A Mermaid system/component diagram.
- Core entities and state transitions.
- An hour-by-hour eight-hour implementation order.
- A two-minute live demo and one-minute proof plan.
- The five most dangerous failure modes and associated scope cuts.

The goal is not to design the broadest marketing platform. The goal is to demonstrate a real autonomous agency completing a high-quality marketing job on live surfaces, repeatedly, with enough evidence that every claimed rubric level survives mentor verification.
