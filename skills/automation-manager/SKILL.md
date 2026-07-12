---
name: automation-manager
description: MUST use whenever a user asks to create, schedule, install, manage, or discuss a Wingbeat automation, including messages containing "wingbeat automate". Ensures the Hermes cron is registered in Wingbeat Convex and visible in the dashboard.
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

When the request arrives through WhatsApp or another Hermes chat, use the terminal tool to run that command exactly. Do **not** call Hermes's native `cron create` tool directly for a Wingbeat automation, because native cron creation alone does not register the workflow in Wingbeat or show it in the dashboard.

If a native Hermes cron was already created, immediately reconcile it with:

```bash
hermes wingbeat sync-automation --cron-id CRON_ID --name "NAME" --request "ORIGINAL REQUEST"
```

An automation is not successfully installed until both the Hermes cron exists and the Convex registration command succeeds.
