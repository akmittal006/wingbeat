import type { AgencyRun, PublishReceipt } from "../types"

export function getVerifiedReceipt(run: Pick<AgencyRun, "receipts">): PublishReceipt | undefined {
  return run.receipts?.find((receipt) => receipt.status === "verified")
}

export function getReceiptUrl(run: Pick<AgencyRun, "receipts">): string | undefined {
  return getVerifiedReceipt(run)?.url
}

export function isLivePublished(run: Pick<AgencyRun, "status" | "receipts">): boolean {
  return run.status === "published" && Boolean(getVerifiedReceipt(run))
}

export function hasPublishReceipt(run: Pick<AgencyRun, "receipts">): boolean {
  return Boolean(run.receipts?.length)
}

export function summarizeReceipt(receipt: PublishReceipt): string {
  if (receipt.status === "verified") {
    return `${receipt.channel.toUpperCase()} post ${receipt.postId ?? receipt.id} verified.`
  }

  if (receipt.status === "failed") {
    return receipt.error ?? "Publish failed before verification."
  }

  return "Publish is pending verification."
}
