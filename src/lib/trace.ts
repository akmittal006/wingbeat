import type { AgencyRun, AgentNode, RunTotals, TraceEvent, TraceTreeNode } from "../types"

export function getRunTotals(run: Pick<AgencyRun, "agents" | "events">): RunTotals {
  const fromAgents = run.agents.reduce(
    (totals, agent) => ({
      tokens: totals.tokens + (agent.tokens ?? 0),
      costUsd: totals.costUsd + (agent.costUsd ?? 0),
      latencyMs: totals.latencyMs + (agent.latencyMs ?? 0),
    }),
    { tokens: 0, costUsd: 0, latencyMs: 0 },
  )

  const fromEvents = run.events.reduce(
    (totals, event) => ({
      tokens: totals.tokens + (event.tokens ?? 0),
      costUsd: totals.costUsd + (event.costUsd ?? 0),
      latencyMs: totals.latencyMs + (event.latencyMs ?? 0),
    }),
    { tokens: 0, costUsd: 0, latencyMs: 0 },
  )

  return {
    tokens: fromAgents.tokens || fromEvents.tokens,
    costUsd: roundMoney(fromAgents.costUsd || fromEvents.costUsd),
    latencyMs: fromAgents.latencyMs || fromEvents.latencyMs,
    agentCount: run.agents.length,
    eventCount: run.events.length,
  }
}

export function buildTraceTree(run: Pick<AgencyRun, "agents" | "events">): TraceTreeNode[] {
  const childrenByParent = groupBy(run.agents, (agent) => agent.parentId ?? "root")
  const eventsByAgent = groupBy(run.events, (event) => event.agentId ?? "run")

  function build(agent: AgentNode): TraceTreeNode {
    const children = (childrenByParent.get(agent.id) ?? []).map(build)
    const childTotals = children.reduce(
      (totals, child) => addTotals(totals, child.totals),
      emptyTotals(),
    )
    const ownTotals = {
      tokens: agent.tokens ?? 0,
      costUsd: agent.costUsd ?? 0,
      latencyMs: agent.latencyMs ?? 0,
      agentCount: 1,
      eventCount: eventsByAgent.get(agent.id)?.length ?? 0,
    }

    return {
      agent,
      children,
      events: eventsByAgent.get(agent.id) ?? [],
      totals: addTotals(ownTotals, childTotals),
    }
  }

  return (childrenByParent.get("root") ?? []).map(build)
}

export function flattenTraceTree(nodes: TraceTreeNode[]): TraceTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenTraceTree(node.children)])
}

export function findTracePath(nodes: TraceTreeNode[], agentId: string): TraceTreeNode[] {
  for (const node of nodes) {
    if (node.agent.id === agentId) return [node]

    const childPath = findTracePath(node.children, agentId)
    if (childPath.length > 0) return [node, ...childPath]
  }

  return []
}

export function getEventsForAgent(run: Pick<AgencyRun, "events">, agentId: string): TraceEvent[] {
  return run.events.filter((event) => event.agentId === agentId)
}

function emptyTotals(): RunTotals {
  return { tokens: 0, costUsd: 0, latencyMs: 0, agentCount: 0, eventCount: 0 }
}

function addTotals(left: RunTotals, right: RunTotals): RunTotals {
  return {
    tokens: left.tokens + right.tokens,
    costUsd: roundMoney(left.costUsd + right.costUsd),
    latencyMs: left.latencyMs + right.latencyMs,
    agentCount: left.agentCount + right.agentCount,
    eventCount: left.eventCount + right.eventCount,
  }
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
  return items.reduce((groups, item) => {
    const key = getKey(item)
    groups.set(key, [...(groups.get(key) ?? []), item])
    return groups
  }, new Map<string, T[]>())
}

function roundMoney(value: number): number {
  return Math.round(value * 10000) / 10000
}
