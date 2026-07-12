import type { ContextEnvelope, MemoryLayer, MemoryReference } from "../types"

export function createContextEnvelope(references: MemoryReference[]): ContextEnvelope {
  return {
    currentJob: references.filter((reference) => reference.layer === "current_job"),
    projectHistory: references.filter((reference) => reference.layer === "project_history"),
    brandPolicy: references.filter((reference) => reference.layer === "brand_policy"),
  }
}

export function getMemoryLayerLabel(layer: MemoryLayer): string {
  if (layer === "current_job") return "Current job"
  if (layer === "project_history") return "Project history"
  return "Brand and publishing policy"
}

export function summarizeContextEnvelope(envelope: ContextEnvelope): string[] {
  return [
    `${envelope.currentJob.length} current-job refs`,
    `${envelope.projectHistory.length} project-history refs`,
    `${envelope.brandPolicy.length} brand-policy refs`,
  ]
}
