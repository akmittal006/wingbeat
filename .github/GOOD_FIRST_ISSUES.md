# Good first issue guide

This file is a maintainer guide for opening honest, well-scoped starter issues. It is not a claim that these issues are already filed or assigned.

## What makes a good first issue

A good first issue should:

- Change one clear behavior or document one clear boundary.
- Name the likely files and a reproducible starting command.
- Include acceptance criteria and validation steps.
- Avoid requiring live social accounts, credentials, or private repositories.
- Use synthetic fixtures.
- Explain any provenance or safety constraint.

Suggested labels: `good first issue`, one area label such as `docs` or `executor`, and `help wanted` only when a maintainer is available to review.

## Starter issue candidates

### Document a second repository shape

Add a synthetic fixture and guide for running context collection against a small monorepo. Acceptance criteria: generated context identifies the relevant package, ignores generated directories, and does not read secrets.

Likely areas: `src/agency/context.mjs`, test fixtures, and documentation.

### Validate local Markdown links

Add a small dependency-free check that scans tracked Markdown files for broken relative links while ignoring code fences and external URLs. Wire it to a documented package command.

Likely areas: `scripts/`, `package.json`, and `CONTRIBUTING.md`.

### Improve missing-receipt empty state

Make the operator console clearly distinguish a ready job from a published job when no receipt exists. Acceptance criteria: no live URL or success language appears without a verified receipt, with an accessible text label for each state.

Likely areas: `src/components/`, `src/types.ts`, and a synthetic run fixture.

### Cover one executor failure transition

Add a self-test case for an invalid state transition, such as attempting to record a receipt before a job is ready. Acceptance criteria: the command fails, the job file is unchanged, and no run is mirrored as published.

Likely areas: `scripts/x-execution/x-executor.mjs`.

### Explain provenance labels

Document how the console should label measured, estimated, fallback, fixture, and verified values. Include a compact glossary and examples that do not imply production results.

Likely areas: `docs/` and `README.md`.

## Issue template

When opening one of these issues, include:

```markdown
## Context
Why this matters and the current behavior.

## Scope
The smallest acceptable change and likely files.

## Acceptance criteria
- [ ] Observable outcome
- [ ] Safety or provenance condition
- [ ] Documentation expectation

## Validation
Exact commands or manual checks.

## Help
Pointers to architecture or a maintainer who can answer questions.
```
