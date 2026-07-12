import {
  Activity,
  Archive,
  BadgeCheck,
  Blocks,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Coins,
  Database,
  Eye,
  Gauge,
  GitBranch,
  Globe2,
  Layers3,
  Link,
  Radio,
  RefreshCcw,
  Search,
  Send,
  ShieldAlert,
  Timer,
  WalletCards,
  XCircle,
} from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import type {
  AgentNode,
  AgentStatus,
  ExecutionJob,
  ExecutionJobStatus,
  PublishReceipt,
  RunStatus,
  TraceEvent,
} from "../types"
import {
  getExecutionJobs,
  getPrimaryReceipt,
  getReviewMoment,
  getRuntimeMetrics,
  type DashboardRun,
  type ViewKey,
} from "./dashboard-data"

interface OperatorConsoleProps {
  run: DashboardRun
  view: ViewKey
  onViewChange: (view: ViewKey) => void
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
  dataSource: "convex"
}

const navItems: Array<{ key: ViewKey; label: string; icon: typeof Activity }> = [
  { key: "operations", label: "Operations", icon: Radio },
  { key: "catalog", label: "Catalog", icon: Archive },
  { key: "agency", label: "Agency", icon: Blocks },
  { key: "observability", label: "Observability", icon: Activity },
]

export function OperatorConsole({
  run,
  view,
  onViewChange,
  selectedAgentId,
  onSelectAgent,
  dataSource,
}: OperatorConsoleProps) {
  const selectedAgent = run.agents.find((agent) => agent.id === selectedAgentId) ?? run.agents[0]
  const jobs = getExecutionJobs(run)
  const receipt = getPrimaryReceipt(run)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            W
          </div>
          <div>
            <p className="eyebrow">Wingbeat</p>
            <h1>Operator Console</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="search-box">
            <Search size={16} />
            <span>Search runs, agents, evidence</span>
          </div>
          <StatusChip status={run.status} />
          <span className="source-pill">Convex live</span>
        </div>
      </header>

      <aside className="sidebar" aria-label="Console views">
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                className={view === item.key ? "nav-item active" : "nav-item"}
                key={item.key}
                onClick={() => onViewChange(item.key)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <p className="muted-label">Current run</p>
          <strong>{run.id}</strong>
          <span>{run.trigger}</span>
        </div>
      </aside>

      <main className="console-main">
        {view === "operations" && (
          <OperationsView
            jobs={jobs}
            receipt={receipt}
            run={run}
            selectedAgent={selectedAgent}
            selectedAgentId={selectedAgentId}
            onSelectAgent={onSelectAgent}
          />
        )}
        {view === "catalog" && <CatalogView run={run} />}
        {view === "agency" && (
          <AgencyView
            run={run}
            selectedAgentId={selectedAgentId}
            onSelectAgent={onSelectAgent}
          />
        )}
        {view === "observability" && (
          <ObservabilityView
            run={run}
            selectedAgentId={selectedAgentId}
            onSelectAgent={onSelectAgent}
          />
        )}
      </main>
    </div>
  )
}

function OperationsView({
  jobs,
  receipt,
  run,
  selectedAgent,
  selectedAgentId,
  onSelectAgent,
}: {
  jobs: ExecutionJob[]
  receipt?: PublishReceipt
  run: DashboardRun
  selectedAgent?: AgentNode
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
}) {
  const reviewMoment = getReviewMoment(run)

  return (
    <section className="view-grid operations-grid">
      <div className="section-header wide">
        <div>
          <p className="eyebrow">Autonomous publishing</p>
          <h2>Actual Run State</h2>
        </div>
        <div className="button-row">
          <span className="source-pill mono">{run.id}</span>
        </div>
      </div>

      <Panel className="queue-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Execution</p>
            <h3>Jobs from run data</h3>
          </div>
          <CalendarClock size={18} />
        </div>
        <div className="queue-list">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobRow job={job} key={job.id} run={run} />)
          ) : (
            <EmptyState>No execution jobs recorded for this run.</EmptyState>
          )}
        </div>
      </Panel>

      <Panel className="run-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Selected run</p>
            <h3>{run.project}</h3>
          </div>
          <StatusChip status={run.status} />
        </div>
        <p className="run-summary">{run.package.narrative}</p>
        <MetricGrid run={run} />
        <VetoCountdown job={jobs[0]} run={run} />
      </Panel>

      <ReceiptPanel receipt={receipt} />

      {reviewMoment ? (
        <ReviewMomentPanel run={run} />
      ) : (
        <Panel className="review-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Review</p>
              <h3>Draft Evaluation</h3>
            </div>
            <BadgeCheck size={18} />
          </div>
          <EmptyState>No failed/revised review moment recorded.</EmptyState>
        </Panel>
      )}

      <Panel className="trace-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Agent organization</p>
            <h3>Trace Tree</h3>
          </div>
          <GitBranch size={18} />
        </div>
        <TraceTree
          agents={run.agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={onSelectAgent}
        />
      </Panel>

      <Panel className="agent-detail-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Step drawer</p>
            <h3>{selectedAgent?.role ?? "No agent selected"}</h3>
          </div>
          {selectedAgent && <AgentStatusChip status={selectedAgent.status} />}
        </div>
        {selectedAgent ? <AgentDrawer agent={selectedAgent} events={run.events} /> : <EmptyState>No agents recorded.</EmptyState>}
      </Panel>

      <Panel className="evidence-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Evidence</p>
            <h3>Source Package</h3>
          </div>
          <Database size={18} />
        </div>
        <EvidenceList run={run} />
      </Panel>

      <Panel className="copy-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Channel adaptation</p>
            <h3>{run.package.adaptation.channel.toUpperCase()} Draft</h3>
          </div>
          <Send size={18} />
        </div>
        <pre className="copy-preview">{run.package.adaptation.copy}</pre>
      </Panel>
    </section>
  )
}

function CatalogView({ run }: { run: DashboardRun }) {
  return (
    <section className="view-grid catalog-grid">
      <div className="section-header wide">
        <div>
          <p className="eyebrow">Canonical content</p>
          <h2>{run.package.id}</h2>
        </div>
        <span className="confidence-badge">{Math.round(run.package.confidence * 100)}% confidence</span>
      </div>

      <Panel className="package-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Story object</p>
            <h3>{run.package.category}</h3>
          </div>
          <Layers3 size={18} />
        </div>
        <div className="package-stack">
          <KeyValue label="What changed" value={run.package.whatChanged} />
          <KeyValue label="Why it matters" value={run.package.whyItMatters} />
          <KeyValue label="Audience" value={run.package.audience} />
          <KeyValue label="Channel-neutral body" value={run.package.channelNeutralBody} />
        </div>
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Claims</p>
            <h3>Supported</h3>
          </div>
          <BadgeCheck size={18} />
        </div>
        <ClaimList claims={run.package.supportedClaims} empty="No supported claims recorded." />
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Guardrails</p>
            <h3>Prohibited</h3>
          </div>
          <ShieldAlert size={18} />
        </div>
        <ClaimList claims={run.package.prohibitedClaims} danger empty="No prohibited claims recorded." />
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Recorded hooks</p>
            <h3>Package Hooks</h3>
          </div>
          <Archive size={18} />
        </div>
        {run.package.hooks.length > 0 ? (
          <div className="hook-list">
            {run.package.hooks.map((hook, index) => (
              <div className="hook-row" key={hook}>
                <span className="hook-index">{String(index + 1).padStart(2, "0")}</span>
                <p>{hook}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>No hooks recorded.</EmptyState>
        )}
      </Panel>

      <Panel className="evidence-panel catalog-evidence">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Sources</p>
            <h3>Evidence Cards</h3>
          </div>
          <Eye size={18} />
        </div>
        <EvidenceList run={run} />
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Asset</p>
            <h3>Brief</h3>
          </div>
          <WalletCards size={18} />
        </div>
        <div className="asset-card">
          <div className="asset-card-top">
            <span>W</span>
            <strong>{run.package.adaptation.asset ? "Recorded Asset" : "No asset"}</strong>
          </div>
          <p>{run.package.adaptation.asset ?? "No asset recorded for this package."}</p>
        </div>
      </Panel>
    </section>
  )
}

function AgencyView({
  run,
  selectedAgentId,
  onSelectAgent,
}: {
  run: DashboardRun
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
}) {
  return (
    <section className="view-grid agency-grid">
      <div className="section-header wide">
        <div>
          <p className="eyebrow">Dynamic agency</p>
          <h2>Recorded Crew</h2>
        </div>
        <span className="source-pill">{run.agents.length} agents recorded</span>
      </div>

      <Panel className="role-registry">
        <div className="role-grid">
          {run.agents.length > 0 ? (
            run.agents.map((agent) => (
              <button
                className={selectedAgentId === agent.id ? "role-card selected" : "role-card"}
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                type="button"
              >
                <div className="role-card-header">
                  <Bot size={18} />
                  <div>
                    <h3>{agent.role}</h3>
                    <p>{agent.objective}</p>
                  </div>
                  <AgentStatusChip status={agent.status} />
                </div>
                {agent.output ? <p className="role-output">{agent.output}</p> : null}
              </button>
            ))
          ) : (
            <EmptyState>No crew recorded for this run.</EmptyState>
          )}
        </div>
      </Panel>

      <Panel className="trace-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Delegation</p>
            <h3>Handoffs</h3>
          </div>
          <ChevronRight size={18} />
        </div>
        <TraceTree
          agents={run.agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={onSelectAgent}
        />
      </Panel>

      <Panel className="agency-actions">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Execution boundary</p>
            <h3>Recorded State</h3>
          </div>
          <Gauge size={18} />
        </div>
        <ExecutionStateList run={run} />
      </Panel>
    </section>
  )
}

function ObservabilityView({
  run,
  selectedAgentId,
  onSelectAgent,
}: {
  run: DashboardRun
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
}) {
  return (
    <section className="view-grid observability-grid">
      <div className="section-header wide">
        <div>
          <p className="eyebrow">Run telemetry</p>
          <h2>Estimated Cost, Tokens, Latency</h2>
        </div>
        <StatusChip status={run.status} />
      </div>

      <Panel className="metrics-panel">
        <MetricGrid run={run} />
      </Panel>

      <ReviewMomentPanel run={run} />

      <Panel className="timeline-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Event stream</p>
            <h3>Timeline</h3>
          </div>
          <Activity size={18} />
        </div>
        <Timeline events={run.events} agents={run.agents} />
      </Panel>

      <Panel className="trace-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Tree</p>
            <h3>Agent Trace</h3>
          </div>
          <GitBranch size={18} />
        </div>
        <TraceTree
          agents={run.agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={onSelectAgent}
        />
      </Panel>

      <Panel className="event-detail-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Latest events</p>
            <h3>Recorded Calls</h3>
          </div>
          <Clock3 size={18} />
        </div>
        <div className="event-grid">
          {run.events.length > 0 ? (
            run.events.slice(-4).map((event) => (
              <div className="event-card" key={event.id}>
                <span>{event.type}</span>
                <strong>{event.title}</strong>
                <p>{event.detail}</p>
              </div>
            ))
          ) : (
            <EmptyState>No trace events recorded.</EmptyState>
          )}
        </div>
      </Panel>
    </section>
  )
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={`panel ${className}`}>{children}</section>
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>
}

function JobRow({ job, run }: { job: ExecutionJob; run: DashboardRun }) {
  return (
    <article className="queue-row">
      <div className="queue-date">
        <CalendarClock size={16} />
        <span>{formatShortDate(job.scheduledFor)}</span>
      </div>
      <div className="queue-main">
        <h3>{job.id}</h3>
        <p>
          {run.project} <ChevronRight size={14} /> {job.channel.toUpperCase()}
        </p>
      </div>
      <div className="queue-meta">
        <ExecutionStatusChip status={job.status} />
        {job.receiptId ? <span>{job.receiptId}</span> : null}
      </div>
    </article>
  )
}

function ReceiptPanel({ receipt }: { receipt?: PublishReceipt }) {
  return (
    <Panel className={receipt?.url ? "receipt-panel receipt-panel-live" : "receipt-panel"}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Publish receipt</p>
          <h3>{receipt ? receipt.status : "No receipt yet"}</h3>
        </div>
        <Link size={18} />
      </div>
      {receipt ? (
        <div className="receipt-body">
          {receipt.url ? (
            <a className="receipt-url" href={receipt.url} rel="noreferrer" target="_blank">
              {receipt.url}
            </a>
          ) : (
            <p>No public URL recorded yet.</p>
          )}
          <div className="receipt-grid">
            <KeyValue label="Channel" value={receipt.channel.toUpperCase()} />
            <KeyValue label="Account" value={receipt.account ?? "Not recorded"} />
            <KeyValue label="Post ID" value={receipt.postId ?? "Not recorded"} />
            <KeyValue label="Verified" value={receipt.verifiedAt ? formatTime(receipt.verifiedAt) : "Not recorded"} />
          </div>
          {receipt.verificationLog.length > 0 ? (
            <ul className="compact-list">
              {receipt.verificationLog.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <EmptyState>No publish receipt recorded for this run.</EmptyState>
      )}
    </Panel>
  )
}

function ReviewMomentPanel({ run }: { run: DashboardRun }) {
  const reviewMoment = getReviewMoment(run)

  if (!reviewMoment) {
    return (
      <Panel className="review-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Evaluation</p>
            <h3>Review Moment</h3>
          </div>
          <BadgeCheck size={18} />
        </div>
        <EmptyState>No weak-draft and revised-draft evaluation pair recorded.</EmptyState>
      </Panel>
    )
  }

  return (
    <Panel className="review-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Evaluation</p>
          <h3>Draft failed → revised passed</h3>
        </div>
        <BadgeCheck size={18} />
      </div>
      <div className="review-grid">
        <ReviewCard
          label="Draft failed"
          text={reviewMoment.weakDraft.text}
          result={reviewMoment.weakDraft.result}
        />
        <ReviewCard
          label="Revised passed"
          text={reviewMoment.revisedDraft.text}
          result={reviewMoment.revisedDraft.result}
        />
      </div>
    </Panel>
  )
}

function ReviewCard({
  label,
  text,
  result,
}: {
  label: string
  text: string
  result: {
    name: string
    passed: boolean
    score: number
    findings: string[]
  }
}) {
  return (
    <article className={result.passed ? "review-card passed" : "review-card failed"}>
      <div className="review-card-top">
        <span>{label}</span>
        <strong>{Math.round(result.score * 100)}%</strong>
      </div>
      <p>{text}</p>
      <div className="review-findings">
        <span>{result.name}</span>
        {result.findings.map((finding) => (
          <p key={finding}>{finding}</p>
        ))}
      </div>
    </article>
  )
}

function ExecutionStateList({ run }: { run: DashboardRun }) {
  const jobs = getExecutionJobs(run)
  const receipt = getPrimaryReceipt(run)

  return (
    <div className="state-list">
      <KeyValue label="Run status" value={run.status} />
      <KeyValue label="Scheduled for" value={run.scheduledFor ? formatDateTime(run.scheduledFor) : "Not recorded"} />
      <KeyValue label="Veto ends" value={run.vetoEndsAt ? formatDateTime(run.vetoEndsAt) : "Not recorded"} />
      <KeyValue label="Execution jobs" value={jobs.length ? jobs.map((job) => `${job.id}: ${job.status}`).join(", ") : "None recorded"} />
      <KeyValue label="Receipt" value={receipt?.url ?? receipt?.status ?? "None recorded"} />
    </div>
  )
}

function StatusChip({ status }: { status: RunStatus }) {
  const label = status.replace("_", " ")
  const Icon = statusIcon(status)
  return (
    <span className={`status-chip status-${status}`}>
      <Icon size={14} />
      {label}
    </span>
  )
}

function ExecutionStatusChip({ status }: { status: ExecutionJobStatus }) {
  const Icon = executionStatusIcon(status)
  return (
    <span className={`status-chip status-${status}`}>
      <Icon size={14} />
      {status.replace("_", " ")}
    </span>
  )
}

function AgentStatusChip({ status }: { status: AgentStatus }) {
  const Icon = agentStatusIcon(status)
  return (
    <span className={`status-chip agent-${status}`}>
      <Icon size={14} />
      {status}
    </span>
  )
}

function MetricGrid({ run }: { run: DashboardRun }) {
  const metrics = getRuntimeMetrics(run)
  const estimatedTokens = sumRecorded(run.agents.map((agent) => agent.tokens), run.events.map((event) => event.tokens))
  const passed = run.agents.filter((agent) => agent.status === "passed").length

  return (
    <div className="metric-grid">
      <Metric icon={Bot} label="Agents" value={`${metrics.agentCount ?? run.agents.length}`} detail={`${passed} passed`} />
      <Metric
        icon={Coins}
        label="Estimated cost"
        value={formatMoney(metrics.totalEstimatedCostUsd)}
        detail={`${formatNumber(estimatedTokens)} est. tokens`}
      />
      <Metric
        icon={Timer}
        label="Estimated latency"
        value={formatLatency(metrics.totalLatencyMs)}
        detail={`${metrics.traceEventCount ?? run.events.length} trace events`}
      />
      <Metric icon={Globe2} label="Channel" value={run.package.adaptation.channel.toUpperCase()} detail={run.package.category} />
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <Icon size={14} />
        <span className="metric-label">{label}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <p className="metric-detail">{detail}</p>
    </div>
  )
}

function VetoCountdown({ job, run }: { job?: ExecutionJob; run: DashboardRun }) {
  const [now, setNow] = useState(Date.now())
  const vetoEndsAt = job?.vetoEndsAt ?? run.vetoEndsAt
  const active = (job?.status ?? run.status) === "veto_window"

  useEffect(() => {
    if (!active) return

    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [active, vetoEndsAt])

  return (
    <div className="veto-box">
      <span className="veto-label">
        <Timer size={15} />
        Veto window
      </span>
      <div className="veto-meta">
        <strong className="veto-timer">{active ? formatRemaining(vetoEndsAt, now) : "Inactive"}</strong>
        <span>{job ? `Job ${job.id}` : "No execution job recorded."}</span>
      </div>
    </div>
  )
}

function TraceTree({
  agents,
  selectedAgentId,
  onSelectAgent,
}: {
  agents: AgentNode[]
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
}) {
  const roots = agents.filter((agent) => !agent.parentId)

  if (agents.length === 0) return <EmptyState>No agent trace recorded.</EmptyState>

  return (
    <div className="trace-tree">
      {roots.map((agent) => (
        <TraceNode
          agent={agent}
          agents={agents}
          key={agent.id}
          selectedAgentId={selectedAgentId}
          onSelectAgent={onSelectAgent}
        />
      ))}
    </div>
  )
}

function TraceNode({
  agent,
  agents,
  selectedAgentId,
  onSelectAgent,
}: {
  agent: AgentNode
  agents: AgentNode[]
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
}) {
  const children = agents.filter((item) => item.parentId === agent.id)

  return (
    <div className="trace-node">
      <button
        className={selectedAgentId === agent.id ? "trace-node-button selected" : "trace-node-button"}
        onClick={() => onSelectAgent(agent.id)}
        type="button"
      >
        <span className={`node-dot agent-${agent.status}`} />
        <span className="trace-label">
          <strong>{agent.role}</strong>
          <small>{agent.objective}</small>
        </span>
        <span className={`trace-status agent-${agent.status}`}>{agent.status}</span>
      </button>
      {children.length > 0 && (
        <div className="trace-children">
          {children.map((child) => (
            <TraceNode
              agent={child}
              agents={agents}
              key={child.id}
              selectedAgentId={selectedAgentId}
              onSelectAgent={onSelectAgent}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AgentDrawer({ agent, events }: { agent: AgentNode; events: TraceEvent[] }) {
  const agentEvents = events.filter((event) => event.agentId === agent.id)

  return (
    <div className="agent-drawer">
      <p>{agent.objective}</p>
      <div className="drawer-stat-row">
        <span>
          <Timer size={15} />
          Est. {formatLatency(agent.latencyMs)}
        </span>
        <span>
          <Coins size={15} />
          Est. {formatMoney(agent.costUsd)}
        </span>
        <span>
          <Gauge size={15} />
          Est. {formatNumber(agent.tokens)} tokens
        </span>
      </div>
      <div className="drawer-output">
        <strong>Output</strong>
        <p>{agent.output ?? "No output recorded yet."}</p>
      </div>
      <div className="mini-events">
        {agentEvents.length > 0 ? (
          agentEvents.map((event) => (
            <div key={event.id}>
              <span>{formatTime(event.at)}</span>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
            </div>
          ))
        ) : (
          <EmptyState>No events recorded for this agent.</EmptyState>
        )}
      </div>
    </div>
  )
}

function EvidenceList({ run }: { run: DashboardRun }) {
  if (run.package.evidence.length === 0) return <EmptyState>No evidence recorded.</EmptyState>

  return (
    <div className="evidence-list">
      {run.package.evidence.map((evidence) => (
        <article className="evidence-card" key={evidence.id}>
          <span>{evidence.source}</span>
          <strong>{evidence.label}</strong>
          <p>{evidence.detail}</p>
        </article>
      ))}
    </div>
  )
}

function ClaimList({
  claims,
  danger = false,
  empty,
}: {
  claims: string[]
  danger?: boolean
  empty: string
}) {
  if (claims.length === 0) return <EmptyState>{empty}</EmptyState>

  return (
    <ul className={danger ? "check-list danger" : "check-list"}>
      {claims.map((claim) => (
        <li key={claim}>
          {danger ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{claim}</span>
        </li>
      ))}
    </ul>
  )
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="key-value">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  )
}

function Timeline({ events, agents }: { events: TraceEvent[]; agents: AgentNode[] }) {
  if (events.length === 0) return <EmptyState>No timeline events recorded.</EmptyState>

  return (
    <div className="timeline">
      {events.map((event) => {
        const agent = agents.find((item) => item.id === event.agentId)
        return (
          <article className="timeline-row" key={event.id}>
            <div className="timeline-time">{formatTime(event.at)}</div>
            <div className="timeline-marker" />
            <div className="timeline-body">
              <span>{event.type}</span>
              <h3>{event.title}</h3>
              <p>{event.detail}</p>
              <small>{agent?.role ?? event.agentId ?? "run"}</small>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function statusIcon(status: RunStatus) {
  switch (status) {
    case "running":
      return Activity
    case "in_review":
      return Eye
    case "veto_window":
      return Timer
    case "published":
      return CheckCircle2
    case "blocked":
      return ShieldAlert
    case "failed":
      return CircleAlert
    case "overdue":
      return Clock3
    case "queue":
      return Clock3
    case "veto":
      return Timer
    case "ready":
      return Send
    default:
      return Activity
  }
}

function executionStatusIcon(status: ExecutionJobStatus) {
  switch (status) {
    case "draft":
      return Archive
    case "scheduled":
      return CalendarClock
    case "notifying":
      return Radio
    case "veto_window":
      return Timer
    case "publishing":
      return Send
    case "published":
      return CheckCircle2
    case "blocked":
      return ShieldAlert
    case "failed":
      return CircleAlert
    case "overdue":
      return Clock3
    case "queue":
      return Clock3
    case "veto":
      return Timer
    case "ready":
      return Send
    default:
      return Activity
  }
}

function agentStatusIcon(status: AgentStatus) {
  switch (status) {
    case "queued":
      return Clock3
    case "working":
      return Activity
    case "passed":
      return CheckCircle2
    case "revising":
      return RefreshCcw
    case "failed":
      return CircleAlert
    default:
      return Activity
  }
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatLatency(value?: number) {
  if (typeof value !== "number") return "Not recorded"
  if (value < 1000) return `${value}ms`
  if (value < 60000) return `${(value / 1000).toFixed(1)}s`
  return `${Math.round(value / 60000)}m ${Math.round((value % 60000) / 1000)}s`
}

function formatMoney(value?: number) {
  if (typeof value !== "number") return "Not recorded"
  return `$${value.toFixed(value < 0.01 ? 4 : 2)}`
}

function formatNumber(value?: number) {
  if (typeof value !== "number") return "Not recorded"
  return value.toLocaleString()
}

function formatRemaining(value: string | undefined, now: number) {
  if (!value) return "No window"

  const ms = new Date(value).getTime() - now
  if (ms <= 0) return "Ready to publish"

  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`
}

function sumRecorded(...groups: Array<Array<number | undefined>>): number | undefined {
  const values = groups.flat().filter((value): value is number => typeof value === "number")
  if (values.length === 0) return undefined
  return values.reduce((sum, value) => sum + value, 0)
}
