function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function hasGeneratedAsset(packageData: any, assetId?: string) {
  const assets = Array.isArray(packageData?.generatedAssets) ? packageData.generatedAssets : []
  return assets.some((asset: any) => {
    const idMatches = !assetId || asset.id === assetId
    return idMatches && hasText(asset.url) && hasText(asset.digest) && ["ready", "rendered"].includes(asset.status)
  })
}

function assertOpportunity(name: string, value: any) {
  if (!value || typeof value !== "object") throw new Error(`${name} is required on every content package`)
  if (typeof value.recommended !== "boolean") throw new Error(`${name}.recommended must be boolean`)
  if (!hasText(value.reason)) throw new Error(`${name}.reason is required`)
  if (value.recommended === false && !hasText(value.noGoReason) && (!Array.isArray(value.blockers) || value.blockers.length === 0)) {
    throw new Error(`${name} rejected/no-go state requires noGoReason or blockers`)
  }
  if (!Array.isArray(value.evidenceIds) || value.evidenceIds.length === 0) {
    throw new Error(`${name}.evidenceIds must reference source evidence`)
  }
}

export function assertVisualVideoContract(packageData: any) {
  assertOpportunity("visualOpportunity", packageData?.visualOpportunity)
  assertOpportunity("demoVideoOpportunity", packageData?.demoVideoOpportunity)

  if (!Array.isArray(packageData.visualPlanningRubric) || packageData.visualPlanningRubric.length !== 9) {
    throw new Error("visualPlanningRubric must contain exactly 9 project inspection answers")
  }

  const visualBrief = packageData.visualBrief
  if (!visualBrief || !hasText(visualBrief.id) || !hasText(visualBrief.instructions)) {
    throw new Error("visualBrief with id and instructions is required")
  }

  const demoVideoPlan = packageData.demoVideoPlan
  if (!demoVideoPlan || !hasText(demoVideoPlan.id)) throw new Error("demoVideoPlan is required")
  if (typeof demoVideoPlan.durationSeconds !== "number" || demoVideoPlan.durationSeconds < 15 || demoVideoPlan.durationSeconds > 25) {
    throw new Error("demoVideoPlan.durationSeconds must be between 15 and 25")
  }
  if (!Array.isArray(demoVideoPlan.storyboard) || demoVideoPlan.storyboard.length === 0) {
    throw new Error("demoVideoPlan.storyboard is required")
  }
  if (!hasText(demoVideoPlan.audioPosture) || !hasText(demoVideoPlan.visualIdentity)) {
    throw new Error("demoVideoPlan requires audioPosture and visualIdentity")
  }

  const completedStates = new Set(["ready", "rendered", "completed"])
  if (completedStates.has(String(visualBrief.status)) && !hasGeneratedAsset(packageData)) {
    throw new Error("visualBrief cannot be ready/rendered/completed without generated asset url and digest")
  }
  if (completedStates.has(String(demoVideoPlan.status)) && !hasGeneratedAsset(packageData, demoVideoPlan.generatedAssetIds?.[0])) {
    throw new Error("demoVideoPlan cannot be ready/rendered/completed without generated video url and digest")
  }
  if (demoVideoPlan.rendererAvailable === false && completedStates.has(String(demoVideoPlan.status))) {
    throw new Error("demoVideoPlan cannot be completed when rendererAvailable is false")
  }
  if (demoVideoPlan.rendererAvailable === false && !hasText(demoVideoPlan.blockedReason)) {
    throw new Error("Unavailable renderer state requires blockedReason")
  }

  if (!Array.isArray(packageData.visualVideoQuality) || packageData.visualVideoQuality.length === 0) {
    throw new Error("visualVideoQuality evaluation is required")
  }
  if (!Array.isArray(packageData.executionReadyVariants) || packageData.executionReadyVariants.length === 0) {
    throw new Error("executionReadyVariants are required")
  }
  if (!packageData.xProseContract || !hasText(packageData.xProseContract.categoryId)) {
    throw new Error("xProseContract.categoryId is required")
  }
  if (packageData.category !== packageData.xProseContract.categoryId) {
    throw new Error("content package category must match xProseContract.categoryId")
  }
}
