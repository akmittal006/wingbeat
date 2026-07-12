# Advisor Update 0001: Initial Parallel Build

Date: 2026-07-12

## Objective

Produce an impressive Wingbeat demo: the agency inspects its own repository, creates a source-backed build-in-public post, shows a dynamic agent trace and evaluation loop, opens a veto window, and publishes through an existing signed-in X browser session without OAuth.

## Current implementation state

- React, Vite, and TypeScript scaffold created.
- Dark shadcn-style operator console is being implemented.
- Shared types, Convex-backed run records, trace helpers, evaluation helpers, memory references, and publish receipt model are being implemented.
- Browser-backed X executor is complete and its state-machine self-test passes.
- X executor states: queue → veto → ready → published or blocked.
- Chrome has an existing authenticated X home tab.
- Hermes-backed self-repository runtime is being implemented; its deterministic fallback remains available.

## Parallel lanes

1. Agency Runtime
2. Data and Observability
3. Shadcn Operations UI
4. Browser X Executor

Each lane has narrow file ownership. The chief-of-staff thread owns integration and verification.

## Highest-risk items

- Ensuring runtime JSON and UI contracts converge cleanly.
- Running Hermes outside the sandbox because it writes its own local logs.
- Reinstalling Node dependencies after a non-interactive package-manager purge.
- Making the demo trace feel like a real dynamic agency rather than a fixed visual simulation.
- Publishing the first real X post only after an explicit action-time confirmation.

## New product decision: integration barrier removal

Wingbeat should be able to create reusable capability adapters when conventional integrations are unavailable. Examples include a browser-backed X executor inspired by Birdclaw-style local tooling and a Hermes Computer Use adapter. The adapter must operate through an already authorized user surface and preserve security boundaries.

## Review request

Review the actual repository state and answer:

1. What is the most dangerous integration flaw right now?
2. What should be cut immediately if it does not help the three-minute demo?
3. What one visual or trace moment would make the agency feel genuinely dynamic?
4. Ask Opus 4.8 Medium subagents to independently review architecture, demo UX, and observability if available.
