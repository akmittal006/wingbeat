# Wingbeat X Prose Research Appendix

Version: 2026-07-12-grok-reviewed

## Method

Direct observation: inspected visible public X search/timeline examples in the user's signed-in Chrome session. I did not inspect cookies, storage, auth headers, passwords, browser history, or browser profile data.

Direct external review: submitted a bounded prompt to Grok at https://x.com/i/grok?conversation=2076215460920705132. The prompt included only the Wingbeat product/prose brief, category definitions, selected representative examples, and evaluation rules.

Inference: I treated visible X patterns and Grok critique as advisory input, then accepted only changes consistent with Wingbeat's local product status and evidence rules.

## Visible X Examples Inspected

- Direct observation: [Vercel Dockerfile announcement](https://x.com/vercel/status/2071951027302224262) — Direct capability lead plus concrete code-shaped proof.
- Direct observation: [Linear coding sessions](https://x.com/linear/status/2065143118417088981) — Introduces a named feature with concrete agent actions.
- Direct observation: [Guillermo Rauch Eve intro](https://x.com/rauchg/status/2067183015214584307) — Founder intro uses analogy, product name, and simple first mental model.
- Direct observation: [Vercel Lovable update](https://x.com/rauchg/status/2075614779658690849) — Progress/update starts with what users can now do.
- Direct observation: [eve positioning](https://x.com/evedev_/status/2072806286857568574) — Short analogy plus concrete folder structure.
- Direct observation: [shadcn principle](https://x.com/shadcn/status/2074910600451223751) — Concrete repeated-work principle.
- Direct observation: [Linear changelog](https://x.com/linear/status/2072708036620161239) — New/change surface plus practical user action.
- Direct observation: [Anchored early access](https://x.com/Anchored_Notes/status/2075730802977988735) — Early-access framing: after building, access state, shape-product CTA.
- Direct observation: [Brydon Parker product search intro](https://x.com/parker_brydon/status/2071624746500850126) — Question hook followed by product inventory and how-it-works.

## Grok Feedback Themes

- Accepted: Normalize machine category ids to kebab-case.
- Accepted: Keep 17 semantic categories but add stricter evidence gates for launch, open-source, waitlist, and video categories.
- Accepted: Stop reintroducing Wingbeat in progress categories.
- Accepted: Vary repeated nouns around source-backed, safety boundary, handoff, and receipt.
- Accepted: Make examples more concrete and less template-like.
- Accepted: Make video captions describe visible behavior only.
- Accepted: Add duplicate/template-similarity validation.
- Rejected: Do not remove product-launch, open-source-repo-launch, or waitlist-early-access; keep them as gated categories because the visual pipeline needs the full taxonomy.
- Rejected: Do not merge insight-lesson and failure-learning; keep both but clarify routing and gates.

## Key Inferences Applied

- Inference: the 17-category taxonomy should remain because downstream pipelines need stable semantic routing, but launch/access categories must be evidence-gated when the product is still local or private.
- Inference: indie-builder audiences will tolerate architecture only when the user-visible consequence is clear, such as a missing receipt blocking a publish claim.
- Inference: progress posts should assume warm-context after the initial product introduction and avoid reusing the same "source-backed / safety boundary / X handoff / verified receipt" noun stack.

## Prompt Scope Sent To Grok

Authorized scope only: Wingbeat product/prose brief, category definitions, selected representative examples, evaluation rules, and request for adversarial X-native critique.

Excluded: secrets, private files, unrelated project content, browsing history, cookies, storage, auth data, profile files, and credentials.
