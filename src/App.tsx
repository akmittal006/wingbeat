import { useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { OpsCenter, type ConsoleRun } from "./components/ops/OpsCenter"

export default function App() {
  const run = useQuery(api.powerup.latestRun) as
    | (ConsoleRun & Record<string, unknown>)
    | null
    | undefined

  if (run === undefined) {
    return <ConvexUnavailable title="Connecting to Convex" detail="Loading the live source of truth." />
  }

  const consoleRun: ConsoleRun | null = run
    ? { id: run.id, status: run.status, agents: run.agents ?? [], events: run.events ?? [] }
    : null

  return <OpsCenter run={consoleRun} />
}

function ConvexUnavailable({ title, detail }: { title: string; detail: string }) {
  return (
    <main className="unavailable-shell">
      <section className="unavailable-panel">
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
