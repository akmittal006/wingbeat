// Secret redaction for untrusted chat-log excerpts.
//
// Chat logs are UNTRUSTED DATA. Before any excerpt is allowed to leave this
// process (into a candidate digest, a curator prompt, or a Convex document) it
// passes through redact(). We strip anything that looks like a credential so
// secrets never reach Convex, logs, or a model prompt.
//
// This is deliberately conservative: it over-redacts rather than risk leaking a
// token. Redaction is irreversible for our purposes — the placeholder carries
// no recoverable information.

const REDACTION = "[REDACTED]"

// Ordered list of patterns. Each replaces the sensitive span with REDACTION.
const PATTERNS = [
  // key/token/password style assignments: FOO_TOKEN=..., "apiKey": "...", secret: '...'
  {
    name: "assignment",
    re: /\b([A-Za-z0-9_.-]*(?:key|token|secret|password|passwd|pwd|auth|bearer|credential|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret|deploy[_-]?key)[A-Za-z0-9_.-]*)\b(\s*[:=]\s*)(["']?)([^\s"'`,;]{6,})\3/gi,
    replace: (_m, k, sep, q) => `${k}${sep}${q}${REDACTION}${q}`,
  },
  // Authorization: Bearer <token>
  { name: "bearer", re: /\b(Authorization\s*:\s*Bearer\s+)[A-Za-z0-9._~+/-]{8,}=*/gi, replace: (_m, p) => `${p}${REDACTION}` },
  // Common vendor token shapes
  { name: "openai", re: /\bsk-[A-Za-z0-9_-]{16,}\b/g, replace: () => REDACTION },
  { name: "anthropic", re: /\bsk-ant-[A-Za-z0-9_-]{16,}\b/g, replace: () => REDACTION },
  { name: "github", re: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, replace: () => REDACTION },
  { name: "slack", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, replace: () => REDACTION },
  { name: "aws", re: /\bAKIA[0-9A-Z]{16}\b/g, replace: () => REDACTION },
  { name: "google", re: /\bAIza[0-9A-Za-z_-]{30,}\b/g, replace: () => REDACTION },
  { name: "convex-deploy", re: /\b(?:dev|prod):[a-z-]+\|[A-Za-z0-9]{20,}\b/g, replace: () => REDACTION },
  // JWT-ish triples
  { name: "jwt", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, replace: () => REDACTION },
  // Long hex blobs (>=32) often are secrets/hashes
  { name: "hex", re: /\b[0-9a-fA-F]{32,}\b/g, replace: () => REDACTION },
]

/**
 * Redact secret-looking spans from an untrusted string.
 * @param {string} input
 * @returns {string}
 */
export function redact(input) {
  if (typeof input !== "string" || input.length === 0) return input ?? ""
  let out = input
  for (const p of PATTERNS) {
    out = out.replace(p.re, p.replace)
  }
  return out
}

/**
 * True if redaction changed the string (a secret was present).
 * @param {string} input
 */
export function containedSecret(input) {
  return redact(input) !== input
}
