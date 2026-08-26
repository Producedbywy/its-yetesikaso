import { apiClient } from "@/lib/api/client"

export type ListingReportReason =
  | "scam_fraud"
  | "prohibited_item"
  | "spam"
  | "wrong_category"
  | "duplicate"
  | "other"

export type ReportListingResponse = {
  message: string
  report: {
    id: number
    listing: number
    reason: ListingReportReason
    details: string
    created_at: string
  }
}

export async function reportListing(
  listingId: number,
  reason: ListingReportReason,
  details?: string
): Promise<ReportListingResponse> {
  return apiClient<ReportListingResponse>(
    `/listings/${listingId}/report/`,
    {
      method: "POST",
      body: JSON.stringify({
        reason,
        details: details?.trim() || "",
      }),
    }
  )
}