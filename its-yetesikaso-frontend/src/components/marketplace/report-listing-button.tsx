"use client"

import { useState } from "react"

import {
  reportListing,
  type ListingReportReason,
} from "@/lib/api/reports"

type ReportListingButtonProps = {
  listingId: number
}

const REPORT_REASONS: {
  value: ListingReportReason
  label: string
}[] = [
  {
    value: "scam_fraud",
    label: "Scam / Fraud",
  },
  {
    value: "prohibited_item",
    label: "Prohibited Item",
  },
  {
    value: "spam",
    label: "Spam",
  },
  {
    value: "wrong_category",
    label: "Wrong Category",
  },
  {
    value: "duplicate",
    label: "Duplicate",
  },
  {
    value: "other",
    label: "Other",
  },
]

export default function ReportListingButton({
  listingId,
}: ReportListingButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] =
    useState<ListingReportReason | "">("")
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpen() {
    setOpen(true)
    setSuccess(false)
    setError(null)
  }

  function handleClose() {
    if (loading) return

    setOpen(false)
    setReason("")
    setDetails("")
    setError(null)
  }

  async function handleSubmit() {
    if (!reason) {
      setError("Please select a reason.")
      return
    }

    if (reason === "other" && !details.trim()) {
      setError("Please provide details for your report.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await reportListing(
        listingId,
        reason,
        details
      )

      setSuccess(true)
      setReason("")
      setDetails("")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit report"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full rounded-xl border border-[var(--border)] px-5 py-3 text-center font-medium transition hover:bg-[var(--background)]"
      >
        Report Listing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-listing-title"
            className="w-full max-w-md rounded-2xl bg-[var(--card)] p-6 shadow-xl"
          >
            {success ? (
              <div>
                <h2
                  id="report-listing-title"
                  className="text-xl font-semibold"
                >
                  Report submitted
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Thank you. Your report has been submitted
                  for moderation.
                </p>

                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-6 w-full rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="report-listing-title"
                      className="text-xl font-semibold"
                    >
                      Report Listing
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Tell us what is wrong with this listing.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    aria-label="Close"
                    className="text-2xl leading-none text-[var(--muted)] transition hover:text-[var(--foreground)] disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="report-reason"
                    className="mb-2 block text-sm font-medium"
                  >
                    Reason
                  </label>

                  <select
                    id="report-reason"
                    value={reason}
                    onChange={(event) =>
                      setReason(
                        event.target
                          .value as ListingReportReason | ""
                      )
                    }
                    disabled={loading}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-lime-400 disabled:opacity-50"
                  >
                    <option value="">
                      Select a reason
                    </option>

                    {REPORT_REASONS.map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {reason === "other" && (
                  <div className="mt-5">
                    <label
                      htmlFor="report-details"
                      className="mb-2 block text-sm font-medium"
                    >
                      Details
                    </label>

                    <textarea
                      id="report-details"
                      value={details}
                      onChange={(event) =>
                        setDetails(event.target.value)
                      }
                      disabled={loading}
                      maxLength={1000}
                      rows={4}
                      placeholder="Please explain the issue..."
                      className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-lime-400 disabled:opacity-50"
                    />

                    <p className="mt-1 text-right text-xs text-[var(--muted)]">
                      {details.length}/1000
                    </p>
                  </div>
                )}

                {error && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 font-medium transition hover:bg-[var(--background)] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-lime-400 px-4 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Submitting..."
                      : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}