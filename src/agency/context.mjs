import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

const PREFERRED_DOCS = [
  "README.md",
  "docs/product-concept.md",
  "docs/architecture.md",
  "docs/two-hour-mvp-roadmap.md",
  "docs/browser-x-executor.md",
]

const IGNORED_DIRS = new Set([".git", "node_modules", ".pnpm-store", "dist"])

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

function readPackage(rootDir) {
  try {
    return JSON.parse(readIfExists(path.join(rootDir, "package.json")))
  } catch {
    return {}
  }
}

function normalizeRepositoryUrl(remoteUrl) {
  const value = remoteUrl.trim()
  if (!value) return undefined
  const sshMatch = value.match(/^git@([^:]+):(.+?)(?:\.git)?$/)
  if (sshMatch) return `https://${sshMatch[1]}/${sshMatch[2]}`
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value.replace(/\.git$/, "")
  }
  return undefined
}

function projectName(rootDir) {
  const pkg = readPackage(rootDir)
  if (typeof pkg.name === "string" && pkg.name.trim()) return pkg.name
  return path.basename(rootDir) || "project"
}

function projectDescription(rootDir) {
  const pkg = readPackage(rootDir)
  if (typeof pkg.description === "string" && pkg.description.trim()) return pkg.description.trim()
  const readme = firstNonEmptyLines(readIfExists(path.join(rootDir, "README.md")), 3)
  return readme || "No project description found."
}

function docEvidence(rootDir, sourceFiles) {
  const markdownDocs = sourceFiles
    .filter((file) => file.toLowerCase().endsWith(".md"))
    .filter((file) => file === "README.md" || file.startsWith("docs/"))
  const candidates = [...new Set([...PREFERRED_DOCS, ...markdownDocs])].slice(0, 8)

  return candidates.map((relativePath, index) => {
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

function buildContextReferences({ project, description, docs, gitLog, gitStatus, sourceFiles, objective }) {
  const primaryDoc = docs[0]?.detail || description
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
      source: docs[0]?.source ?? "package/readme",
      label: `${project} positioning and publishing policy`,
      digest: docs[0]?.digest ?? digest(description),
      excerpt: primaryDoc,
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
  const project = projectName(rootDir)
  const description = projectDescription(rootDir)
  const gitLog = git(rootDir, ["log", "--oneline", "--decorate", "-8"])
  const gitStatus = git(rootDir, ["status", "--short"])
  const diffStat = git(rootDir, ["diff", "--stat"])
  const repositoryUrl = normalizeRepositoryUrl(git(rootDir, ["remote", "get-url", "origin"]))
  const sourceFiles = walkFiles(rootDir)
  const docs = docEvidence(rootDir, sourceFiles)

  const contextReferences = buildContextReferences({
    project,
    description,
    docs,
    gitLog,
    gitStatus,
    sourceFiles,
    objective,
  })

  return {
    project,
    description,
    trigger,
    objective,
    gatheredAt: new Date().toISOString(),
    layers: {
      currentJob: {
        objective,
        trigger,
        repositoryUrl,
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
        motto: `Turn ${project} repository evidence into honest marketing material.`,
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
    repositoryUrl,
    contextReferences,
    evidence: docs.map(({ id, source, label, detail }) => ({ id, source, label, detail })),
  }
}
