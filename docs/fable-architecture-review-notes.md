# Fable Architecture Review Notes

Source: Fable architecture review supplied by the user on 2026-07-12.

Status: External design-review input. These recommendations are not automatically accepted as product decisions; they should be reconciled with the living concept and implementation constraints.

## Central recommendation

The highest-value architecture is not the broadest agency. It is the most repeatable three-to-five-minute live pipeline, instrumented so observability, evaluation, and memory emerge from running it.

The working-product parameter represents 80 of 164 base points and is the only uncapped parameter. Each additional real task completed autonomously during judging can add another 20 points. Therefore, every implementation decision should first be evaluated by whether it makes another verified live X execution more likely.

## Honest target scores

| Parameter | Weight | Recommended target |
|---|---:|---|
| Real output | 20x | L5 if X write access is verified immediately |
| Agent organization | 5x | Strong L4; L5 achievable with genuine runtime role creation |
| Observability | 7x | Strong L4; L5 stretch |
| Evaluation | 5x | Strong L4; L5 plausible |
| Handoffs and memory | 2x | L5 through schema-first shared context |
| Cost and latency | 1x | L4; do not spend time chasing L5 |
| Management UI | 1x | Deliberately target L3 |

## Important scope corrections

### Collapse the product surfaces

Do not independently build four applications. Use one shadcn application with several views over the same backend:

- Catalog.
- Agent visibility.
- Observability.
- A thin audience/mentions panel or no CRM.

A full CRM does not directly improve the AI-as-Agency rubric.

### Narrow the Capability Architect demonstration

The Capability Architect and Tool Builder are philosophically central but dangerous to implement broadly during the buildathon. Demonstrate them through one narrow, durable capability:

1. A Creative Director reports that it repeatedly hand-describes visual assets.
2. The manager creates a Capability Architect role at runtime.
3. It specifies and registers a deterministic branded-card renderer.
4. A Cloudflare Worker implements the renderer.
5. Later runs reuse the registered tool.

The role's creation appears in one historical trace and its reuse appears across later traces. Do not build a new tool live during the final demo.

### Simplify cadence and fallback

Event-driven execution should be the live-demo star. The cron only needs to enqueue a scheduled job. Implement catalog mining as the first fallback and defer the interactive-question fallback.

### Prefer deterministic visual quality

Use a deterministic branded-card renderer based on project palette, code diff, metrics, and template primitives. This is faster and more reliable than generative images, which threaten the required 85% task-success rate.

### De-risk X before architecture work

Before building the rest of the product:

- Create or select the real Wingbeat X account.
- Complete authentication.
- Publish one post programmatically.
- Verify the live post.
- Confirm rate limits and reserve enough writes for rehearsals and judging.

If real X write access fails, the root score may fall to the staged-surface ceiling. This is the project's highest-risk external dependency.

## Recommended single-spine architecture

Use Convex as the shared source of truth for:

- Projects.
- Events.
- Content packages.
- Assets.
- Roles.
- Runs.
- Trace steps.
- Evaluation cases and runs.
- Alerts.
- Policies.
- Registered tools.
- Publish receipts.

This supports several scoring dimensions at once:

- Observability becomes a live view over stored trace steps.
- Memory becomes current-run state, project history, and policy records referenced by ID.
- Failed work can automatically become an evaluation case.
- Convex performs genuine backend work for its partner power-up.

## Agent runtime

The Hermes manager should select roles from a data-defined role registry. Each role contains:

- Prompt or job definition.
- Tool allowlist.
- Guardrails.
- Escalation contract.
- Version.
- Active or paused status.

Different source events should produce visibly different crews:

- Documentation change: no Asset Builder.
- Failure/postmortem: spawn a Technical Fact-Checker.
- Visual product update: spawn an Asset Builder.
- Recurring visual bottleneck: create a Capability Architect role and register the branded-card renderer.

Every agent action must pass through an instrumented event-emission wrapper that records before and after states for every tool call and handoff:

- Agent and parent agent.
- Input and output references.
- Tokens.
- Estimated cost.
- Latency.
- Status.
- Error or escalation.

This wrapper must be built early. Observability should be a property of execution rather than a dashboard reconstructed afterward.

## Content-package state machine

```text
event
→ candidate
→ packaged
→ in_review
⇄ revising
→ approved
→ scheduled
→ veto_window
→ publishing
→ published
→ verified
```

Branches:

```text
veto_window → vetoed | angle_rejected
missed schedule → overdue → revalidated → short veto_window
evaluation fails twice → failed → evaluation case created
```

Every transition should be a trace step with an actor. The Editor-to-revision loop simultaneously demonstrates dynamic management and enforces the evaluation gate.

## Evaluation strategy

### Named evaluation set

Create `wingbeat-content-evals-v1` with approximately eight to ten real project-event cases. Expected properties should cover:

- Claims cite project evidence.
- Copy does not read like a commit summary.
- Prohibited claims are avoided.
- Hook specificity crosses a threshold.
- Brand and voice policies are respected.
- Repeated stories or angles are rejected.

### Automated release gate

Run the set automatically when prompts or agent definitions change. Block a release if the score regresses. Preserve one real blocked change as proof.

### Closed-loop failure capture

When a package fails twice or is vetoed with a reason:

1. Create a versioned evaluation case.
2. Preserve the expected verdict.
3. Associate it with the relevant prompt and role versions.
4. Re-run it against the next version.
5. Show score movement across versions.

## Observability increments

Build L4 first:

- Historical run selection.
- Agent call tree.
- Inputs and outputs.
- Tokens, cost, and latency per step.
- Filters by agent and task.

Then pursue L5 in this order:

1. Cross-run search.
2. Side-by-side passing-versus-failing run comparison highlighting the first divergent step.
3. A cost-spike rule that creates an alert row and sends a Telegram alert.

Only claim L5 if all three work with real stored evidence.

## X happy path

1. A real git push or project event triggers a job.
2. The manager selects a crew and records its reasoning.
3. Project Intelligence extracts context and evidence.
4. Story Detector proposes an angle or chooses the catalog-mining fallback.
5. Copywriter and Asset Builder work in parallel when an asset is needed.
6. Editor scores the package and requests a revision when it fails.
7. Telegram sends the preview, evidence, rationale, asset, countdown, and controls.
8. Silence allows publication.
9. X returns a post identifier.
10. Wingbeat fetches and verifies the live post.
11. A publish receipt and reusable catalog entry are stored.

Wingbeat's own repository can be one test project, but at least one additional real project should be registered to reduce single-project overfitting.

## Architecture theatre to avoid

- A dozen agents that always run in the same order.
- Dynamic spawning that only renames a pre-existing prompt.
- A new role that was already present in the repository at kickoff.
- Vendor observability screenshots without product-level historical traces.
- Seeded CRM leads presented as real data.
- A tool that the agency builds and invokes only once.
- An evaluation suite that has never blocked a change.
- Claims of L5 without real stored evidence.

## Partner priorities

- **Convex:** genuine backend and trace store.
- **Cloudflare:** deploy the UI and run the branded-card Worker.
- **Wispr Flow:** use during the event and preserve the qualifying usage evidence.
- **Linkup:** only if live search visibly informs story or audience context.
- **ElevenLabs:** only if a voice veto summary becomes a real interaction and core work remains on schedule.
- **Dodo Payments:** omit unless checkout becomes coherent product behavior rather than a decorative integration.

## Recommended build order

1. Verify real X publishing and Telegram round-trip.
2. Create the Convex schema and event-emission wrapper.
3. Build manager and data-defined roles.
4. Build the canonical package and three-layer memory.
5. Build Project Intelligence, Story Detector, Copywriter, and Editor revision loop.
6. Build the deterministic branded-card Worker and runtime Capability Architect story.
7. Connect scheduler, veto window, X publish, verification, and receipt.
8. Build the shadcn run list, trace tree, filters, and catalog.
9. Execute multiple rehearsal runs, including a fallback and a real induced failure.
10. Add failure-to-evaluation-case capture, blocked-release evidence, alert, and run diff.
11. Rehearse the live demo and reserve X capacity for judging.

## Recommended demo

### Two-minute live execution

1. Push a real commit.
2. Show the manager assembling a task-specific crew and its selection reasoning.
3. Show the package with evidence in the catalog.
4. Receive the Telegram preview and countdown.
5. Do not intervene.
6. Open the live X post.
7. Show the publish receipt and completed trace.

### One-minute proof

1. Show at least three repeated successful live runs and the measured success rate.
2. Open a failing-versus-passing run comparison.
3. Show the real failure that became a new evaluation case.
4. Show score movement across prompt or role versions.
5. Show one fired cost alert.
6. Show the runtime creation of the Capability Architect and later reuse of its branded-card tool.
7. Open the Convex and Cloudflare evidence for the partner integrations.

## Highest-risk failure modes

1. X access or rate limits fail: test immediately and reserve capacity.
2. Observability is postponed: build event emission into the first execution path.
3. Story variance threatens reliability: constrain the MVP to evidence-backed build-in-public stories.
4. Live latency or hung agents: use deterministic assets, mechanical-role models, timeouts, and escalation.
5. Surface sprawl: cut full CRM, Reddit execution, advanced fallbacks, Dodo, and general workflow building.

## Review conclusion

The architecture should maximize the number of credible, verified real executions. One instrumented Convex spine, truly conditional role selection, a deterministic reusable visual tool, a revision gate, and repeated live X receipts are more valuable than a broader but shallow marketing platform.
