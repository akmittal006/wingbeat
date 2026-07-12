---
name: agency
description: Run Wingbeat from Hermes against the current software project.
---

# Wingbeat Agency

Use this skill when the user wants Wingbeat to create a source-backed build-in-public story, content package, or draft X post from a local software project.

## Rules

- Treat the current working directory as the target project unless the user gives another path.
- Do not publish anything. Wingbeat only prepares draft content and Convex records.
- Require `CONVEX_URL` before running. Do not use local JSON persistence or `.wingbeat` output.
- Prefer the deterministic local fallback unless the user explicitly asks for provider-backed generation.
- Before provider-backed generation, warn that repository-derived context may be sent to the model provider configured in Hermes.
- Keep claims tied to README, docs, package metadata, git history, or local file evidence.
- If the command fails, report the exact failure and do not present a generated draft as successful.

## Commands

Deterministic local fallback:

```bash
hermes wingbeat run --project . --no-hermes
```

Provider-backed generation:

```bash
hermes wingbeat run --project .
```

The run is persisted to Convex only. If `CONVEX_URL` is missing or Convex is unavailable, report the retryable failure instead of inventing a local result.
