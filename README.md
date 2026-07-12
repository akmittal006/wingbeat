# Wingbeat

Wingbeat is an experimental AI marketing agency for developers who would rather keep building than constantly stop to write updates.

It reads a software project, gathers evidence from the repository, assembles a task-specific set of agents, drafts a reusable story, critiques it, and prepares channel-specific execution behind a human-controlled safety boundary.

> Break down every barrier preventing you from marketing consistently.

## Why Wingbeat exists

Shipping a product creates plenty of stories: decisions, trade-offs, mistakes, fixes, and lessons. Most never leave the repository because turning work into honest, useful content is another job. Wingbeat explores whether an agent team can do that work without becoming a commit-summary bot or an unsafe auto-poster.

The core idea is simple:

```text
project evidence
→ project and audience context
→ draft and critique
→ channel-independent content package
→ vetoable channel execution
→ verified public receipt
```

## Current status

Wingbeat is an early prototype, not a production service.

What works locally today:

- Repository and product-document inspection.
- A Convex-backed agency run with a visible agent trace.
- A deterministic generation path that still requires Convex persistence.
- A React operator console for runs, evidence, evaluation, and execution state.
- A Convex-backed X job state machine with queue, veto, ready, blocked, and published states.
- A browser handoff that does not read cookies or create OAuth credentials.

What is still being hardened:

- Reliable Hermes-backed generation and revision across different projects.
- End-to-end evidence that generated posts remain accurate and non-repetitive.
- Notifications, scheduling, recovery, and multi-channel support.
- Broader automated tests and contributor-facing configuration.

There is no hosted service or official release yet. A `published` run is only valid when it contains a verified public receipt; seeded or deterministic demo data is not evidence of a live post. See the [changelog](./CHANGELOG.md) for the project snapshot.

## Quickstart

Requirements:

- Node.js 20.19+ or 22.12+
- pnpm 11.7+
- A configured Convex deployment exposed as `CONVEX_URL` for scripts and `VITE_CONVEX_URL` for the dashboard

```bash
git clone <your-fork-or-repository-url>
cd wingbeat
pnpm install --frozen-lockfile
pnpm convex:dev
pnpm agency:demo
pnpm dev
```

Open the local URL printed by Vite. `agency:demo` stays local and uses deterministic generation, so it is the safest first run.

Useful commands:

```bash
# Run the local deterministic agency demo
pnpm agency:demo

# Run with an installed and configured Hermes CLI
pnpm agency:run

# Validate the X executor state machine without publishing
pnpm x:self-test

# Type-check and build the operator console
pnpm build
```

`agency:run` may send repository-derived context to the model provider configured through Hermes. Review your provider and repository privacy requirements before using it. `agency:demo` avoids Hermes, but it still writes real run state to Convex. If Convex is unavailable, Wingbeat fails visibly instead of using local JSON.

## Demo flow

1. Run `pnpm agency:demo` against Wingbeat itself.
2. Open the operator console and inspect the source evidence and selected crew.
3. Follow the first draft, critic findings, and final content package.
4. Run `pnpm x:self-test` to exercise the execution state machine in a temporary directory.
5. Read the [browser executor contract](./docs/browser-x-executor.md) before attempting a real browser handoff.

Publishing is intentionally not part of the default demo. A real post requires a ready job, a fresh action-time confirmation, an already signed-in browser session, and a public URL recorded as its receipt.

## Screenshot

<!-- Replace this note with a real screenshot after the truthfulness UI pass is complete. -->

_Operator console screenshot coming soon. We do not use a mockup here because the launch image should reflect the current product._

## Architecture

Wingbeat has four small boundaries:

- `src/agency/` gathers context, calls Hermes or deterministic generation, coordinates the agency run, and persists it.
- `src/lib/` contains shared evaluation, trace, status, memory, and receipt helpers.
- `convex/` stores projects, runs, ordered events, content packages, execution jobs, verified receipts, and memory records.
- `src/components/` renders the operator console from reactive Convex queries.
- `scripts/x-execution/` owns the Convex-backed execution state machine and safe browser handoff.

Convex is the contract between generation, execution, and the UI. Execution state and a verified receipt must flow through validated Convex mutations before the console presents a post as published.

For design details and trust boundaries, read [docs/architecture.md](./docs/architecture.md). The longer-term direction lives in the [product concept](./docs/product-concept.md).

## Safety principles

- Claims should be tied to repository evidence.
- Content is prepared independently from the channel that may publish it.
- The browser executor never reads cookies, browser storage, passwords, or auth headers.
- A veto window does not replace action-time confirmation for the current prototype.
- No job is treated as published until a public URL is verified and recorded.
- Secrets, private repository content, and provider-bound context should never be committed.

Please report security problems using [SECURITY.md](./SECURITY.md), not a public issue.

## Roadmap

The near-term goal is one trustworthy self-hosted loop:

- Make generation and critic-driven revision genuinely project-specific.
- Keep all UI claims derived from persisted run and executor state.
- Show a verified receipt in the console.
- Add real notification and recovery paths.
- Document configuration for running Wingbeat on another repository.
- Expand from X to other channels only after the first loop is reliable.

The [two-hour MVP roadmap](./docs/two-hour-mvp-roadmap.md) is retained as the buildathon plan, not a claim that every milestone shipped.

## Contributing

Wingbeat is small enough for early contributors to shape its foundations. Good places to help include:

- Fixtures and tests for project-specific generation and revision.
- Evidence and provenance checks.
- Safe executor tests and failure recovery.
- Accessibility and truthful empty states in the console.
- Documentation for running against different repository shapes.

Start with [CONTRIBUTING.md](./CONTRIBUTING.md) and issues labeled `good first issue`. The [good-first-issue guide](./.github/GOOD_FIRST_ISSUES.md) lists starter issue ideas maintainers can open without inventing completed features.

By participating, you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

Licensed under the [Apache License 2.0](./LICENSE).
