import { useEffect, useState } from "react"
import { OperatorConsole } from "./components/OperatorConsole"
import { fallbackRun, type DashboardRun, type ViewKey } from "./components/dashboard-data"

type DataSource = "remote" | "fallback"

export default function App() {
  const [run, setRun] = useState<DashboardRun>(fallbackRun)
  const [view, setView] = useState<ViewKey>("operations")
  const [selectedAgentId, setSelectedAgentId] = useState(fallbackRun.agents[0]?.id ?? "")
  const [dataSource, setDataSource] = useState<DataSource>("fallback")

  useEffect(() => {
    let cancelled = false

    async function loadLatestRun() {
      try {
        const response = await fetch("/data/latest-run.json", { cache: "no-store" })
        if (!response.ok) return

        const latestRun = (await response.json()) as DashboardRun
        if (cancelled || !latestRun?.id || !latestRun.package || !Array.isArray(latestRun.agents)) {
          return
        }

        setRun(latestRun)
        setSelectedAgentId((current) =>
          latestRun.agents.some((agent) => agent.id === current)
            ? current
            : (latestRun.agents[0]?.id ?? ""),
        )
        setDataSource("remote")
      } catch {
        setDataSource("fallback")
      }
    }

    void loadLatestRun()
    const poll = window.setInterval(() => void loadLatestRun(), 3000)

    return () => {
      cancelled = true
      window.clearInterval(poll)
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
