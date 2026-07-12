import assert from "node:assert/strict"
import { test } from "node:test"
import { runAgency } from "../src/agency/runtime.mjs"
import xProsePlaybook from "../src/data/x-prose-playbook.json" with { type: "json" }

const rootDir = new URL("..", import.meta.url).pathname

function assertNoCompletedAssetState(packageData) {
  const assets = packageData.generatedAssets ?? []
  const hasAsset = (assetId) =>
    assets.some((asset) => {
      const idMatches = !assetId || asset.id === assetId
      return idMatches && asset.url && asset.digest && ["ready", "rendered"].includes(asset.status)
    })

  if (["ready", "rendered", "completed"].includes(packageData.visualBrief.status) && !hasAsset()) {
    throw new Error("visualBrief cannot be completed without generated asset metadata")
  }
  if (
    ["ready", "rendered", "completed"].includes(packageData.demoVideoPlan.status) &&
    !hasAsset(packageData.demoVideoPlan.generatedAssetIds?.[0])
  ) {
    throw new Error("demoVideoPlan cannot be completed without generated video metadata")
  }
}

test("runtime emits Convex-ready visual and demo-video contract", async () => {
  const run = await runAgency({
    rootDir,
    trigger: "test-visual-contract",
    objective: "Market the Wingbeat repository itself with a build-in-public story.",
    useHermes: false,
  })

  const packageData = run.package

  assert.equal(packageData.visualPlanningRubric.length, 9)
  assert.equal(packageData.visualOpportunity.kind, "visual")
  assert.equal(packageData.visualOpportunity.recommended, true)
  assert.match(packageData.visualOpportunity.reason, /Real UI/)

  assert.equal(packageData.demoVideoOpportunity.kind, "demo-video")
  assert.equal(packageData.demoVideoOpportunity.recommended, true)
  assert.equal(packageData.demoVideoPlan.durationSeconds >= 15, true)
  assert.equal(packageData.demoVideoPlan.durationSeconds <= 25, true)
  assert.equal(packageData.demoVideoPlan.storyboard.length, 4)
  assert.equal(packageData.demoVideoPlan.storyboard[0].label, "Hook")

  assert.equal(packageData.demoVideoPlan.rendererAvailable, false)
  assert.equal(packageData.demoVideoPlan.status, "blocked")
  assert.equal(packageData.demoVideoPlan.rendererState, "blocked")
  assert.match(packageData.demoVideoPlan.blockedReason, /Hyperframes is not installed/)

  assert.deepEqual(packageData.generatedAssets, [])
  assert.equal(packageData.executionReadyVariants[0].channel, "x")
  assert.equal(xProsePlaybook.categories.some((category) => category.id === packageData.category), true)
  assert.equal(packageData.xProseContract.playbookVersion, xProsePlaybook.version)
  assert.equal(packageData.xProseContract.categoryId, packageData.category)
  assert.equal(xProsePlaybook.categories.length, 17)
  assert.equal(packageData.visualVideoQuality.length >= 4, true)
  assertNoCompletedAssetState(packageData)
})

test("completed visual or video states require real generated asset metadata", async () => {
  const run = await runAgency({
    rootDir,
    trigger: "test-invalid-render-state",
    objective: "Market the Wingbeat repository itself with a build-in-public story.",
    useHermes: false,
  })

  const invalidPackage = structuredClone(run.package)
  invalidPackage.demoVideoPlan.status = "rendered"
  invalidPackage.demoVideoPlan.rendererAvailable = false
  invalidPackage.demoVideoPlan.generatedAssetIds = ["missing-video"]
  invalidPackage.generatedAssets = []

  assert.throws(() => assertNoCompletedAssetState(invalidPackage), /demoVideoPlan cannot be completed/)
})
