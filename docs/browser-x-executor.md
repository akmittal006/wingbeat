# Browser X Executor

This is Wingbeat's safe non-OAuth execution boundary for the first X loop.

The boundary deliberately does not create OAuth tokens, read browser profiles, or expose cookies. It prepares a post payload and optional local asset, waits through the veto window, exports a browser task only after action-time confirmation, and records a receipt after the live post is verified.

## State Model

Jobs live as JSON files under `scripts/x-execution/jobs/` by default. Set `WB_X_EXECUTION_DIR=/path/to/state` to use another state directory for tests or local rehearsals.

The executor job is the execution source of truth. State-changing commands mirror the job into a Wingbeat run JSON when the run id matches. By default the mirror target is `public/data/latest-run.json`; pass `--run-json /absolute/path/to/run.json` to bind a job to a specific run file. If the default file is missing or has a different `id`, sync is skipped. If an explicit `--run-json` path is missing or has a different `id`, the command fails.

The only job states are:

- `queue`: payload and optional asset were prepared.
- `veto`: user still has time to block the post.
- `ready`: veto elapsed without a block; publishing is allowed only after explicit action-time confirmation.
- `published`: a public X URL receipt was recorded.
- `blocked`: user or operator blocked the job.

## CLI

Prepare a job and open the veto window:

```bash
node scripts/x-execution/x-executor.mjs prepare \
  --run-id demo-run-001 \
  --copy "Today I built the safety boundary before letting the agent touch X." \
  --asset /absolute/path/to/asset.png \
  --asset-alt "Wingbeat execution trace preview" \
  --veto-seconds 60 \
  --run-json public/data/latest-run.json
```

Inspect or list jobs:

```bash
node scripts/x-execution/x-executor.mjs show --job-id demo-run-001-abc123
node scripts/x-execution/x-executor.mjs list
```

Block during the veto window:

```bash
node scripts/x-execution/x-executor.mjs block \
  --job-id demo-run-001-abc123 \
  --reason "Tone is too broad; needs a concrete source."
```

Advance after the veto window expires:

```bash
node scripts/x-execution/x-executor.mjs advance --job-id demo-run-001-abc123
```

Export a browser task. This command refuses to run unless the job is `ready` and the operator confirms the exact job at action time:

```bash
node scripts/x-execution/x-executor.mjs export-browser-task \
  --job-id demo-run-001-abc123 \
  --confirm-action-time "PUBLISH demo-run-001-abc123"
```

Record the verified receipt:

```bash
node scripts/x-execution/x-executor.mjs update-receipt \
  --job-id demo-run-001-abc123 \
  --post-url "https://x.com/your_account/status/1234567890" \
  --verified-by codex
```

`update-receipt` atomically writes the verified public URL, post id, timestamp, and `published` status into both the executor job and the synced Wingbeat run JSON.

## Browser Automation Contract

Use Codex Chrome or Computer Use against an already signed-in browser session.

Allowed:

- Open `https://x.com/compose/post`.
- Paste the exported `copy` exactly.
- Attach the exported local asset path if present.
- Click Post only after the `export-browser-task` command has accepted the exact `PUBLISH <job-id>` confirmation.
- Copy only the public post URL after publish.

Forbidden:

- Reading, printing, copying, storing, or summarizing cookies.
- Reading `localStorage`, `sessionStorage`, auth headers, browser profile files, or password manager data.
- Creating OAuth tokens or asking the user for credentials.
- Publishing from a job in `queue`, `veto`, `blocked`, or `published`.
- Publishing from a `ready` job without fresh action-time confirmation.

## Recovery Notes

If X is unavailable or the browser session is signed out, leave the job in `ready` and report the blocker. Do not downgrade to OAuth or credentials as a workaround.

If the post succeeds but receipt recording fails, re-run `update-receipt` with the same public URL. The job becomes `published` only when the receipt is written.
