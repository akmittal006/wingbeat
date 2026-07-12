# Wingbeat

Wingbeat is a dynamic AI marketing agency for Hermes. It inspects a software project, assembles a task-specific specialist crew, creates a source-backed channel-independent content package, rejects weak drafts, and hands approved work to a vetoable browser execution boundary.

> Break down every barrier preventing you from marketing consistently.

## Demo

```bash
pnpm install
pnpm agency:demo
pnpm dev
```

Open the local URL printed by Vite. The operator console loads the latest real agency run from `public/data/latest-run.json`.

## Demo path

1. Run Wingbeat against its own repository.
2. Watch the manager assemble a conditional crew.
3. Inspect the source package, agent trace, cost, latency, and critic revision.
4. Prepare the X job and let its veto window expire.
5. Publish through an existing signed-in browser session.
6. Record the public post URL as the execution receipt.

## Commands

```bash
# Run with installed Hermes when external model use is authorized
pnpm agency:run

# Deterministic, fully local demo run
pnpm agency:demo

# Validate the non-OAuth browser executor state machine
pnpm x:self-test

# Production frontend build
pnpm build
```

## Architecture

- `src/agency/`: project context, Hermes adapter, dynamic manager runtime, persistence.
- `src/lib/`: status, trace, evaluation, memory, and receipt helpers.
- `src/components/`: shadcn-inspired operations, catalog, agency, and observability console.
- `scripts/x-execution/`: file-backed queue, veto, browser handoff, and receipt boundary.
- `docs/`: product concept, buildathon rubric strategy, roadmap, and external advisor updates.

## Browser execution safety

Wingbeat does not extract cookies or credentials. Browser execution uses an existing user-authorized session and requires explicit action-time confirmation before the final post action.
