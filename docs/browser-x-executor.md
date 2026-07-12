# Browser X Executor

This is Wingbeat's safe non-OAuth execution boundary for the first X loop.

The boundary deliberately does not create OAuth tokens, read browser profiles, or expose cookies. It reads a Convex execution job, waits through the veto window, exports a browser task only after action-time confirmation, and records a receipt after the live post is verified.

## State Model

Jobs live in Convex. Set `CONVEX_URL` or `VITE_CONVEX_URL` before using the executor.

The Convex execution job is the execution source of truth. State-changing commands call server-side mutations that validate run/job matches and allowed transitions. There is no local state file and no run JSON mirror.

The only job states are:

- `queue`: runtime created the execution job from a content package.
- `veto`: user still has time to block the post.
- `ready`: veto elapsed without a block; publishing is allowed only after explicit action-time confirmation.
- `published`: a verified public X URL receipt was recorded.
- `blocked`: user or operator blocked the job.

## CLI

Open the veto window for a runtime-created queued job:

```bash
node scripts/x-execution/x-executor.mjs prepare \
  --run-id demo-run-001 \
  --veto-seconds 60
```

Inspect or list jobs:

```bash
node scripts/x-execution/x-executor.mjs show --job-id xjob-demo
node scripts/x-execution/x-executor.mjs list
```

Block during the veto window:

```bash
node scripts/x-execution/x-executor.mjs block \
  --job-id xjob-demo \
  --reason "Tone is too broad; needs a concrete source."
```

Advance after the veto window expires:

```bash
node scripts/x-execution/x-executor.mjs advance --job-id xjob-demo
```

Export a browser task. This command refuses to run unless the job is `ready` and the operator confirms the exact job at action time:

```bash
node scripts/x-execution/x-executor.mjs export-browser-task \
  --job-id xjob-demo \
  --confirm-action-time "PUBLISH xjob-demo"
```

Record the verified receipt:

```bash
node scripts/x-execution/x-executor.mjs update-receipt \
  --job-id xjob-demo \
  --post-url "https://x.com/your_account/status/1234567890" \
  --verified-by codex
```

`update-receipt` atomically writes the verified public URL, post id, timestamp, receipt row, and `published` status into Convex. Re-running it with the same URL is idempotent.

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

If the post succeeds but receipt recording fails, re-run `update-receipt` with the same public URL. The job becomes `published` only when the Convex receipt is written.
