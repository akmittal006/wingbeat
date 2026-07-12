# Wingbeat X Prose Evaluation

Version: 2026-07-12-grok-reviewed
Canonical category ids: kebab-case
Machine contract: `src/data/x-prose-playbook.json`

## Pass Contract

A candidate passes only when deterministic checks pass, model-eval score is at least 0.82, `evidenceFit == 1`, and `safetyBrand == 1`. Evidence and safety failures are never averaged away.

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

## Deterministic Checks

- `known-category`
- `standard-length`
- `short-length`
- `premium-length`
- `hashtag-count`
- `forbidden-phrase`
- `unsupported-publish-claim`
- `unsupported-launch-claim`
- `unsupported-metric`
- `generic-saas`
- `unexplained-product`
- `raw-commit-summary`
- `cta-before-value`
- `link-position`
- `video-without-asset`

Additional deterministic gates added after Grok review:

- `kebab-case-ids`: every category id must match `^[a-z0-9]+(-[a-z0-9]+)*$`.
- `category-count`: exactly 17 categories.
- `docs-json-parity`: every JSON id appears in both prose docs.
- `six-examples`: every category has at least six examples.
- `availability-gate`: `product-launch`, `open-source-repo-launch`, and `waitlist-early-access` require explicit availability/access evidence.
- `visible-video-gate`: `demo-video-post` requires a visible video/GIF/screen recording.
- `template-similarity`: examples must not reuse the same hook, noun stack, or state-machine phrasing across categories.
- `progress-no-reintro`: progress categories should not re-explain the whole Wingbeat product.

## Model-Eval Dimensions

- `evidenceFit` (0.25)
- `categoryFit` (0.15)
- `specificity` (0.15)
- `xNativeness` (0.15)
- `hookRhythm` (0.1)
- `ctaMediaFit` (0.1)
- `safetyBrand` (0.1)

## Category-Specific Rubrics

### daily-build-log

Evidence gate: Use for real progress only; do not re-explain Wingbeat unless the target audience is cold and this is the first post in a sequence.
Must include: sourceEvent, productImplication, nextStepOrOpenQuestion.
Reject when: no source event | no user-visible meaning | published claim without receipt.
Model question: Does this post satisfy `daily-build-log` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### product-introduction

Evidence gate: Use only when the audience needs the core product explained; this is the home for the direct Building/Introducing voice.
Must include: productDefinition, targetAudience, firstShippedLoop, currentStatus.
Reject when: no audience | no concrete first loop | hosted service implied without evidence.
Model question: Does this post satisfy `product-introduction` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### product-launch

Evidence gate: Disabled unless public access evidence exists. If access is only local/private, use product-introduction, demo-video-post, or milestone-proof instead.
Must include: publicAvailability, link, supportedCapability, limitations.
Reject when: no public URL | no access path | no limitation.
Model question: Does this post satisfy `product-launch` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### feature-intro-launch

Evidence gate: Use when a concrete capability changed for the operator or reader; translate internal states into visible outcomes.
Must include: featureName, userVisibleBehavior, beforeAfter, availability.
Reject when: feature not visible | no before/after.
Model question: Does this post satisfy `feature-intro-launch` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### insight-lesson

Evidence gate: Requires a transferable rule that came from a concrete Wingbeat event; do not use for failure stories unless the lesson is broader than the failure.
Must include: incidentOrDecision, lesson, broaderImplication.
Reject when: no story | no product consequence.
Model question: Does this post satisfy `insight-lesson` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### milestone-proof

Evidence gate: Requires a concrete artifact outside the claim itself; avoid subjective proof language like first real proof point.
Must include: milestone, proofArtifact, limitation.
Reject when: no proof artifact | no limitation.
Model question: Does this post satisfy `milestone-proof` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### failure-learning

Evidence gate: Use for a specific failed run, draft, assumption, or integration; include the correction and current remaining risk.
Must include: failure, diagnosis, fixOrLearning, currentRisk.
Reject when: no actual failure | no fix or learning.
Model question: Does this post satisfy `failure-learning` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### technical-decision

Evidence gate: Use only when the engineering choice changes trust, reuse, safety, or operator understanding.
Must include: decision, alternatives, reason, userConsequence.
Reject when: no user consequence | no alternative.
Model question: Does this post satisfy `technical-decision` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### experiment-result

Evidence gate: Requires hypothesis, method, result, limitation, and next action; quantify only measured facts.
Must include: hypothesis, method, result, limitation, nextAction.
Reject when: no method/result | unsupported quantitative claim.
Model question: Does this post satisfy `experiment-result` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### community-feedback

Evidence gate: Requires one decision that feedback can change; ask a specific builder question, not Thoughts?
Must include: decisionPoint, optionsOrConstraint, specificAsk.
Reject when: no decision point | feedback cannot affect outcome.
Model question: Does this post satisfy `community-feedback` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### changelog-update

Evidence gate: Use for grouped small updates only when every bullet has user/operator impact.
Must include: changedSurface, userImpact, sourceOrLink.
Reject when: no user impact | no source.
Model question: Does this post satisfy `changelog-update` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### demo-video-post

Evidence gate: Requires a real video/GIF/screen recording whose visible content proves the caption claim.
Must include: visibleAction, videoAsset, outcome.
Reject when: no video asset | caption claims invisible behavior.
Model question: Does this post satisfy `demo-video-post` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### open-source-repo-launch

Evidence gate: Disabled unless public repo URL, license, and contribution/inspection path are present. If not, use milestone-proof or technical-decision.
Must include: repoUrl, license, currentStatus, whatWorks, contributionPath.
Reject when: no repo link/license/status | contributor traction claim without evidence.
Model question: Does this post satisfy `open-source-repo-launch` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### waitlist-early-access

Evidence gate: Disabled unless there is a real access path. If missing, convert to community-feedback or product-introduction.
Must include: accessState, eligibility, testerValue, feedbackNeeded.
Reject when: no access path | no tester profile.
Model question: Does this post satisfy `waitlist-early-access` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### comparison-contrarian

Evidence gate: Use sparingly; contrast must clarify Wingbeat without unsupported competitor claims.
Must include: comparedAlternatives, specificClaim, wingbeatStance, caveat.
Reject when: no nuance | no evidence | generic contrarian phrasing.
Model question: Does this post satisfy `comparison-contrarian` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### thread-opener

Evidence gate: Use only when the story needs at least four useful replies; opener must stand alone and promise concrete substance.
Must include: multiStepStory, threadMap, followUpSubstance.
Reject when: no thread map | not enough substance for 4+ replies.
Model question: Does this post satisfy `thread-opener` without borrowing another category's framing or reusing generic Wingbeat boilerplate?

### follow-up-replies

Evidence gate: Use only when replying to a specific parent; answer first, then add evidence or next step.
Must include: replyTarget, supportedAnswer, safeCTA.
Reject when: does not answer parent | repeats original post.
Model question: Does this post satisfy `follow-up-replies` without borrowing another category's framing or reusing generic Wingbeat boilerplate?


## Eval Prompt

```text
You are Wingbeat's X prose critic. Evaluate the candidate against the kebab-case category contract. Return strict JSON with pass, score, dimensionScores, deterministicFailures, unsupportedClaims, claimEvidenceMap, and rewriteInstructions. Fail any candidate that sounds good but outruns the evidence, repeats a template, or uses a launch/access/video category without the required artifact.
```
