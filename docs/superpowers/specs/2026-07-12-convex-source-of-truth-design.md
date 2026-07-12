# Convex Source-of-Truth Design

## Objective

Make Convex the only persistent source of truth for Wingbeat's project state, agency runs, events, content packages, execution jobs, receipts, and memory. This integration must perform visible product work and qualify as a genuine Convex PowerUp.

## Scope

Create these Convex entities:

- `projects`: identity, repository, objective, and policy references.
- `runs`: trigger, lifecycle status, timestamps, generation metadata, and selected agents.
- `events`: ordered trace events with agent, input/output summaries, evaluation, latency, token, and cost metadata.
- `contentPackages`: channel-independent narrative, claims, evidence, assets, adaptations, and quality evaluations.
- `executionJobs`: channel payload and the `queue -> veto -> ready -> published | blocked` state machine.
- `receipts`: verified public URL, external post ID, verification timestamp, and verifier.
- `memoryRecords`: current-job, project-history, and brand-policy records referenced by agents and runs.

## Architecture

- The agency runtime creates and updates runs through Convex mutations.
- Every agent handoff and evaluation appends an ordered Convex event.
- The X executor reads and transitions its Convex execution job; it does not own a local state file.
- Publishing and receipt creation occur in one idempotent mutation so a run cannot appear published without a receipt.
- The dashboard uses reactive Convex queries for current run, trace, evaluation, job state, and receipt.
- Convex is the only runtime persistence path. No JSON reads, writes, mirroring, migration, fallback, or backward-compatibility code will remain.

## Failure Semantics

- If Convex is unavailable, the operation fails visibly and remains retryable.
- Invalid state transitions are rejected server-side.
- Run/job mismatches and duplicate receipts are rejected or handled idempotently.
- No UI state may imply publication without a verified receipt.

## Validation

- Schema and generated Convex types compile.
- Focused tests cover lifecycle transitions, ordered events, memory references, run/job matching, and receipt idempotency.
- Production frontend build passes.
- Live demo proves: create run, observe reactive trace, transition veto state, and render a verified receipt from Convex.
- Convex dashboard visibly contains the same run, events, job, and receipt shown in Wingbeat.

## Worktree Ownership

The implementation task works in a dedicated worktree and may modify Convex schema/functions plus the minimum runtime, executor, dashboard, types, dependencies, and documentation required for the direct cutover. It must preserve unrelated product work and report its branch, commit, validation commands, deployment state, and blockers.
