---
name: automation-manager
description: Design, install, and execute general-purpose Wingbeat marketing automations from natural-language goals.
---

# Wingbeat Automation Manager

Translate the user's automation goal into a sequence of registered Wingbeat capabilities. Never invent a capability.

## Capability registry

- `opportunities.fetchTop`: run `hermes wingbeat top-opportunity` and use the returned live Convex opportunity.
- `content.curateForX`: turn source evidence into one final post of at most 280 characters using Wingbeat's X guidelines. Never add unsupported metrics or publication claims.
- `x.publish`: publish only the finalized text through `hermes wingbeat post-x --text "..."`.
- `receipts.verify`: success requires a verified public `x.com/<account>/status/<id>` receipt in Convex.

## Rules

- Execute steps in workflow order and pass only declared outputs forward.
- Skip cleanly when no opportunity exists.
- Never publish the same opportunity twice.
- Never report `published` without a verified receipt.
- On failure, report the failed step and leave an inspectable blocked/failed state.
- Do not edit or delete a published post as recovery. Escalate instead.

## Creating automations

Use `hermes wingbeat automate "<goal>"`. The command validates capabilities, installs a real Hermes cron, persists its workflow in Convex, and makes it visible in the Wingbeat dashboard.
