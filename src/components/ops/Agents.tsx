import { useLayoutEffect, useRef, useState } from "react"
import { Bot, Coins, Gauge, Timer } from "lucide-react"
import type { AgentNode, TraceEvent } from "../../types"
import { EmptyLine, Pill, clockTime, isRunLive, statusTone } from "./shared"

interface RunLike {
  id: string
  status: string
  agents: AgentNode[]
  events: TraceEvent[]
}

interface Edge {
  x1: number
  y1: number
  x2: number
  y2: number
}

export function Agents({ run }: { run: RunLike | null }) {
  const [selectedId, setSelectedId] = useState<string>("")

  if (!run || run.agents.length === 0) {
    return <EmptyLine>No agent run recorded yet</EmptyLine>
  }

  const live = isRunLive(run.status)
  const selected = run.agents.find((a) => a.id === selectedId) ?? run.agents[0]

  return (
    <div className="agents-tab">
      <div className="agents-head">
        <div className="agents-head-left">
          <Bot size={15} />
          <span>{live ? "Live run" : "Last run"} · {run.id}</span>
        </div>
        <Pill tone={live ? "blue" : "neutral"} dot={live}>
          {live ? "running" : "idle"}
        </Pill>
      </div>

      <Dag agents={run.agents} muted={!live} selectedId={selected.id} onSelect={setSelectedId} />

      <AgentDetail agent={selected} events={run.events} />
    </div>
  )
}

function computeDepths(agents: AgentNode[]): Map<string, number> {
  const byId = new Map(agents.map((a) => [a.id, a]))
  const depths = new Map<string, number>()
  const resolve = (id: string, seen: Set<string>): number => {
    if (depths.has(id)) return depths.get(id) as number
    const agent = byId.get(id)
    if (!agent || !agent.parentId || seen.has(id) || !byId.has(agent.parentId)) {
      depths.set(id, 0)
      return 0
    }
    seen.add(id)
    const d = resolve(agent.parentId, seen) + 1
    depths.set(id, d)
    return d
  }
  for (const agent of agents) resolve(agent.id, new Set())
  return depths
}

function Dag({
  agents,
  muted,
  selectedId,
  onSelect,
}: {
  agents: AgentNode[]
  muted: boolean
  selectedId: string
  onSelect: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [edges, setEdges] = useState<Edge[]>([])

  const depths = computeDepths(agents)
  const maxDepth = Math.max(0, ...Array.from(depths.values()))
  const columns: AgentNode[][] = Array.from({ length: maxDepth + 1 }, () => [])
  for (const agent of agents) columns[depths.get(agent.id) ?? 0].push(agent)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const recompute = () => {
      const base = container.getBoundingClientRect()
      const next: Edge[] = []
      for (const agent of agents) {
        if (!agent.parentId) continue
        const childEl = nodeRefs.current.get(agent.id)
        const parentEl = nodeRefs.current.get(agent.parentId)
        if (!childEl || !parentEl) continue
        const c = childEl.getBoundingClientRect()
        const p = parentEl.getBoundingClientRect()
        next.push({
          x1: p.right - base.left,
          y1: p.top - base.top + p.height / 2,
          x2: c.left - base.left,
          y2: c.top - base.top + c.height / 2,
        })
      }
      setEdges(next)
    }
    recompute()
    const observer = new ResizeObserver(recompute)
    observer.observe(container)
    window.addEventListener("resize", recompute)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", recompute)
    }
  }, [agents, selectedId])

  return (
    <div className={muted ? "dag muted" : "dag"} ref={containerRef}>
      <svg className="dag-edges" aria-hidden="true">
        {edges.map((edge, index) => (
          <path
            key={index}
            className="dag-edge"
            d={`M ${edge.x1} ${edge.y1} C ${edge.x1 + 24} ${edge.y1}, ${edge.x2 - 24} ${edge.y2}, ${edge.x2} ${edge.y2}`}
          />
        ))}
      </svg>
      <div className="dag-columns">
        {columns.map((column, depth) => (
          <div className="dag-column" key={depth}>
            {column.map((agent) => (
              <button
                key={agent.id}
                type="button"
                ref={(el) => {
                  if (el) nodeRefs.current.set(agent.id, el)
                  else nodeRefs.current.delete(agent.id)
                }}
                className={`dag-node tone-${statusTone(agent.status)} ${
                  agent.id === selectedId ? "selected" : ""
                }`}
                onClick={() => onSelect(agent.id)}
              >
                <span className="dag-node-role">{agent.role}</span>
                <span className="dag-node-status">{agent.status}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentDetail({ agent, events }: { agent: AgentNode; events: TraceEvent[] }) {
  const agentEvents = events.filter((event) => event.agentId === agent.id)
  return (
    <section className="agent-detail">
      <header className="agent-detail-head">
        <div>
          <h3>{agent.role}</h3>
          <p>{agent.objective}</p>
        </div>
        <Pill tone={statusTone(agent.status)}>{agent.status}</Pill>
      </header>

      <div className="agent-stats">
        <span>
          <Timer size={13} /> {fmtLatency(agent.latencyMs)}
        </span>
        <span>
          <Coins size={13} /> {fmtMoney(agent.costUsd)}
        </span>
        <span>
          <Gauge size={13} /> {fmtTokens(agent.tokens)}
        </span>
      </div>

      {agent.output ? (
        <div className="agent-output">
          <span className="agent-output-label">Output</span>
          <p>{agent.output}</p>
        </div>
      ) : null}

      <div className="agent-events">
        <span className="agent-output-label">Trace events</span>
        {agentEvents.length === 0 ? (
          <EmptyLine>No trace events recorded for this agent</EmptyLine>
        ) : (
          <ul className="agent-event-list">
            {agentEvents.map((event) => (
              <li key={event.id}>
                <span className="agent-event-time">{clockTime(event.at)}</span>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function fmtLatency(value?: number): string {
  if (typeof value !== "number") return "— latency"
  if (value < 1000) return `${value}ms`
  if (value < 60000) return `${(value / 1000).toFixed(1)}s`
  return `${Math.round(value / 60000)}m ${Math.round((value % 60000) / 1000)}s`
}

function fmtMoney(value?: number): string {
  if (typeof value !== "number") return "— cost"
  return `$${value.toFixed(value < 0.01 ? 4 : 2)}`
}

function fmtTokens(value?: number): string {
  if (typeof value !== "number") return "— tokens"
  return `${value.toLocaleString()} tokens`
}
