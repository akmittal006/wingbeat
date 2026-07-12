import { useMutation, useQuery } from "convex/react"
import { useState } from "react"
import {
  Activity as ActivityIcon,
  Antenna,
  BellRing,
  Check,
  Inbox,
  Repeat,
  ShieldX,
  Sparkles,
} from "lucide-react"
import { api } from "../../../convex/_generated/api"
import {
  opsApi,
  type ActivityItem,
  type Automation,
  type Opportunity,
  type Sensor,
} from "../../lib/ops-api"
import {
  Card,
  EmptyLine,
  Pill,
  clockTime,
  countdown,
  ellipsize,
  isStale,
  timeAgo,
  useNow,
} from "./shared"

interface JobLite {
  id: string
  runId: string
  channel: string
  status: string
  scheduledFor: string
  vetoEndsAt?: string
  payload?: { copy?: string; asset?: string }
}

export function Overview({ onReview }: { onReview: (runId: string) => void }) {
  const now = useNow()
  const jobs = useQuery(api.powerup.listJobs) as JobLite[] | undefined
  const automations = useQuery(opsApi.listAutomations)
  const sensors = useQuery(opsApi.listSensors)
  const opportunities = useQuery(opsApi.listOpportunities, { status: "new" })
  const activity = useQuery(opsApi.recentActivity)

  const vetoJobs = (jobs ?? []).filter((job) => job.status === "veto")

  return (
    <div className="overview">
      <NeedsYou jobs={vetoJobs} now={now} onReview={onReview} />

      <div className="two-col">
        <Automations rows={automations} />
        <Sensors rows={sensors} now={now} />
      </div>

      <OpportunitiesInbox rows={opportunities} />

      <ActivityFeed rows={activity} />
    </div>
  )
}

function NeedsYou({
  jobs,
  now,
  onReview,
}: {
  jobs: JobLite[]
  now: number
  onReview: (runId: string) => void
}) {
  const block = useMutation(api.powerup.blockJob)

  if (jobs.length === 0) {
    return (
      <section className="needs-you quiet">
        <Check size={15} />
        <span>Nothing needs you right now</span>
      </section>
    )
  }

  return (
    <section className="needs-you active">
      <header className="needs-you-head">
        <BellRing size={15} />
        <span>Needs you</span>
      </header>
      <div className="needs-you-list">
        {jobs.map((job) => {
          const { label, expired } = countdown(job.vetoEndsAt, now)
          const preview = job.payload?.copy ? ellipsize(job.payload.copy, 96) : "No draft copy recorded"
          return (
            <article className="needs-you-row" key={job.id}>
              <div className="needs-you-main">
                <p className="needs-you-preview">{preview}</p>
                <span className="needs-you-meta">
                  {expired
                    ? "Veto window elapsed"
                    : `Publishes in ${label} unless vetoed`}{" "}
                  · {job.channel}
                </span>
              </div>
              <div className="needs-you-actions">
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => block({ jobId: job.id, reason: "Vetoed from ops center" })}
                >
                  <ShieldX size={14} /> Veto
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => onReview(job.runId)}>
                  Review
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Automations({ rows }: { rows: Automation[] | undefined }) {
  const live = (rows ?? []).filter((row) => row.enabled).length
  return (
    <Card title="Automations" count={`${live} live`} icon={<Repeat size={15} />} className="utility-card">
      {rows === undefined ? (
        <EmptyLine>Loading…</EmptyLine>
      ) : rows.length === 0 ? (
        <EmptyLine>No automations configured yet</EmptyLine>
      ) : (
        <ul className="row-list">
          {rows.map((row) => (
            <li className="line-row" key={row.id}>
              <span className="line-primary">
                {row.name} <span className="arrow">→</span> {row.channel}
              </span>
              <span className="line-muted">
                {row.enabled
                  ? row.nextRunAt
                    ? `next ${clockTime(row.nextRunAt)}`
                    : row.trigger
                  : "paused"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function Sensors({ rows, now }: { rows: Sensor[] | undefined; now: number }) {
  const syncing = rows?.length ?? 0
  return (
    <Card title="Context sensors" count={`${syncing} syncing`} icon={<Antenna size={15} />} className="utility-card">
      {rows === undefined ? (
        <EmptyLine>Loading…</EmptyLine>
      ) : rows.length === 0 ? (
        <EmptyLine>No sensors syncing yet</EmptyLine>
      ) : (
        <ul className="row-list">
          {rows.map((row) => {
            const stale = isStale(row.lastSyncedAt, 60 * 60 * 1000, now)
            return (
              <li className="line-row" key={row.id}>
                <span className="line-primary">{row.source}</span>
                <span className={stale ? "line-muted stale" : "line-muted"}>
                  {timeAgo(row.lastSyncedAt, now)} · {row.findingsCount} findings
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

const DISPLAY_CAP = 10

function OpportunitiesInbox({ rows }: { rows: Opportunity[] | undefined }) {
  const draft = useMutation(opsApi.draftOpportunity)
  const skip = useMutation(opsApi.skipOpportunity)
  const [collapsed, setCollapsed] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const count = rows?.length ?? 0

  const total = rows?.length ?? 0
  const visible = showAll ? rows ?? [] : (rows ?? []).slice(0, DISPLAY_CAP)

  return (
    <Card
      title="Opportunities inbox"
      count={`${count} new`}
      icon={<Inbox size={15} />}
      className="inbox"
      collapsible
      collapsed={collapsed}
      onToggle={() => setCollapsed((v) => !v)}
    >
      {rows === undefined ? (
        <EmptyLine>Loading…</EmptyLine>
      ) : rows.length === 0 ? (
        <EmptyLine>No opportunities in the inbox yet</EmptyLine>
      ) : (
        <ul className="row-list">
          {visible.map((row) => (
            <li className="inbox-row" key={row.id}>
              <span className={`type-badge type-${sourceKey(row.source)}`}>{row.source}</span>
              <p className="inbox-desc">{row.description}</p>
              <div className="inbox-actions">
                <button className="btn btn-primary" type="button" onClick={() => draft({ id: row.id })}>
                  <Sparkles size={13} /> {row.type === "automation" ? "Set up" : "Draft it"}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => skip({ id: row.id })}>
                  Skip
                </button>
              </div>
            </li>
          ))}
          {total > DISPLAY_CAP ? (
            <li className="show-more-row">
              <button className="show-more" type="button" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "Show fewer" : `Show all ${total}`}
              </button>
            </li>
          ) : null}
        </ul>
      )}
    </Card>
  )
}

function ActivityFeed({ rows }: { rows: ActivityItem[] | undefined }) {
  const [collapsed, setCollapsed] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const total = rows?.length ?? 0
  const visible = showAll ? rows ?? [] : (rows ?? []).slice(0, DISPLAY_CAP)

  return (
    <Card
      title="Activity"
      icon={<ActivityIcon size={15} />}
      collapsible
      collapsed={collapsed}
      onToggle={() => setCollapsed((v) => !v)}
    >
      {rows === undefined ? (
        <EmptyLine>Loading…</EmptyLine>
      ) : rows.length === 0 ? (
        <EmptyLine>No activity recorded yet</EmptyLine>
      ) : (
        <ul className="timeline">
          {visible.map((row) => (
            <li className="timeline-row" key={row.id}>
              <span className="timeline-icon">
                {row.kind === "publish" || row.kind === "receipt" ? (
                  <Check size={13} />
                ) : (
                  <span className="timeline-dot" />
                )}
              </span>
              <div className="timeline-body">
                <p className="timeline-title">
                  {row.title}
                  {row.receiptUrl ? (
                    <>
                      {" "}
                      <a className="receipt-link" href={row.receiptUrl} target="_blank" rel="noreferrer">
                        receipt
                      </a>
                    </>
                  ) : null}
                </p>
                <p className="timeline-detail">{ellipsize(row.detail, 140)}</p>
              </div>
              <span className="timeline-time">{clockTime(row.at)}</span>
            </li>
          ))}
          {total > DISPLAY_CAP ? (
            <li className="show-more-row">
              <button className="show-more" type="button" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "Show fewer" : `Show all ${total}`}
              </button>
            </li>
          ) : null}
        </ul>
      )}
    </Card>
  )
}

function sourceKey(source: string): string {
  const s = source.toLowerCase()
  if (s.includes("codex")) return "codex"
  if (s.includes("claude")) return "claude"
  if (s.includes("hermes")) return "hermes"
  if (s.includes("automation")) return "automation"
  return "other"
}
