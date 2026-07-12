import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { opsApi, type Opportunity, type PackageLite, type RunLite } from "../../lib/ops-api"
import { EmptyLine, Pill, ellipsize, statusTone } from "./shared"

interface JobLite {
  id: string
  runId: string
  channel: string
  status: string
}

type ColumnKey =
  | "opportunity"
  | "drafting"
  | "critique"
  | "revision"
  | "adaptation"
  | "queued"
  | "veto"
  | "published"
  | "blocked"

const COLUMNS: Array<{ key: ColumnKey; label: string }> = [
  { key: "opportunity", label: "Opportunity" },
  { key: "drafting", label: "Drafting" },
  { key: "critique", label: "Critique" },
  { key: "revision", label: "Revision" },
  { key: "adaptation", label: "Adaptation" },
  { key: "queued", label: "Queued" },
  { key: "veto", label: "Veto" },
  { key: "published", label: "Published" },
  { key: "blocked", label: "Blocked" },
]

interface PackageCard {
  kind: "package"
  id: string
  title: string
  category: string
  excerpt: string
  channel: string
  status: string
  runId: string
}

interface OppCard {
  kind: "opportunity"
  id: string
  title: string
  excerpt: string
  source: string
}

type PipelineCard = PackageCard | OppCard

export function Pipeline() {
  const runs = useQuery(opsApi.listRuns)
  const packages = useQuery(opsApi.listContentPackages)
  const opportunities = useQuery(opsApi.listOpportunities, {})
  const jobs = useQuery(api.powerup.listJobs) as JobLite[] | undefined

  if (runs === undefined || packages === undefined || opportunities === undefined || jobs === undefined) {
    return <EmptyLine>Loading pipeline…</EmptyLine>
  }

  const columns = buildColumns(runs, packages, opportunities, jobs)
  const total = Object.values(columns).reduce((sum, cards) => sum + cards.length, 0)

  if (total === 0) {
    return <EmptyLine>No content packages in the pipeline yet</EmptyLine>
  }

  return (
    <div className="kanban">
      {COLUMNS.map(({ key, label }) => {
        const cards = columns[key]
        if (cards.length === 0) {
          return (
            <div className="kanban-col collapsed" key={key}>
              <span className="kanban-col-label">{label}</span>
              <span className="kanban-col-zero">0</span>
            </div>
          )
        }
        return (
          <div className="kanban-col" key={key}>
            <header className="kanban-col-head">
              <span>{label}</span>
              <span className="kanban-col-count">{cards.length}</span>
            </header>
            <div className="kanban-cards">
              {cards.map((card) => (
                <Kard card={card} key={card.id} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Kard({ card }: { card: PipelineCard }) {
  if (card.kind === "opportunity") {
    return (
      <article className="kard">
        <span className="type-badge type-other">{card.source}</span>
        <p className="kard-excerpt">{ellipsize(card.excerpt, 110)}</p>
      </article>
    )
  }
  return (
    <article className="kard">
      <div className="kard-top">
        <span className="kard-title">{card.title}</span>
        <Pill tone={statusTone(card.status)}>{card.channel}</Pill>
      </div>
      <p className="kard-cat">{card.category}</p>
      <p className="kard-excerpt">{ellipsize(card.excerpt, 110)}</p>
    </article>
  )
}

function buildColumns(
  runs: RunLite[],
  packages: PackageLite[],
  opportunities: Opportunity[],
  jobs: JobLite[],
): Record<ColumnKey, PipelineCard[]> {
  const columns: Record<ColumnKey, PipelineCard[]> = {
    opportunity: [],
    drafting: [],
    critique: [],
    revision: [],
    adaptation: [],
    queued: [],
    veto: [],
    published: [],
    blocked: [],
  }

  for (const opp of opportunities) {
    if (opp.status === "skipped") continue
    const card: OppCard = {
      kind: "opportunity",
      id: `opp-${opp.id}`,
      title: opp.source,
      excerpt: opp.description,
      source: opp.source,
    }
    columns[opp.status === "drafting" ? "drafting" : "opportunity"].push(card)
  }

  const runById = new Map(runs.map((run) => [run.id, run]))
  const jobByRun = new Map(jobs.map((job) => [job.runId, job]))

  for (const pkg of packages) {
    const run = runById.get(pkg.runId)
    const job = jobByRun.get(pkg.runId)
    const channel = job?.channel ?? pkg.package.adaptation?.channel ?? "x"
    const status = job?.status ?? run?.status ?? "drafting"
    const card: PackageCard = {
      kind: "package",
      id: pkg.packageId,
      title: pkg.project,
      category: pkg.category,
      excerpt: pkg.narrative,
      channel,
      status,
      runId: pkg.runId,
    }
    columns[columnForPackage(job?.status, run?.status)].push(card)
  }

  return columns
}

function columnForPackage(jobStatus: string | undefined, runStatus: string | undefined): ColumnKey {
  switch (jobStatus) {
    case "queue":
    case "ready":
      return "queued"
    case "veto":
      return "veto"
    case "published":
      return "published"
    case "blocked":
      return "blocked"
    default:
      break
  }
  switch (runStatus) {
    case "published":
      return "published"
    case "blocked":
    case "failed":
      return "blocked"
    default:
      return "drafting"
  }
}
