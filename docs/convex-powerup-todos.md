# Convex PowerUp Status

This branch completes the local direct cutover: Convex is the only runtime persistence path for projects, runs, ordered trace events, content packages, execution jobs, verified receipts, and three-layer memory. Local proof used an anonymous Convex deployment and a synthetic receipt URL; hosted/cloud PowerUp proof is still pending.

## Completed Local Proof

| Item | Owner | Status | Evidence |
| --- | --- | --- | --- |
| Convex schema and generated API are tracked | Engineering | Done | `convex/schema.ts`, `convex/powerup.ts`, `convex/_generated/*` |
| Runtime writes run/package/events/memory/job to Convex | Engineering | Done | `scripts/run-agency.mjs` created local run `run-aef59755` and job `xjob-a95fefc2` against `http://127.0.0.1:3210` |
| X executor uses server-side Convex mutations | Engineering | Done | Local job transitioned `queue -> veto -> ready -> published` through `scripts/x-execution/x-executor.mjs` |
| Dashboard reads reactive Convex query | Engineering | Done | Vite dashboard served locally with `VITE_CONVEX_URL=http://127.0.0.1:3210` and queried the published run |
| JSON persistence and fixtures removed | Engineering | Done | Removed `public/data/latest-run.json`, `src/data/latest-run.ts`, and `src/data/seed.ts`; docs now state there is no JSON mirror or fallback |

## Pending Work

| Item | Owner | Status | Acceptance criteria |
| --- | --- | --- | --- |
| Authenticate and link hosted Convex project | Engineering | Pending | `npx convex login` and project selection are complete; `.env.local` remains untracked; hosted `VITE_CONVEX_URL` is available through deployment configuration |
| Deploy schema and functions to hosted Convex | Engineering | Pending | `convex deploy` succeeds against the linked hosted project; deployed functions match this branch |
| Capture hosted dashboard proof | Engineering | Pending | Convex dashboard screenshots or exported evidence show the same run, event rows, content package, job, memory records, and receipt shown in Wingbeat |
| Add database-level concurrent receipt uniqueness | Engineering | Pending | Concurrent duplicate receipt attempts for a job are rejected or return the same receipt without producing duplicate receipt rows |
| Prove genuine X publish and receipt | Product/Engineering | Pending | A real X post is published from a ready job, and the public URL is verified and recorded in Convex; no synthetic URL is used as production proof |
| Adapt Hermes plugin away from JSON | Hermes integration owner | Pending | Hermes plugin reads/writes Convex state only and does not depend on JSON runtime artifacts |
| Port visual pipeline onto Convex | Visual pipeline owner | Pending | Asset briefs, generated assets, and visual proof metadata are persisted in Convex and rendered from Convex queries |
| Port X taxonomy onto Convex | Content systems owner | Pending | X taxonomy, playbook selections, and channel classification metadata are stored in Convex and referenced by runs/packages |
| Hosted end-to-end validation | Engineering | Pending | Hosted frontend and hosted Convex deployment complete runtime creation, dashboard reactive read, executor transitions, and receipt recording without local services |

## Production Evidence Rules

- Do not present the local anonymous Convex deployment as hosted PowerUp completion.
- Do not present the synthetic receipt URL from local proof as a genuine X publish.
- Do not commit secrets, `.env.local`, local Convex data, generated runtime artifacts, or browser/session state.
- A production `published` status requires a verified public receipt recorded by Convex.
