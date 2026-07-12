import fs from "node:fs"
import path from "node:path"

function writeJsonAtomic(filePath, value) {
  const tmpPath = `${filePath}.${process.pid}.tmp`
  fs.writeFileSync(tmpPath, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(tmpPath, filePath)
}

export function runsDir(rootDir) {
  return path.join(rootDir, "src", "agency", "runs")
}

export function persistRun(rootDir, run) {
  const directory = runsDir(rootDir)
  const publicDataDirectory = path.join(rootDir, "public", "data")
  fs.mkdirSync(directory, { recursive: true })
  fs.mkdirSync(publicDataDirectory, { recursive: true })

  const runPath = path.join(directory, `${run.id}.json`)
  const latestPath = path.join(directory, "latest.json")
  const publicLatestPath = path.join(publicDataDirectory, "latest-run.json")

  writeJsonAtomic(runPath, run)
  writeJsonAtomic(latestPath, run)
  writeJsonAtomic(publicLatestPath, run)

  return { runPath, latestPath, publicLatestPath }
}
