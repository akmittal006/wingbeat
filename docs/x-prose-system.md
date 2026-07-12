# Wingbeat X Prose System

Version: 2026-07-12-grok-reviewed
Channel: X/Twitter
Canonical machine contract: `src/data/x-prose-playbook.json`

This playbook turns Wingbeat content packages into native X prose for technical builders. The 17-category semantic taxonomy is canonical, but all category ids are now kebab-case for machine use.

## ID Migration

| Old id | New id |
|---|---|
| `daily_build_log` | `daily-build-log` |
| `product_introduction` | `product-introduction` |
| `product_launch` | `product-launch` |
| `feature_intro_launch` | `feature-intro-launch` |
| `insight_lesson` | `insight-lesson` |
| `milestone_proof` | `milestone-proof` |
| `failure_learning` | `failure-learning` |
| `technical_decision` | `technical-decision` |
| `experiment_result` | `experiment-result` |
| `community_feedback` | `community-feedback` |
| `changelog_update` | `changelog-update` |
| `demo_video_post` | `demo-video-post` |
| `open_source_repo_launch` | `open-source-repo-launch` |
| `waitlist_early_access` | `waitlist-early-access` |
| `comparison_contrarian` | `comparison-contrarian` |
| `thread_opener` | `thread-opener` |
| `follow_up_replies` | `follow-up-replies` |

No underscore category ids are valid after this migration.

## Research Basis

- Local Wingbeat evidence: product concept, README, architecture, browser X executor contract, TypeScript run/content types, and seed content package.
- Social skill references: X platform limits, post templates, and reverse-engineering method.
- Visible public X examples inspected in Chrome: Vercel, Linear, Guillermo Rauch, eve, shadcn, Anchored, Brydon Parker, Cal.com, and related visible search/timeline posts.
- Grok review in the user-approved signed-in x.com Chrome session, scoped only to the Wingbeat prose brief, category definitions, selected examples, and eval rules.

See `docs/x-prose-research-appendix.md` for method, source links, Grok themes, and direct-observation versus inference labels.

## Global Voice

Default voice: direct founder-builder prose. The first introduction can say "Building Wingbeat" or "Introducing Wingbeat" and explain audience, capability, first shipped loop, and access state. Progress posts should not reintroduce the whole product; they should name the exact change, its visible consequence, and the evidence gate.

Use this introduction frame only for cold audiences:

```text
Building/Introducing Wingbeat.

It helps [specific builder] turn [real project evidence] into [specific public story/output].

Current loop: [concrete shipped behavior].

CTA: [access, feedback, or follow-along].
```

## Global Rules

- Standard X variants must be at or under 280 characters.
- Premium variants may be longer only when there is a real story arc.
- Use zero or one hashtag. Usually use none.
- A link goes after context, not before it.
- Video captions must describe visible behavior in the asset.
- Launch, open-source, waitlist, public availability, user, metric, funding, social-proof, and published/live claims require explicit evidence.
- Do not write commit summaries. Translate work into a human/product story.
- Do not let architecture nouns become the hook unless the post explains the user-visible consequence.

## Forbidden Language

Global forbidden phrases: `excited to announce`, `game-changing`, `revolutionary`, `transform your marketing`, `10x`, `supercharge`, `the future of marketing is here`, `seamless`, `robust`, `cutting-edge`, `leverage`.

Unsupported without evidence: `published`, `live`, `launched`, `official launch`, `production-ready`, `users love`, `people asked`, `customers`, `waitlist size`, `revenue`, `impressions`, `viral`, `raised funding`, `fastest`, `best`, `first`, `thousands`, `millions`.

## Auto-Reject Rules

- Claim not present in supportedClaims or evidence.
- Live/published claim without verified receipt evidence.
- Launch/public access claim without access evidence.
- Wingbeat named for cold audience without explaining what it does.
- Raw commit summary or file list.
- Fake metric, user, customer, social proof, waitlist, funding, release, or publication claim.
- CTA appears before concrete value.
- More than one hashtag.
- Architecture jargon outweighs user-visible outcome.

## Category Routing

- `daily-build-log`: Meaningful work happened today but it is not a launch.
- `product-introduction`: Introducing Wingbeat or a major repositioning to a cold audience.
- `product-launch`: A real public launch or usable release exists.
- `feature-intro-launch`: A feature changes what the user can do.
- `insight-lesson`: A build decision reveals a transferable principle.
- `milestone-proof`: A meaningful artifact or threshold exists.
- `failure-learning`: A real failed draft, missed boundary, flaky integration, or wrong assumption happened.
- `technical-decision`: Architecture matters because it changes safety, reliability, trust, speed, or product fit.
- `experiment-result`: A real test, evaluator run, dogfood run, or comparison exists.
- `community-feedback`: Feedback can change the product.
- `changelog-update`: One or more small updates are real and useful.
- `demo-video-post`: A real video/GIF/screen recording exists.
- `open-source-repo-launch`: Repository is public or a major open-source milestone ships.
- `waitlist-early-access`: A real waitlist or early access path exists.
- `comparison-contrarian`: A contrast clarifies product philosophy.
- `thread-opener`: Explaining architecture, launch story, postmortem, or framework.
- `follow-up-replies`: Responding under own post or in thread follow-ups.

## Categories

### daily-build-log

Audience intent: Follow real progress, learn from decisions, and judge credibility.
Evidence required: sourceEvent, productImplication, nextStepOrOpenQuestion
Evidence gate: Use for real progress only; do not re-explain Wingbeat unless the target audience is cold and this is the first post in a sequence.
Use when: Meaningful work happened today but it is not a launch.
Avoid when: The only fact is edited files or private context.
Emotional posture: Honest, close to the work, lightly reflective.
Hook families: Today I built... | Today Wingbeat learned... | I changed X because... | The useful part was not X. It was Y.
Beat sheet: moment -> concrete work -> why it mattered -> next constraint
Length bands: short 80-150; standard 160-280; Premium 450-1200
Line-break rhythm: Short hook, blank line, one or two explanation lines, optional final line.
CTA patterns: none | Would you trust this before publish?
Link/visual/video placement: Screenshot or trace after the claim; no link unless public artifact exists.
Hashtag posture: Optional #BuildInPublic.
Forbidden language: day X of building without substance | raw commit summaries | grind
Auto-reject: no source event | no user-visible meaning | published claim without receipt
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
Wingbeat now keeps the rejected draft and critic trace instead of overwriting them.

The next run can see exactly which claim was blocked.
```

standard:
```text
Today the run object started carrying the full evaluation history, not just the final draft.

If a claim fails evidence review, that failure stays attached. No silent regeneration.
```

premiumLong:
```text
Today I changed the part of Wingbeat that decides what survives a failed draft.

Before, the useful artifact was easy to lose: the critic said no, the system revised, and the final post looked clean.

Now the rejected draft, the failing claim, and the critic note stay with the run. That makes the next attempt smarter and makes the console more honest.
```

videoCaption:
```text
Watch the critic reject a confident draft, then keep the failed claim attached to the run.
```

altShort:
```text
Small build note: failed copy is now evidence too.

Wingbeat keeps the rejection reason so the same claim does not sneak back into the next draft.
```

altStandard:
```text
Built today: persistent critic history.

The final X draft is no longer the only artifact that matters. Wingbeat stores what failed, why it failed, and which claim needs different evidence.
```

### product-introduction

Audience intent: Understand what Wingbeat is and whether it is for them.
Evidence required: productDefinition, targetAudience, firstShippedLoop, currentStatus
Evidence gate: Use only when the audience needs the core product explained; this is the home for the direct Building/Introducing voice.
Use when: Introducing Wingbeat or a major repositioning to a cold audience.
Avoid when: Only a minor internal change happened.
Emotional posture: Clear, confident, builder-direct.
Hook families: Building Wingbeat: | Introducing Wingbeat. | Wingbeat is... | I'm building X for Y.
Beat sheet: name -> audience -> capability -> first shipped loop -> access or feedback
Length bands: short 120-180; standard 200-280; Premium 600-1500
Line-break rhythm: Name/capability lead, blank line, capability lines, CTA.
CTA patterns: Follow along | Ask for early access | Tell me what project you'd point it at
Link/visual/video placement: Demo/dashboard visual after line one; link at end.
Hashtag posture: None.
Forbidden language: unexplained Wingbeat | generic AI marketing agency | motto-only
Auto-reject: no audience | no concrete first loop | hosted service implied without evidence
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
Building Wingbeat: an AI marketing agency for developers who ship real work, then forget to turn it into public stories.
```

standard:
```text
Introducing Wingbeat.

It reads a software project, finds the story inside real work, checks what the post is allowed to claim, and prepares X copy behind a publish boundary.

First loop: build-in-public posts for technical builders.
```

premiumLong:
```text
A feature ships. A trade-off is chosen. A bug teaches something.

Then the work stays in the repo because writing the update is its own task.

Wingbeat is my attempt to automate that loop without letting the agent make things up: inspect the project, choose a story, validate claims, draft for X, and stop before publishing until the handoff is approved and verifiable.
```

videoCaption:
```text
Building Wingbeat: from real project work to checked X copy, with publish kept behind a visible gate.
```

altShort:
```text
Wingbeat turns project work into source-checked X posts for developers building in public.
```

altStandard:
```text
Building Wingbeat for the awkward gap between shipping and telling people.

The first version watches project evidence, drafts a builder-native X post, critiques unsupported claims, and prepares a safe browser handoff.
```

### product-launch

Audience intent: Decide whether to try, share, or watch the product now.
Evidence required: publicAvailability, link, supportedCapability, limitations
Evidence gate: Disabled unless public access evidence exists. If access is only local/private, use product-introduction, demo-video-post, or milestone-proof instead.
Use when: A real public launch or usable release exists.
Avoid when: Only a local prototype, private demo, or no stable access path exists.
Emotional posture: Direct, concrete, proud but not inflated.
Hook families: Wingbeat is live | Launching Wingbeat | You can now... | The first public loop is ready
Beat sheet: launch state -> who it is for -> what works now -> limitation -> CTA
Length bands: short 120-180; standard 200-280; Premium 700-1800
Line-break rhythm: Launch line, blank line, capability bullets or compact sentences.
CTA patterns: try it | inspect repo | request access | reply with project
Link/visual/video placement: Product/repo link at end; demo video preferred.
Hashtag posture: None.
Forbidden language: official launch without evidence | fake users | fake press | fake waitlist size
Auto-reject: no public URL | no access path | no limitation
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
Wingbeat is open to try: point it at a project, review the source-checked X draft, and approve the browser handoff only when the claim trail looks right.
```

standard:
```text
Wingbeat is now available for technical builders who want build-in-public posts from real project work.

It reads evidence, drafts the X post, flags unsupported claims, and requires a verified receipt before anything is marked published.
```

premiumLong:
```text
Launching Wingbeat today with one narrow promise: turn real software work into honest X posts.

The first public loop reads project evidence, finds one story, drafts copy for X, checks risky claims, and keeps publishing behind an explicit handoff.

It is not a generic scheduler. It is a trust boundary around automated marketing.
```

videoCaption:
```text
Launch demo: project evidence becomes an X draft, then waits for approval before publish.
```

altShort:
```text
Wingbeat is live for builders who need public updates from real repo work, not invented launch copy.
```

altStandard:
```text
You can now try Wingbeat on an active project.

Best fit: you ship often, your repo has the real story, and you want X posts that preserve what is known, unknown, and not safe to claim.
```

### feature-intro-launch

Audience intent: Understand a new capability and why it matters.
Evidence required: featureName, userVisibleBehavior, beforeAfter, availability
Evidence gate: Use when a concrete capability changed for the operator or reader; translate internal states into visible outcomes.
Use when: A feature changes what the user can do.
Avoid when: The change is internal cleanup with no user-facing effect.
Emotional posture: Crisp, useful, capability-led.
Hook families: New: | You can now... | Wingbeat now... | I added X so Y
Beat sheet: feature -> capability -> why -> proof or visual -> CTA
Length bands: short 80-140; standard 160-280; Premium 500-1200
Line-break rhythm: One-line feature, blank line, one consequence, optional detail.
CTA patterns: try the feature | inspect example | reply with edge case
Link/visual/video placement: Visual immediately after hook for visual features; link at end.
Hashtag posture: None.
Forbidden language: internal class names as feature names | minor improvements | better UX
Auto-reject: feature not visible | no before/after
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
New in Wingbeat: a run cannot become published just because copy exists. It needs the receipt field filled by the executor.
```

standard:
```text
Wingbeat now treats publishing as separate states instead of one success flag.

A run can be queued, vetoed, ready for handoff, blocked, or published only after a receipt exists.
```

premiumLong:
```text
New in Wingbeat: the publish path is no longer a vague success state.

A draft can pass review and still stop before posting. A browser handoff can be ready and still remain outside the final state until the receipt is recorded.

That distinction is small in the UI and huge for trust.
```

videoCaption:
```text
The run reaches ready, then stops. No receipt, no published state.
```

altShort:
```text
Feature shipped: Wingbeat now shows which gate stopped a post instead of collapsing everything into done.
```

altStandard:
```text
I added explicit publish gates to Wingbeat.

The operator can now tell whether a post is waiting on review, handoff, block, or receipt instead of guessing from a generic status.
```

### insight-lesson

Audience intent: Learn something useful from the build.
Evidence required: incidentOrDecision, lesson, broaderImplication
Evidence gate: Requires a transferable rule that came from a concrete Wingbeat event; do not use for failure stories unless the lesson is broader than the failure.
Use when: A build decision reveals a transferable principle.
Avoid when: The lesson is generic or disconnected from a product story.
Emotional posture: Reflective, earned, not preachy.
Hook families: I was wrong about... | The lesson: | The hard part wasn't... | A small product rule I trust more now:
Beat sheet: belief -> event -> correction -> practical takeaway
Length bands: short 100-160; standard 180-280; Premium 500-1400
Line-break rhythm: Short claim, blank line, story lines, landing line.
CTA patterns: Where would this break? | How do you handle this?
Link/visual/video placement: Optional trace screenshot if it proves the lesson.
Hashtag posture: None.
Forbidden language: abstract maxims without evidence | guru tone | universal claims
Auto-reject: no story | no product consequence
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
The hard part is not making an agent write a post.

The hard part is making it know which sentence it is not allowed to write.
```

standard:
```text
Wingbeat taught me a product rule I trust more now:

Marketing automation should fail on unsupported claims before it fails on style.

Bad tone is fixable. False confidence is dangerous.
```

premiumLong:
```text
The more I work on Wingbeat, the less I care about whether the first draft sounds polished.

A polished draft can still be wrong in the only way that matters: it can imply a launch, receipt, user, or result that does not exist.

So the prose system has to treat evidence fit as the first creative constraint, not a compliance pass at the end.
```

videoCaption:
```text
The critic blocks the completion claim because the receipt is missing. That is the product lesson.
```

altShort:
```text
Tone was never the real failure mode.

The real failure mode is confident copy one source ahead of the truth.
```

altStandard:
```text
A useful marketing agent needs a boring habit: every strong sentence should know its source.

If the source is missing, the sentence should disappear instead of getting softened into vague copy.
```

### milestone-proof

Audience intent: See credible progress or proof without hype.
Evidence required: milestone, proofArtifact, limitation
Evidence gate: Requires a concrete artifact outside the claim itself; avoid subjective proof language like first real proof point.
Use when: A meaningful artifact or threshold exists.
Avoid when: Finished a task is the only proof.
Emotional posture: Grounded satisfaction.
Hook families: Milestone: | First time Wingbeat... | It now... | Proof point:
Beat sheet: milestone -> proof -> why it matters -> remaining limitation
Length bands: short 80-150; standard 160-280; Premium 450-1000
Line-break rhythm: Proof first, context second.
CTA patterns: inspect | try | ask what proof would convince you
Link/visual/video placement: Proof artifact central; screenshot/demo/link when public.
Hashtag posture: Optional build-in-public only.
Forbidden language: milestone inflation | production-ready without evidence
Auto-reject: no proof artifact | no limitation
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
One persisted run object now feeds the agency trace, X job states, and console.
```

standard:
```text
The agency run, X job, and console now read from one persisted object.

A veto or receipt update appears in all three without separate copies.
```

premiumLong:
```text
Milestone: Wingbeat now has one place where the run story exists.

The evidence, draft history, X adaptation, execution state, and receipt status travel together.

That means the console can show the actual run instead of a stitched-together version that only looks coherent after manual syncing.
```

videoCaption:
```text
One run object updates the story, execution state, and console together.
```

altShort:
```text
Proof artifact: the same run data now drives copy, evaluation, execution state, and UI display.
```

altStandard:
```text
The useful milestone is not a prettier demo.

It is that Wingbeat now has a shared run object, so a blocked claim or missing receipt is visible wherever the run is inspected.
```

### failure-learning

Audience intent: Trust the builder more because failures are specific and useful.
Evidence required: failure, diagnosis, fixOrLearning, currentRisk
Evidence gate: Use for a specific failed run, draft, assumption, or integration; include the correction and current remaining risk.
Use when: A real failed draft, missed boundary, flaky integration, or wrong assumption happened.
Avoid when: Failure involves private or security-sensitive detail.
Emotional posture: Candid, responsible, non-dramatic.
Hook families: This failed because... | I got this wrong: | The first version lied by omission | A bug I am glad I caught:
Beat sheet: failure -> consequence -> diagnosis -> correction -> watch item
Length bands: short 100-160; standard 180-280; Premium 500-1300
Line-break rhythm: Direct failure line, blank line, explanation, fix.
CTA patterns: ask for edge cases only if useful
Link/visual/video placement: Trace screenshot or diff if no secrets.
Hashtag posture: Optional build-in-public.
Forbidden language: faux vulnerability | blaming tools or users | private logs
Auto-reject: no actual failure | no fix or learning
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
First bad draft passed tone but claimed a public post existed.

The critic now checks receipt status before allowing that sentence.
```

standard:
```text
The failure was subtle: the draft sounded launch-ready, but the run only had a browser handoff.

Now Wingbeat blocks published/live wording unless receipt evidence is present.
```

premiumLong:
```text
A failure I am glad Wingbeat caught: the draft used the language of a completed public post while the executor only had a ready handoff.

That is exactly the kind of confident half-truth an auto-marketing product cannot allow.

The fix is stricter than tone review: publication words require publication evidence.
```

videoCaption:
```text
The draft says published. The receipt field is empty. The critic blocks it.
```

altShort:
```text
Bad draft: good rhythm, wrong truth state.

It treated ready as published.
```

altStandard:
```text
I kept the failed draft because it shows the product boundary clearly.

Ready means ready for handoff. Published means a verified public URL was recorded. The copy cannot blur those states.
```

### technical-decision

Audience intent: Learn the reasoning behind a product or engineering choice.
Evidence required: decision, alternatives, reason, userConsequence
Evidence gate: Use only when the engineering choice changes trust, reuse, safety, or operator understanding.
Use when: Architecture matters because it changes safety, reliability, trust, speed, or product fit.
Avoid when: It is just implementation trivia.
Emotional posture: Precise, practical, lightly opinionated.
Hook families: I chose X over Y because... | Technical decision: | The boring architecture choice: | Why Wingbeat uses...
Beat sheet: decision -> rejected alternative -> reason -> consequence
Length bands: short 100-160; standard 180-280; Premium 600-1600
Line-break rhythm: Decision first, blank line, explanation.
CTA patterns: ask for counterexamples from builders
Link/visual/video placement: Diagram or trace if it clarifies.
Hashtag posture: None.
Forbidden language: jargon as status | untranslated internal type names
Auto-reject: no user consequence | no alternative
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
Technical decision: the X post is not Wingbeat's source of truth.

The evidence package is.
```

standard:
```text
I kept Wingbeat's content package channel-independent.

The X adapter can write copy, but it cannot rewrite the evidence. That keeps future channels from inheriting X-shaped shortcuts.
```

premiumLong:
```text
Technical decision in Wingbeat: channel adapters are downstream of the content package.

The package owns what changed, why it matters, audience, evidence, supported claims, and prohibited claims.

X gets to adapt that story to the feed. It does not get to decide what is true.
```

videoCaption:
```text
Behind the scenes: the evidence package exists before the X adapter writes copy.
```

altShort:
```text
Architecture choice: separate truth from distribution.

The content package decides claims. X only decides shape.
```

altStandard:
```text
I chose a channel-neutral package before the X adapter because marketing memory should outlast one post.

A Reddit adapter later should reuse the same evidence, not reverse-engineer it from a tweet.
```

### experiment-result

Audience intent: See what was tested, what happened, and what will change.
Evidence required: hypothesis, method, result, limitation, nextAction
Evidence gate: Requires hypothesis, method, result, limitation, and next action; quantify only measured facts.
Use when: A real test, evaluator run, dogfood run, or comparison exists.
Avoid when: No result exists or the sample is too thin.
Emotional posture: Empirical, modest.
Hook families: Experiment: | I tested... | Result: | The surprising part...
Beat sheet: hypothesis -> test -> result -> interpretation -> next test
Length bands: short 100-160; standard 180-280; Premium 600-1500
Line-break rhythm: Label result clearly; do not bury limitation.
CTA patterns: ask what to test next
Link/visual/video placement: Chart/table/screenshot if result is visual; avoid fake precision.
Hashtag posture: None.
Forbidden language: broad claims from one run | invented metrics | misleading percentages
Auto-reject: no method/result | unsupported quantitative claim
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
Tested a launch-ready-sounding draft with no receipt.

Result: the critic rejected the publication claim, not the prose.
```

standard:
```text
I tested Wingbeat with a draft that sounded good but had the wrong truth state.

It said the post was public. The run only had a handoff.

The evidence gate caught it.
```

premiumLong:
```text
Experiment: can Wingbeat reject a polished post for the right reason?

I gave it copy that implied publication before the executor had a receipt.

The critic failed the exact sentence that outran the evidence, then preserved the failure in the run history.

Next test: make the rewrite remove the claim instead of hiding it behind softer wording.
```

videoCaption:
```text
Experiment result: polished copy fails because the receipt is missing.
```

altShort:
```text
Result from today's test: tone passed, evidence failed.

That is the right failure order for Wingbeat.
```

altStandard:
```text
The test case was intentionally unfair to the prose: make it sound good, but remove the proof.

Wingbeat caught the missing receipt before the draft could call itself published.
```

### community-feedback

Audience intent: Contribute useful criticism or shape product direction.
Evidence required: decisionPoint, optionsOrConstraint, specificAsk
Evidence gate: Requires one decision that feedback can change; ask a specific builder question, not Thoughts?
Use when: Feedback can change the product.
Avoid when: The ask is vague engagement bait.
Emotional posture: Open, specific, builder-to-builder.
Hook families: Question for builders: | Would you trust... | Which failure is worse? | I need a sharper constraint.
Beat sheet: context -> decision -> options or question -> how feedback is used
Length bands: short 80-140; standard 160-280; Premium 400-800
Line-break rhythm: Question line first or second; one ask only.
CTA patterns: reply with choice and reason
Link/visual/video placement: Screenshot if asking about UI/copy/proof.
Hashtag posture: None.
Forbidden language: Thoughts? alone | engagement bait | multiple asks
Auto-reject: no decision point | feedback cannot affect outcome
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
Question for builders:

Before an agent posts from your repo, would you rather review the final copy first or the evidence behind it?
```

standard:
```text
I am designing Wingbeat's pre-publish preview.

Which should be the first thing you see?

1. final X copy
2. why this story was chosen
3. source evidence for each claim
```

premiumLong:
```text
Question for developers building in public:

If an agent drafts a post from your repo, what would make you trust an auto-publish window?

My current answer is final copy, evidence, avoided claims, edit/block/delay controls, and a receipt after publish.

What would still make you nervous?
```

videoCaption:
```text
Feedback ask: this is the pre-publish preview. Which proof should be surfaced first?
```

altShort:
```text
Would you trust a repo-to-X agent more if it showed the blocked claims, not just the final post?
```

altStandard:
```text
I need a sharper trust boundary for Wingbeat.

Is the useful preview the polished post, the evidence map, or the list of claims the critic refused to make?
```

### changelog-update

Audience intent: Quickly understand what changed and whether it affects them.
Evidence required: changedSurface, userImpact, sourceOrLink
Evidence gate: Use for grouped small updates only when every bullet has user/operator impact.
Use when: One or more small updates are real and useful.
Avoid when: The update is not relevant outside maintainers.
Emotional posture: Concise, utilitarian.
Hook families: New: | Updated: | This week in Wingbeat: | Small but important:
Beat sheet: changed item -> user impact -> link/detail
Length bands: short 70-140; standard 150-280; Premium 500-1200
Line-break rhythm: Outcome-led bullets acceptable.
CTA patterns: Read the changelog | Try the demo | none
Link/visual/video placement: Link at end; screenshot only if UI-visible.
Hashtag posture: None.
Forbidden language: commit hashes | file names | dependency chores
Auto-reject: no user impact | no source
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
Execution states are now explicit: queue, veto, ready, blocked, published.

A run cannot reach published without a recorded receipt.
```

standard:
```text
Wingbeat update:

- failed drafts keep their critic trace
- X jobs expose queue/veto/ready/blocked/published
- published requires a receipt field, not just good copy
```

premiumLong:
```text
Wingbeat changelog:

1. Failed drafts now stay attached to the run.
2. X execution states are explicit.
3. The console reads the persisted run instead of a hand-copied story.
4. Published means a receipt exists.

Less flashy than generated copy, much more important for trust.
```

videoCaption:
```text
Changelog demo: blocked, ready, and published are now visibly different states.
```

altShort:
```text
Small update with a big trust effect: ready and published are no longer allowed to mean the same thing.
```

altStandard:
```text
This week's useful change: Wingbeat stopped treating a clean draft as a successful publish.

The execution state now has to prove where the post actually is.
```

### demo-video-post

Audience intent: Watch the product do one concrete thing.
Evidence required: visibleAction, videoAsset, outcome
Evidence gate: Requires a real video/GIF/screen recording whose visible content proves the caption claim.
Use when: A real video/GIF/screen recording exists.
Avoid when: The visual does not prove the claim.
Emotional posture: Show, do not oversell.
Hook families: Demo: | Watch Wingbeat... | This is the loop: | From X to Y in...
Beat sheet: visible action -> why it matters -> CTA
Length bands: short 70-180; standard 180-260; Premium 300-700
Line-break rhythm: One clear caption line plus optional context.
CTA patterns: watch | inspect | reply with project
Link/visual/video placement: Video is primary; link after context.
Hashtag posture: None or #BuildInPublic for progress demo.
Forbidden language: quick demo without action | unmeasured speed claims
Auto-reject: no video asset | caption claims invisible behavior
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
Demo: the critic rejects a draft because the receipt field is empty.
```

standard:
```text
Demo: Wingbeat catches a draft that says published before the executor has a receipt.

The visible part: the claim fails, the run stays out of published, and the rejection is kept.
```

premiumLong:
```text
Demo of the trust boundary I care about most:

A draft can sound good. It can even be ready for handoff.

But if it claims a public post exists before the receipt exists, Wingbeat blocks the sentence and keeps the failure visible in the run.
```

videoCaption:
```text
Critic vetoes the published claim because the receipt field is empty.
```

altShort:
```text
Watch ready stop before published. The missing receipt is the whole point.
```

altStandard:
```text
Demo: a confident X draft hits the evidence gate.

The video shows the rejected sentence, the missing receipt, and the run staying in the correct state.
```

### open-source-repo-launch

Audience intent: Decide whether to inspect, star, fork, contribute, or use.
Evidence required: repoUrl, license, currentStatus, whatWorks, contributionPath
Evidence gate: Disabled unless public repo URL, license, and contribution/inspection path are present. If not, use milestone-proof or technical-decision.
Use when: Repository is public or a major open-source milestone ships.
Avoid when: Repo is private or not ready for inspection.
Emotional posture: Transparent, invitation-oriented.
Hook families: Open-sourcing... | The Wingbeat repo is public | I made the repo inspectable | If you want to see...
Beat sheet: repo state -> what it contains -> what works -> where help is useful
Length bands: short 120-180; standard 200-280; Premium 700-1500
Line-break rhythm: Lead with access; bullets for what is inside.
CTA patterns: inspect repo | open issue | suggest starter issue
Link/visual/video placement: Repo link at end; screenshot optional.
Hashtag posture: Optional #OpenSource.
Forbidden language: production-ready without evidence | stars before value
Auto-reject: no repo link/license/status | contributor traction claim without evidence
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
Open-sourcing Wingbeat as an inspectable prototype for repo-to-X marketing agents.

The trust boundary is the part I most want reviewed.
```

standard:
```text
The Wingbeat repo is public.

It includes the local agency runtime, content package shape, operator console, and X execution state machine.

Still early; best review target is the evidence and publish boundary.
```

premiumLong:
```text
Open-sourcing Wingbeat.

It is an early prototype, not a hosted service.

Worth inspecting: how project evidence becomes a content package, how drafts are evaluated, how X handoff state is represented, and why the repo refuses to call anything published without a receipt.
```

videoCaption:
```text
Repo tour: evidence package, critic history, X job state, receipt field.
```

altShort:
```text
The Wingbeat repo is public for review: local runtime, X handoff state, and the claim gates around publish.
```

altStandard:
```text
Open-source note: Wingbeat is ready for inspection, not production claims.

If you review one thing, review whether the evidence gates are strict enough before X copy leaves draft.
```

### waitlist-early-access

Audience intent: Understand whether they can try it and why early access matters.
Evidence required: accessState, eligibility, testerValue, feedbackNeeded
Evidence gate: Disabled unless there is a real access path. If missing, convert to community-feedback or product-introduction.
Use when: A real waitlist or early access path exists.
Avoid when: No collection mechanism or follow-up path exists.
Emotional posture: Inviting, specific, humble.
Hook families: Opening early access for... | Looking for X builders to try... | If your repo has stories you never post...
Beat sheet: who -> problem -> what early access includes -> ask
Length bands: short 120-180; standard 200-280; Premium 500-1000
Line-break rhythm: Audience/problem lead; CTA last.
CTA patterns: reply | DM | form link
Link/visual/video placement: Waitlist link at end; demo visual helps.
Hashtag posture: None.
Forbidden language: fake scarcity | fake batch size | join thousands
Auto-reject: no access path | no tester profile
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
Looking for a few technical builders to test Wingbeat on active repos.

Best fit: you ship often, but your updates stay trapped in code and notes.
```

standard:
```text
Opening early access for Wingbeat.

I am looking for developers with active projects who want X posts grounded in repo evidence, not invented launch copy.

Reply with the kind of project you would test it on.
```

premiumLong:
```text
I am looking for early Wingbeat testers.

Best fit: developer-facing product, meaningful work in repo/docs, desire to post more consistently on X, and low tolerance for fake proof.

The first loop is narrow: inspect project evidence, draft a build-in-public post, and stop before publishing until the handoff is approved.
```

videoCaption:
```text
Early access preview: repo evidence becomes a checked X draft before any publish step.
```

altShort:
```text
If your repo has stories you never post, I want you in the first Wingbeat test group.
```

altStandard:
```text
Early access ask: bring an active repo and a healthy distrust of AI marketing copy.

I want to test whether Wingbeat can find useful public stories without inventing proof.
```

### comparison-contrarian

Audience intent: Hear a useful distinction or disagreement.
Evidence required: comparedAlternatives, specificClaim, wingbeatStance, caveat
Evidence gate: Use sparingly; contrast must clarify Wingbeat without unsupported competitor claims.
Use when: A contrast clarifies product philosophy.
Avoid when: It punches at competitors without evidence.
Emotional posture: Opinionated but fair.
Hook families: I do not want Wingbeat to be... | Contrarian take: | The wrong abstraction is... | Most tools start at X. Wingbeat starts at Y.
Beat sheet: common belief/tool -> disagreement -> why -> Wingbeat alternative -> caveat
Length bands: short 100-160; standard 180-280; Premium 600-1600
Line-break rhythm: Bold first line, then nuance.
CTA patterns: Agree/disagree? only when debate is useful
Link/visual/video placement: Optional diagram; avoid competitor logos.
Hashtag posture: None.
Forbidden language: strawmen | rage bait | unsupported competitor claims
Auto-reject: no nuance | no evidence | generic contrarian phrasing
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
I do not want Wingbeat to be a tweet generator.

The tweet is the last artifact. The evidence decision comes first.
```

standard:
```text
Contrarian take for AI marketing tools:

writing more posts is the easy part.

The hard part is deciding what should be said, what must not be said, and what proof has to exist before publish.
```

premiumLong:
```text
I am trying not to build Wingbeat as a scheduler with an LLM bolted on.

That starts too late.

By the time a post is scheduled, the important questions are upstream: what happened, why it matters, who should care, what evidence exists, and which claim is tempting but unsafe.
```

videoCaption:
```text
Post generator vs evidence gate: the same draft fails for different reasons.
```

altShort:
```text
Most social tools start with a blank composer.

Wingbeat starts with the project evidence.
```

altStandard:
```text
The wrong abstraction is "write me a tweet."

The better one is "what changed, who should care, and what are we allowed to claim?"
```

### thread-opener

Audience intent: Decide whether a longer explanation is worth reading.
Evidence required: multiStepStory, threadMap, followUpSubstance
Evidence gate: Use only when the story needs at least four useful replies; opener must stand alone and promise concrete substance.
Use when: Explaining architecture, launch story, postmortem, or framework.
Avoid when: The idea fits in one post.
Emotional posture: Promise value, then deliver.
Hook families: I built X. Here's the exact loop: | The architecture behind... | What I learned building... | From repo to X post:
Beat sheet: hook -> promise -> thread map -> first useful detail
Length bands: short 180-280; standard 180-280; Premium 180-280
Line-break rhythm: Opener should stand alone; follow-ups carry one idea each.
CTA patterns: final reply asks for feedback or points to artifact
Link/visual/video placement: Visual in opener if it earns attention; links in final reply.
Hashtag posture: None.
Forbidden language: A thread as only promise | vague hooks | bait and switch
Auto-reject: no thread map | not enough substance for 4+ replies
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
I built Wingbeat's first X loop around one rule: no evidence, no post.

Here is the architecture behind that boundary:
```

standard:
```text
Wingbeat is not a prompt that writes tweets.

It is a loop: project evidence -> claim check -> X draft -> handoff gate -> receipt.

Here is what each step is allowed to change:
```

premiumLong:
```text
I am building Wingbeat for developers who ship more than they market.

The first loop is narrow: turn real project work into a source-checked X post, then stop before publishing until the handoff and receipt rules are satisfied.

Thread:
```

videoCaption:
```text
Thread with demo: why ready, handoff, and final receipt are separate states.
```

altShort:
```text
From repo change to X post, the dangerous part is the claim boundary.

Thread on the Wingbeat loop:
```

altStandard:
```text
A useful marketing agent needs more than a good first draft.

It needs evidence, blocked claims, channel adaptation, and a receipt gate.

Here is how Wingbeat splits those jobs:
```

### follow-up-replies

Audience intent: Answer objections, add context, continue discussion, or convert interest.
Evidence required: replyTarget, supportedAnswer, safeCTA
Evidence gate: Use only when replying to a specific parent; answer first, then add evidence or next step.
Use when: Responding under own post or in thread follow-ups.
Avoid when: Reply would overclaim, argue defensively, or expose private detail.
Emotional posture: Concise, generous, specific.
Hook families: Direct answer | The key distinction... | Concrete example: | The current limitation...
Beat sheet: answer -> evidence/detail -> next step
Length bands: short 40-180; standard 40-180; Premium 120-280
Line-break rhythm: One or two small paragraphs.
CTA patterns: answer first, link/repo/DM only if relevant
Link/visual/video placement: Only when it resolves the reply.
Hashtag posture: Never.
Forbidden language: canned replies | salesy DMs | dunking | unsupported roadmap promises
Auto-reject: does not answer parent | repeats original post
Scoring rubric: pass only when evidence fit, category fit, X nativeness, specificity, rhythm, CTA/media fit, and safety all meet the global threshold; this category especially checks its evidence gate.
Examples:
short:
```text
The key distinction: ready for handoff is not the same as published.
```

standard:
```text
Current limitation: the local prototype can prepare the X handoff, but a run is only published after a verified public URL is recorded.

That constraint is intentional.
```

premiumLong:
```text
Concrete example: if the repo shows a safe browser handoff was added, Wingbeat can say that.

It cannot say the post went live unless the execution job has a verified X receipt attached.
```

videoCaption:
```text
Reply with a clipped moment only when the clip shows the state or claim being discussed.
```

altShort:
```text
Yep. I am treating the receipt as product state, not a nice-to-have log line.
```

altStandard:
```text
That is exactly the boundary I am testing: the agent can draft and prepare, but the product cannot call it published until the external receipt exists.
```

## Generator Prompt Contract

```text
You are Wingbeat's X channel adapter. Write native X prose from source-backed content packages. Preserve evidence boundaries. Never invent metrics, users, launch state, publication state, or social proof.

Category: {{category}}
Audience: {{audience}}
What changed: {{whatChanged}}
Why it matters: {{whyItMatters}}
Supported claims: {{supportedClaims}}
Prohibited claims: {{prohibitedClaims}}
Evidence: {{evidence}}
Asset context: {{assetBrief}}
Desired action: {{desiredAction}}
Product status: {{currentProductStatus}}

Return variants for the category: short, standard, premiumLong, and videoCaption when relevant. Include rejection reasons for variants that lack evidence.
```

## Visual Pipeline Consumption

The visual-first pipeline should consume `src/data/x-prose-playbook.json`, select a kebab-case `categories[].id`, enforce `inputContract.required`, generate variants with the category evidence gate, and run deterministic checks before model-eval. Visual/video pipelines must check `requiresVisibleAsset` and caption only what is visible.
