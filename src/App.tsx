import { useEffect, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { OperatorConsole } from "./components/OperatorConsole"
import type { DashboardRun, ViewKey } from "./components/dashboard-data"

export default function App() {
  const run = useQuery(api.powerup.latestRun) as DashboardRun | null | undefined
  const [view, setView] = useState<ViewKey>("operations")
  const [selectedAgentId, setSelectedAgentId] = useState("")

  useEffect(() => {
    if (run && !run.agents.some((agent) => agent.id === selectedAgentId)) {
      setSelectedAgentId(run.agents[0]?.id ?? "")
    }
  }, [run, selectedAgentId])

  if (run === undefined) {
    return <ConvexUnavailable title="Connecting to Convex" detail="Loading the live source of truth." />
  }

  if (run === null) {
    return <ConvexUnavailable title="No Convex run yet" detail="Run pnpm agency:demo after configuring Convex." />
  }

  return (
    <OperatorConsole
      dataSource="convex"
      onSelectAgent={setSelectedAgentId}
      onViewChange={setView}
      run={run}
      selectedAgentId={selectedAgentId}
      view={view}
    />
  )
}

function ConvexUnavailable({ title, detail }: { title: string; detail: string }) {
  return (
    <main className="unavailable-shell">
      <section className="panel unavailable-panel">
        <p className="eyebrow">Convex source of truth</p>
        <h1>{title}</h1>
        <p>{detail}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </section>
    </main>
  )
}
