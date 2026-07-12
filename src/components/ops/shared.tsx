import { ChevronDown } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}

export type Tone = "neutral" | "green" | "amber" | "red" | "blue"

export function Pill({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: Tone
  dot?: boolean
  children: ReactNode
}) {
  return (
    <span className={`pill pill-${tone}`}>
      {dot ? <span className="pill-dot" /> : null}
      {children}
    </span>
  )
}

export function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="empty-line">{children}</p>
}

export function Card({
  title,
  count,
  icon,
  children,
  className = "",
  collapsible = false,
  collapsed = false,
  onToggle,
}: {
  title: string
  count?: ReactNode
  icon?: ReactNode
  children: ReactNode
  className?: string
  collapsible?: boolean
  collapsed?: boolean
  onToggle?: () => void
}) {
  const heading = (
    <>
      <div className="card-head-left">
        {icon}
        <h3>
          {title}
          {count !== undefined ? <span className="card-count"> · {count}</span> : null}
        </h3>
      </div>
      {collapsible ? (
        <ChevronDown size={16} className={`card-chevron${collapsed ? "" : " open"}`} />
      ) : null}
    </>
  )

  return (
    <section className={`card ${className}`}>
      {collapsible ? (
        <button
          type="button"
          className="card-head card-head-toggle"
          aria-expanded={!collapsed}
          onClick={onToggle}
        >
          {heading}
        </button>
      ) : (
        <header className="card-head">{heading}</header>
      )}
      {collapsed ? null : <div className="card-body">{children}</div>}
    </section>
  )
}

// ---- formatting ------------------------------------------------------------

export function timeAgo(iso?: string, now = Date.now()): string {
  if (!iso) return "never"
  const ms = now - Date.parse(iso)
  if (Number.isNaN(ms)) return "never"
  if (ms < 0) return "just now"
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export function isStale(iso?: string, thresholdMs = 60 * 60 * 1000, now = Date.now()): boolean {
  if (!iso) return true
  const ms = now - Date.parse(iso)
  return Number.isNaN(ms) || ms > thresholdMs
}

export function clockTime(iso?: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(d)
}

export function countdown(vetoEndsAt: string | undefined, now: number): { label: string; expired: boolean } {
  if (!vetoEndsAt) return { label: "no window", expired: true }
  const ms = Date.parse(vetoEndsAt) - now
  if (Number.isNaN(ms)) return { label: "no window", expired: true }
  if (ms <= 0) return { label: "0:00", expired: true }
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return { label: `${m}:${String(s).padStart(2, "0")}`, expired: false }
}

export function ellipsize(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).trimEnd()}…`
}

export function sentenceCase(value: string): string {
  const spaced = value.replace(/[_-]+/g, " ").trim()
  if (!spaced) return spaced
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

// Honest "agency active" derivation: a run in a non-terminal state is live.
const TERMINAL = new Set(["published", "blocked", "failed"])
export function isRunLive(status?: string): boolean {
  return status !== undefined && !TERMINAL.has(status)
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "published":
    case "ready":
    case "passed":
      return "green"
    case "veto":
    case "veto_window":
    case "revising":
    case "in_review":
    case "overdue":
      return "amber"
    case "blocked":
    case "failed":
      return "red"
    case "running":
    case "working":
    case "queue":
    case "queued":
      return "blue"
    default:
      return "neutral"
  }
}
