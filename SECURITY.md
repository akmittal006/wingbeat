# Security policy

## Supported versions

Wingbeat is pre-release software. Security fixes are applied to the current default branch; there are no supported release branches yet.

## Report a vulnerability privately

Please do not open a public issue for a vulnerability.

When the repository is hosted on GitHub, use **Security → Report a vulnerability** to submit a private advisory. If private reporting has not been enabled yet, contact a maintainer privately and ask for a secure reporting channel without including exploit details in the initial public message.

Include, when possible:

- The affected commit and environment.
- Reproduction steps or a minimal proof of concept.
- The potential impact.
- Whether credentials, private repository context, or a publishing account may be exposed.
- A suggested mitigation, if you have one.

Maintainers will acknowledge a report as soon as practical, investigate it, and coordinate disclosure with the reporter. Because the project is volunteer-run and pre-release, no fixed response-time guarantee is offered.

## High-risk areas

Please report any behavior that could:

- Read or expose cookies, auth headers, browser storage, passwords, or provider credentials.
- Send private repository content to an external provider without clear operator intent.
- Bypass the veto or action-time confirmation boundary.
- Mark an execution as published without a verified public receipt.
- Publish different copy or assets from the confirmed job.
- Allow untrusted repository content to execute commands or escape its intended data boundary.
- Commit secrets or sensitive generated artifacts to the repository.

## Safe research

Use synthetic data and accounts you control. Do not access other people's data, degrade third-party services, evade platform protections, or publish content without authorization. Stop testing if you encounter real credentials or private data.
