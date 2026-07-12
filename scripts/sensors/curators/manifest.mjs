// CURATOR (manifest): validate a curated-opportunities file against real
// candidates and pass through ONLY entries that trace to a real excerpt.
//
// The manifest is produced by an external intelligent agent (a human editor or
// a model applying the editorial rubric). This module is the trust boundary: it
// refuses to emit anything it cannot tie back to a real candidate moment, so no
// fabricated or hallucinated opportunity can reach Convex. There is deliberately
// NO dumb-parser fallback — if the manifest is missing or invalid, curation
// fails; it never degrades into "parse every session into a row".
//
// Manifest file shape (JSON):
//   {
//     "generatedBy": "string (who/what applied the rubric)",
//     "rubricVersion": "string",
//     "opportunities": [
//       {
//         "sessionRef":  "codex:<id>@L<n>",   // MUST match a candidate
//         "description": "editorial line for an indie-dev audience",
//         "evidenceQuote": "verbatim span that appears in that candidate excerpt"
//       }
//     ]
//   }

import { readFile } from "node:fs/promises"

export const name = "manifest"

export const HARD_CAP = 5

function normalize(s) {
  return String(s ?? "").replace(/\s+/g, " ").trim().toLowerCase()
}

/**
 * @param {object[]} candidates from the source adapter
 * @param {{ manifestPath: string }} options
 * @returns {Promise<{ survivors: object[], meta: object }>}
 */
export async function curate(candidates, options = {}) {
  if (!options.manifestPath) {
    throw new Error("manifest curator requires options.manifestPath (the curated JSON file). No fallback exists.")
  }
  let parsed
  try {
    parsed = JSON.parse(await readFile(options.manifestPath, "utf8"))
  } catch (err) {
    throw new Error(
      `manifest curator: could not read/parse manifest at ${options.manifestPath}: ${err.message}. ` +
        `Refusing to emit anything (no dumb-parser fallback).`,
    )
  }

  const entries = parsed?.opportunities
  if (!Array.isArray(entries)) {
    throw new Error("manifest curator: manifest.opportunities must be an array.")
  }

  const byRef = new Map(candidates.map((c) => [c.sessionRef, c]))
  const survivors = []
  const rejected = []

  for (const [i, entry] of entries.entries()) {
    const where = `opportunities[${i}]`
    if (!entry || typeof entry !== "object") throw new Error(`manifest curator: ${where} is not an object.`)
    const { sessionRef, description, evidenceQuote } = entry
    if (typeof sessionRef !== "string" || !sessionRef) throw new Error(`manifest curator: ${where}.sessionRef missing.`)
    if (typeof description !== "string" || description.trim().length < 10)
      throw new Error(`manifest curator: ${where}.description missing or too short.`)
    if (typeof evidenceQuote !== "string" || evidenceQuote.trim().length < 8)
      throw new Error(`manifest curator: ${where}.evidenceQuote missing or too short.`)

    const candidate = byRef.get(sessionRef)
    if (!candidate) {
      // A manifest entry that points at no real candidate is a fabrication signal.
      throw new Error(
        `manifest curator: ${where}.sessionRef "${sessionRef}" does not match any real candidate. ` +
          `Every opportunity must trace to a real excerpt.`,
      )
    }
    // The quoted evidence must actually appear in the candidate excerpt.
    if (!normalize(candidate.excerpt).includes(normalize(evidenceQuote))) {
      throw new Error(
        `manifest curator: ${where}.evidenceQuote is not a verbatim span of candidate ${sessionRef}. ` +
          `Refusing to write unverifiable evidence.`,
      )
    }

    survivors.push({
      description: description.trim(),
      // Evidence sent to Convex is the REAL candidate excerpt + its sessionRef,
      // not the (shorter) quote — full provenance, already redacted by the adapter.
      evidence: candidate.excerpt,
      sessionRef: candidate.sessionRef,
      sessionFile: candidate.sessionFile,
      kindHints: candidate.kindHints,
    })
  }

  if (survivors.length > HARD_CAP) {
    // Hard cap is a safety rail against re-flooding; a compliant manifest should
    // already be within it, so exceeding it is an error, not a silent trim.
    throw new Error(
      `manifest curator: ${survivors.length} validated entries exceed HARD_CAP=${HARD_CAP}. ` +
        `Tighten the manifest; refusing to flood the inbox.`,
    )
  }

  return {
    survivors,
    meta: {
      curator: name,
      generatedBy: parsed.generatedBy ?? "unknown",
      rubricVersion: parsed.rubricVersion ?? "unknown",
      candidateCount: candidates.length,
      survivorCount: survivors.length,
      rejected,
    },
  }
}
