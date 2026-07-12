import { useState } from "react"
import type { AgentNode, TraceEvent } from "../../types"
import { Pill, isRunLive } from "./shared"
import { Overview } from "./Overview"
import { Agents } from "./Agents"
import { Pipeline } from "./Pipeline"
import { Catalog } from "./Catalog"

export type TabKey = "overview" | "agents" | "pipeline" | "catalog"

export interface ConsoleRun {
  id: string
  status: string
  agents: AgentNode[]
  events: TraceEvent[]
}

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "agents", label: "Agents" },
  { key: "pipeline", label: "Pipeline" },
  { key: "catalog", label: "Catalog" },
]

export function OpsCenter({ run }: { run: ConsoleRun | null }) {
  const [tab, setTab] = useState<TabKey>("overview")
  const live = isRunLive(run?.status)

  return (
    <div className="ops-shell">
      <header className="ops-header">
        <div className="ops-brand">
          <span className="wordmark">Wingbeat</span>
          <Pill tone={live ? "green" : "neutral"} dot={live}>
            {live ? "Agency active" : "Agency idle"}
          </Pill>
        </div>
        <nav className="ops-tabs">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={tab === key ? "ops-tab active" : "ops-tab"}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="ops-main">
        {tab === "overview" && <Overview onReview={() => setTab("pipeline")} />}
        {tab === "agents" && <Agents run={run} />}
        {tab === "pipeline" && <Pipeline />}
        {tab === "catalog" && <Catalog />}
      </main>
    </div>
  )
}
