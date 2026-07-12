import { useEffect, useState } from "react"
import { OperatorConsole } from "./components/OperatorConsole"
import { fallbackRun, type ViewKey } from "./components/dashboard-data"
import type { AgencyRun } from "./types"

type DataSource = "remote" | "fallback"

export default function App() {
  const [run, setRun] = useState<AgencyRun>(fallbackRun)
  const [view, setView] = useState<ViewKey>("operations")
  const [selectedAgentId, setSelectedAgentId] = useState(fallbackRun.agents[0]?.id ?? "")
  const [dataSource, setDataSource] = useState<DataSource>("fallback")

  useEffect(() => {
    let cancelled = false

    async function loadLatestRun() {
      try {
        const response = await fetch("/data/latest-run.json", { cache: "no-store" })
        if (!response.ok) return

        const latestRun = (await response.json()) as AgencyRun
        if (cancelled || !latestRun?.id || !latestRun.package || !Array.isArray(latestRun.agents)) {
          return
        }

        setRun(latestRun)
        setSelectedAgentId(latestRun.agents[0]?.id ?? "")
        setDataSource("remote")
      } catch {
        setDataSource("fallback")
      }
    }

    void loadLatestRun()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!run.agents.some((agent) => agent.id === selectedAgentId)) {
      setSelectedAgentId(run.agents[0]?.id ?? "")
    }
  }, [run, selectedAgentId])

  return (
    <OperatorConsole
      dataSource={dataSource}
      onSelectAgent={setSelectedAgentId}
      onViewChange={setView}
      run={run}
      selectedAgentId={selectedAgentId}
      view={view}
    />
  )
}
