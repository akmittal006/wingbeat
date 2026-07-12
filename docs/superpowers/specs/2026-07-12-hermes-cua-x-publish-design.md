# Hermes-triggered CUA X publishing

## Goal

For the live demo, let the user give Hermes finalized tweet text and explicitly command Wingbeat to publish it to X through the signed-in browser session.

## Flow

1. `hermes wingbeat post-x --text "..."` receives immutable finalized text.
2. Wingbeat creates a Convex X execution job marked ready with explicit user-approval metadata.
3. The command launches the CUA publishing adapter with the exact text.
4. The adapter opens X, enters the text, submits it, and returns the resulting public `/status/...` URL.
5. Wingbeat validates and stores the URL as a verified receipt. Only then does the job become `published`.
6. Missing login, UI mismatch, submission failure, or missing/invalid receipt blocks the job and exits non-zero.

## Demo constraints

- No veto countdown after the explicit `post-x` command.
- No rewriting or editing the finalized text inside the publisher.
- No `published` state without a verified X receipt.
- Convex remains the only persistent state.
- Register an enabled manual automation named `Post to X` so it appears in the Ops Center.

## Validation

- Command/help registration test.
- Dry-run adapter test that proves exact text handoff without posting.
- Invalid receipt and CUA failure tests must leave the job blocked.
- Live rehearsal publishes one intentional test post and shows its receipt in Convex/Ops Center.
