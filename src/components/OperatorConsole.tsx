import {
  Activity,
  Archive,
  ArrowRight,
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
  Pause,
  Play,
  Radio,
  RefreshCcw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Timer,
  WalletCards,
  XCircle,
} from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import type { AgencyRun, AgentNode, AgentStatus, RunStatus, TraceEvent } from "../types"
import type { QueueItem, RoleSummary, ViewKey } from "./dashboard-data"
import { buildQueue, buildRoleSummaries } from "./dashboard-data"

interface OperatorConsoleProps {
  run: AgencyRun
  view: ViewKey
  onViewChange: (view: ViewKey) => void
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
  dataSource: "remote" | "fallback"
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
  const queue = buildQueue(run)
  const roles = buildRoleSummaries(run)
  const selectedAgent = run.agents.find((agent) => agent.id === selectedAgentId) ?? run.agents[0]

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
          <span className="source-pill">{dataSource === "remote" ? "Live data" : "Fallback data"}</span>
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
            queue={queue}
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
            roles={roles}
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
  queue,
  run,
  selectedAgent,
  selectedAgentId,
  onSelectAgent,
}: {
  queue: QueueItem[]
  run: AgencyRun
  selectedAgent?: AgentNode
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
}) {
  return (
    <section className="view-grid operations-grid">
      <div className="section-header wide">
        <div>
          <p className="eyebrow">Autonomous publishing</p>
          <h2>Weekly Queue</h2>
        </div>
        <div className="button-row">
          <button className="icon-button" title="Pause automation" type="button">
            <Pause size={17} />
          </button>
          <button className="primary-action" type="button">
            <Play size={17} />
            Start job
          </button>
        </div>
      </div>

      <Panel className="queue-panel">
        <div className="queue-list">
          {queue.map((item) => (
            <QueueRow item={item} key={item.id} />
          ))}
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
        <VetoCountdown vetoEndsAt={run.vetoEndsAt} status={run.status} />
      </Panel>

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
        {selectedAgent ? <AgentDrawer agent={selectedAgent} events={run.events} /> : null}
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

function CatalogView({ run }: { run: AgencyRun }) {
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
        <ul className="check-list">
          {run.package.supportedClaims.map((claim) => (
            <li key={claim}>
              <CheckCircle2 size={16} />
              <span>{claim}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Guardrails</p>
            <h3>Prohibited</h3>
          </div>
          <ShieldAlert size={18} />
        </div>
        <ul className="check-list danger">
          {run.package.prohibitedClaims.map((claim) => (
            <li key={claim}>
              <XCircle size={16} />
              <span>{claim}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Reusable hooks</p>
            <h3>Unused Angles</h3>
          </div>
          <Sparkles size={18} />
        </div>
        <div className="hook-list">
          {run.package.hooks.map((hook, index) => (
            <div className="hook-row" key={hook}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{hook}</p>
            </div>
          ))}
        </div>
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
            <strong>Operator Card</strong>
          </div>
          <p>{run.package.adaptation.asset ?? "No asset requested."}</p>
        </div>
      </Panel>
    </section>
  )
}

function AgencyView({
  run,
  roles,
  selectedAgentId,
  onSelectAgent,
}: {
  run: AgencyRun
  roles: RoleSummary[]
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
}) {
  return (
    <section className="view-grid agency-grid">
      <div className="section-header wide">
        <div>
          <p className="eyebrow">Dynamic agency</p>
          <h2>Role Registry</h2>
        </div>
        <div className="button-row">
          <button className="secondary-action" type="button">
            <RefreshCcw size={16} />
            Retry
          </button>
          <button className="primary-action" type="button">
            <Bot size={16} />
            Create role
          </button>
        </div>
      </div>

      <Panel className="role-registry">
        <div className="role-grid">
          {roles.map((role) => (
            <div className="role-card" key={role.role}>
              <div className="role-card-header">
                <Bot size={18} />
                <div>
                  <h3>{role.role}</h3>
                  <p>{role.agents} active agent{role.agents === 1 ? "" : "s"}</p>
                </div>
                <span>{role.status}</span>
              </div>
              <div className="tag-wrap">
                {role.tools.map((tool) => (
                  <span className="tag" key={tool}>
                    {tool}
                  </span>
                ))}
              </div>
              <ul className="compact-list">
                {role.guardrails.map((guardrail) => (
                  <li key={guardrail}>{guardrail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="trace-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Delegation</p>
            <h3>Handoffs</h3>
          </div>
          <ArrowRight size={18} />
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
            <p className="eyebrow">Controls</p>
            <h3>Run Management</h3>
          </div>
          <Gauge size={18} />
        </div>
        <div className="control-grid">
          <ControlButton icon={Pause} label="Pause" />
          <ControlButton icon={RefreshCcw} label="Retry" />
          <ControlButton icon={Eye} label="Inspect" />
          <ControlButton icon={ShieldAlert} label="Block" />
        </div>
        <p className="muted-copy">
          {run.status === "veto_window"
            ? "Countdown is active. Blocking now prevents autonomous publish."
            : "Controls apply to the currently selected run."}
        </p>
      </Panel>
    </section>
  )
}

function ObservabilityView({
  run,
  selectedAgentId,
  onSelectAgent,
}: {
  run: AgencyRun
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
}) {
  return (
    <section className="view-grid observability-grid">
      <div className="section-header wide">
        <div>
          <p className="eyebrow">Run telemetry</p>
          <h2>Trace, Costs, Latency</h2>
        </div>
        <StatusChip status={run.status} />
      </div>

      <Panel className="metrics-panel">
        <MetricGrid run={run} />
      </Panel>

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
            <h3>Tool Calls</h3>
          </div>
          <Clock3 size={18} />
        </div>
        <div className="event-grid">
          {run.events.slice(-4).map((event) => (
            <div className="event-card" key={event.id}>
              <span>{event.type}</span>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
            </div>
          ))}
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

function QueueRow({ item }: { item: QueueItem }) {
  return (
    <article className="queue-row">
      <div className="queue-date">
        <CalendarClock size={16} />
        <span>{formatShortDate(item.scheduledFor)}</span>
      </div>
      <div className="queue-main">
        <h3>{item.title}</h3>
        <p>
          {item.project} <ChevronRight size={14} /> {item.channel}
        </p>
      </div>
      <div className="queue-meta">
        <StatusChip status={item.status} />
        <span>{Math.round(item.confidence * 100)}%</span>
      </div>
    </article>
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

function AgentStatusChip({ status }: { status: AgentStatus }) {
  const Icon = agentStatusIcon(status)
  return (
    <span className={`status-chip agent-${status}`}>
      <Icon size={14} />
      {status}
    </span>
  )
}

function MetricGrid({ run }: { run: AgencyRun }) {
  const totalCost = run.agents.reduce((sum, agent) => sum + (agent.costUsd ?? 0), 0)
  const totalTokens = run.agents.reduce((sum, agent) => sum + (agent.tokens ?? 0), 0)
  const totalLatency = run.agents.reduce((sum, agent) => sum + (agent.latencyMs ?? 0), 0)
  const passed = run.agents.filter((agent) => agent.status === "passed").length

  return (
    <div className="metric-grid">
      <Metric icon={Bot} label="Agents" value={`${run.agents.length}`} detail={`${passed} passed`} />
      <Metric icon={Coins} label="Cost" value={`$${totalCost.toFixed(2)}`} detail={`${totalTokens.toLocaleString()} tokens`} />
      <Metric icon={Timer} label="Latency" value={formatLatency(totalLatency)} detail="summed steps" />
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
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  )
}

function VetoCountdown({ vetoEndsAt, status }: { vetoEndsAt?: string; status: RunStatus }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (status !== "veto_window") return

    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [status, vetoEndsAt])

  const remaining = formatRemaining(vetoEndsAt, now)

  return (
    <div className="veto-box">
      <div>
        <span className="veto-icon">
          <Timer size={18} />
        </span>
      </div>
      <div>
        <p className="eyebrow">Veto window</p>
        <strong>{status === "veto_window" ? remaining : "Inactive"}</strong>
        <span>Edit, delay, block, or let the job publish.</span>
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
        <span>
          <strong>{agent.role}</strong>
          <small>{agent.objective}</small>
        </span>
        <AgentStatusChip status={agent.status} />
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
          {formatLatency(agent.latencyMs ?? 0)}
        </span>
        <span>
          <Coins size={15} />${(agent.costUsd ?? 0).toFixed(2)}
        </span>
        <span>
          <Gauge size={15} />
          {(agent.tokens ?? 0).toLocaleString()} tok
        </span>
      </div>
      <div className="drawer-output">
        <strong>Output</strong>
        <p>{agent.output ?? "No output recorded yet."}</p>
      </div>
      <div className="mini-events">
        {agentEvents.map((event) => (
          <div key={event.id}>
            <span>{formatTime(event.at)}</span>
            <strong>{event.title}</strong>
            <p>{event.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EvidenceList({ run }: { run: AgencyRun }) {
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

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="key-value">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  )
}

function ControlButton({ icon: Icon, label }: { icon: typeof Activity; label: string }) {
  return (
    <button className="control-button" type="button">
      <Icon size={17} />
      <span>{label}</span>
    </button>
  )
}

function Timeline({ events, agents }: { events: TraceEvent[]; agents: AgentNode[] }) {
  return (
    <div className="timeline">
      {events.map((event) => {
        const agent = agents.find((item) => item.id === event.agentId)
        return (
          <article className="timeline-row" key={event.id}>
            <div className="timeline-time">{formatTime(event.at)}</div>
            <div className="timeline-marker" />
            <div>
              <span>{event.type}</span>
              <h3>{event.title}</h3>
              <p>{event.detail}</p>
              <small>{agent?.role ?? event.agentId}</small>
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
  }
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatLatency(value: number) {
  if (value < 1000) return `${value}ms`
  if (value < 60000) return `${(value / 1000).toFixed(1)}s`
  return `${Math.round(value / 60000)}m ${Math.round((value % 60000) / 1000)}s`
}

function formatRemaining(value: string | undefined, now: number) {
  if (!value) return "No window"

  const ms = new Date(value).getTime() - now
  if (ms <= 0) return "Ready to publish"

  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`
}
