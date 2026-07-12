# Contributing to Wingbeat

Thanks for helping make project-aware marketing more useful, honest, and safe.

Wingbeat is an early prototype. Small, testable improvements are more valuable than broad rewrites. Before starting a large change, open an issue so the intended behavior and trust boundary can be agreed on first.

## Before you start

- Read the [README](./README.md) for the current status and safety model.
- Read [docs/architecture.md](./docs/architecture.md) before changing a data or execution boundary.
- Search existing issues before opening a new one.
- Never include credentials, cookies, browser storage, private repository content, or real unpublished copy in a fixture.
- Do not claim that a post was published unless the test data contains an explicitly labelled fixture or a verified public receipt.

## Development setup

Requirements:

- Node.js 20.19+ or 22.12+
- pnpm 11.7+

```bash
pnpm install --frozen-lockfile
pnpm agency:demo
pnpm dev
```

The deterministic demo does not require Hermes or a publishing account. If you run `pnpm agency:run`, repository-derived context may be sent to the provider configured through your Hermes installation.

## Making a change

1. Fork the repository and create a focused branch.
2. Add or update tests when behavior changes.
3. Keep fixtures synthetic and label them as fixtures.
4. Update documentation when commands, schemas, or safety behavior change.
5. Run the checks below.
6. Open a pull request using the repository template.

Keep pull requests narrow. Separate refactors from behavior changes when possible, and preserve unrelated work in a dirty checkout.

## Validation

Run the checks relevant to your change:

```bash
# Required for TypeScript or UI changes
pnpm build

# Required for X executor changes
pnpm x:self-test

# Useful for agency/runtime changes
pnpm agency:demo
```

Also inspect `git diff --check` before submitting. If a check is not applicable or cannot run in your environment, explain why in the pull request.

## Contribution areas

Early contributions are especially welcome in:

- Project-context fixtures for different repository shapes.
- Provenance and claim-verification checks.
- Critic and revision-loop tests.
- Executor state transitions and recovery cases.
- Accessible operator-console states.
- Documentation and reproducible setup.

See the [good-first-issue guide](./.github/GOOD_FIRST_ISSUES.md) for issue ideas and scoping guidance.

## Commit and pull request guidance

Commit messages should describe the outcome in the imperative mood, for example:

```text
test: cover blocked executor transition
docs: explain deterministic demo provenance
fix: reject receipts without public post URLs
```

A pull request should explain:

- The problem and the chosen scope.
- The user-visible or data-contract change.
- How it was validated.
- Any privacy, publishing, or migration risk.
- Screenshots for visible UI changes.

## Reporting bugs and security issues

Use the bug report form for reproducible defects. Use [SECURITY.md](./SECURITY.md) for vulnerabilities or anything that could expose credentials, private context, or unauthorized publishing behavior.

## License and conduct

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](./LICENSE). Participation is governed by the [Code of Conduct](./CODE_OF_CONDUCT.md).
