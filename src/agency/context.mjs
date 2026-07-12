import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

const DOCS = [
  "docs/product-concept.md",
  "docs/two-hour-mvp-roadmap.md",
  "docs/browser-x-executor.md",
]

const IGNORED_DIRS = new Set([".git", "node_modules", ".pnpm-store", "dist", "src/agency/runs"])

function readIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8")
  } catch {
    return ""
  }
}

function digest(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 10)
}

function git(rootDir, args) {
  try {
    return execFileSync("git", args, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
  } catch {
    return ""
  }
}

function firstNonEmptyLines(value, limit = 4) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("```"))
    .slice(0, limit)
    .join(" ")
}

function walkFiles(rootDir, current = rootDir, files = []) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const filePath = path.join(current, entry.name)
    const relative = path.relative(rootDir, filePath)
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(relative) && !IGNORED_DIRS.has(entry.name)) {
        walkFiles(rootDir, filePath, files)
      }
    } else {
      files.push(relative)
    }
  }
  return files
}

function readPackageName(rootDir) {
  try {
    const pkg = JSON.parse(readIfExists(path.join(rootDir, "package.json")))
    return typeof pkg.name === "string" ? pkg.name : "wingbeat"
  } catch {
    return "wingbeat"
  }
}

function docEvidence(rootDir) {
  return DOCS.map((relativePath, index) => {
    const absolutePath = path.join(rootDir, relativePath)
    const content = readIfExists(absolutePath)
    if (!content) return undefined
    return {
      id: `evidence-doc-${index + 1}`,
      source: relativePath,
      label: path.basename(relativePath),
      detail: firstNonEmptyLines(content, 5),
      digest: digest(content),
    }
  }).filter(Boolean)
}

function buildContextReferences({ docs, gitLog, gitStatus, sourceFiles, objective }) {
  return [
    {
      id: "ctx-current-job",
      layer: "current_job",
      source: "cli",
      label: "Current agency objective",
      digest: digest(objective),
      excerpt: objective,
    },
    {
      id: "ctx-project-history",
      layer: "project_history",
      source: "git log/status",
      label: "Recent repository movement",
      digest: digest(`${gitLog}\n${gitStatus}`),
      excerpt: [gitLog || "No committed history available.", gitStatus || "No dirty status reported."]
        .join(" ")
        .slice(0, 520),
    },
    {
      id: "ctx-brand-policy",
      layer: "brand_policy",
      source: "docs/product-concept.md",
      label: "Wingbeat product laws and publishing policy",
      digest: docs[0]?.digest ?? "missing",
      excerpt:
        "Break down every barrier preventing consistent marketing. Content must be source-backed, channel-independent, and published only through a vetoable execution contract.",
    },
    {
      id: "ctx-workspace-shape",
      layer: "current_job",
      source: "workspace file scan",
      label: "Implementation surface",
      digest: digest(sourceFiles.join("\n")),
      excerpt: sourceFiles.slice(0, 24).join(", "),
    },
  ]
}

export function collectProjectContext({ rootDir, trigger, objective }) {
  const project = readPackageName(rootDir)
  const docs = docEvidence(rootDir)
  const gitLog = git(rootDir, ["log", "--oneline", "--decorate", "-8"])
  const gitStatus = git(rootDir, ["status", "--short"])
  const diffStat = git(rootDir, ["diff", "--stat"])
  const sourceFiles = walkFiles(rootDir)

  const contextReferences = buildContextReferences({
    docs,
    gitLog,
    gitStatus,
    sourceFiles,
    objective,
  })

  return {
    project,
    trigger,
    objective,
    gatheredAt: new Date().toISOString(),
    layers: {
      currentJob: {
        objective,
        trigger,
        sourceFiles: sourceFiles.filter((file) => !file.startsWith("node_modules/")).slice(0, 60),
        dirtyFiles: gitStatus
          .split(/\r?\n/)
          .map((line) => line.replace(/^[ MADRCU?]{1,2}\s+/, "").trim())
          .filter(Boolean),
      },
      projectHistory: {
        recentCommits: gitLog,
        workingTree: gitStatus,
        diffStat,
        docs,
      },
      brandPolicy: {
        motto: "Break down every barrier preventing you from marketing consistently.",
        firstChannel: "x",
        contentCategory: "build-in-public",
        guardrails: [
          "Use only project-backed claims.",
          "Create a channel-independent canonical package before channel adaptation.",
          "Show the dynamic agency organization and handoffs.",
          "Preserve veto-window execution semantics.",
        ],
      },
    },
    contextReferences,
    evidence: docs.map(({ id, source, label, detail }) => ({ id, source, label, detail })),
  }
}
