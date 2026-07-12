import { useMemo, useState } from "react"
import { useQuery } from "convex/react"
import { ExternalLink } from "lucide-react"
import { api } from "../../../convex/_generated/api"
import { opsApi, type PackageLite, type ReceiptLite } from "../../lib/ops-api"
import { EmptyLine, Pill, ellipsize } from "./shared"

interface JobLite {
  id: string
  runId: string
  channel: string
  status: string
}

export function Catalog() {
  const packages = useQuery(opsApi.listContentPackages)
  const receipts = useQuery(opsApi.listReceipts)
  const jobs = useQuery(api.powerup.listJobs) as JobLite[] | undefined
  const [channel, setChannel] = useState<string>("all")

  const jobByRun = useMemo(() => new Map((jobs ?? []).map((job) => [job.runId, job])), [jobs])
  const verifiedByRun = useMemo(() => {
    const map = new Map<string, ReceiptLite>()
    for (const receipt of receipts ?? []) {
      if (receipt.status === "verified" && receipt.url) map.set(receipt.runId, receipt)
    }
    return map
  }, [receipts])

  const channels = useMemo(() => {
    const set = new Set<string>()
    for (const pkg of packages ?? []) {
      set.add(jobByRun.get(pkg.runId)?.channel ?? pkg.package.adaptation?.channel ?? "x")
    }
    return Array.from(set)
  }, [packages, jobByRun])

  if (packages === undefined || receipts === undefined || jobs === undefined) {
    return <EmptyLine>Loading catalog…</EmptyLine>
  }

  if (packages.length === 0) {
    return <EmptyLine>No content packages published or drafted yet</EmptyLine>
  }

  const filtered = packages.filter((pkg) => {
    if (channel === "all") return true
    const c = jobByRun.get(pkg.runId)?.channel ?? pkg.package.adaptation?.channel ?? "x"
    return c === channel
  })

  return (
    <div className="catalog">
      <div className="catalog-filters">
        <span className="filter-label">Channel</span>
        <div className="filter-chips">
          <FilterChip active={channel === "all"} onClick={() => setChannel("all")}>
            all
          </FilterChip>
          {channels.map((c) => (
            <FilterChip active={channel === c} onClick={() => setChannel(c)} key={c}>
              {c}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyLine>No content packages on this channel</EmptyLine>
      ) : (
        <div className="catalog-grid">
          {filtered.map((pkg) => (
            <CatalogCard
              key={pkg.packageId}
              pkg={pkg}
              channel={jobByRun.get(pkg.runId)?.channel ?? pkg.package.adaptation?.channel ?? "x"}
              receipt={verifiedByRun.get(pkg.runId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CatalogCard({
  pkg,
  channel,
  receipt,
}: {
  pkg: PackageLite
  channel: string
  receipt?: ReceiptLite
}) {
  const verdict = evaluationVerdict(pkg)
  return (
    <article className="catalog-card">
      <header className="catalog-card-head">
        <Pill tone="neutral">{channel}</Pill>
        <span className="catalog-cat">{pkg.category}</span>
      </header>
      <p className="catalog-excerpt">{ellipsize(pkg.narrative, 160)}</p>
      <footer className="catalog-card-foot">
        <Pill tone={verdict.tone}>{verdict.label}</Pill>
        {receipt ? (
          <a className="receipt-link" href={receipt.url} target="_blank" rel="noreferrer">
            <ExternalLink size={12} /> receipt
          </a>
        ) : (
          <span className="catalog-norcpt">no receipt</span>
        )}
        <span className="catalog-run">run {pkg.runId}</span>
      </footer>
    </article>
  )
}

function evaluationVerdict(pkg: PackageLite): { label: string; tone: "green" | "amber" | "neutral" } {
  const evaluations = pkg.package.evaluations
  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    return { label: "Not evaluated", tone: "neutral" }
  }
  const allPassed = evaluations.every((evaluation) => evaluation.passed)
  return allPassed ? { label: "Passed", tone: "green" } : { label: "Needs revision", tone: "amber" }
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button className={active ? "filter-chip active" : "filter-chip"} type="button" onClick={onClick}>
      {children}
    </button>
  )
}
