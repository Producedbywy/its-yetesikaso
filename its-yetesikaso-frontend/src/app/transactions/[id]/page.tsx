"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"

import {
  cancelTransaction,
  completeTransaction,
  confirmTransaction,
  createReview,
  getTransaction,
  type Transaction,
} from "@/lib/api/transactions"

import { getMyProfile, type SellerProfile } from "@/lib/api/seller"

export default function TransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [transaction, setTransaction] =
    useState<Transaction | null>(null)

  const [profile, setProfile] =
    useState<SellerProfile | null>(null)

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [success, setSuccess] =
    useState<string | null>(null)

  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewSubmitted, setReviewSubmitted] =
    useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadTransaction() {
      try {
        setLoading(true)
        setError(null)

        const { id } = await params
        const transactionId = Number(id)

        if (!Number.isInteger(transactionId)) {
          throw new Error("Invalid transaction")
        }

        const [transactionResponse, profileResponse] =
          await Promise.all([
            getTransaction(transactionId),
            getMyProfile(),
          ])

        if (cancelled) return

        setTransaction(transactionResponse.transaction)
        setProfile(profileResponse)
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load transaction"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadTransaction()

    return () => {
      cancelled = true
    }
  }, [params])

  async function refreshTransaction() {
    if (!transaction) return

    const response = await getTransaction(transaction.id)
    setTransaction(response.transaction)
  }

  async function handleConfirm() {
    if (!transaction) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      await confirmTransaction(transaction.id)
      await refreshTransaction()

      setSuccess("Transaction confirmed successfully.")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to confirm transaction"
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function handleComplete() {
    if (!transaction) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      await completeTransaction(transaction.id)
      await refreshTransaction()

      setSuccess("Transaction completed successfully.")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete transaction"
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    if (!transaction) return

    const confirmed = window.confirm(
      "Are you sure you want to cancel this transaction?"
    )

    if (!confirmed) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      await cancelTransaction(transaction.id)
      await refreshTransaction()

      setSuccess("Transaction cancelled successfully.")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel transaction"
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReview(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!transaction) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      await createReview(
        transaction.id,
        reviewRating,
        reviewComment.trim()
      )

      setReviewSubmitted(true)
      setSuccess("Review submitted successfully.")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit review"
      )
    } finally {
      setActionLoading(false)
    }
  }

  const isBuyer =
    transaction &&
    profile &&
    transaction.buyer_username.toLowerCase() ===
      profile.username.toLowerCase()

  const isSeller =
    transaction &&
    profile &&
    transaction.seller_username.toLowerCase() ===
      profile.username.toLowerCase()

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />

        <Container>
          <div className="mx-auto max-w-3xl py-20">
            <div className="h-8 w-48 animate-pulse rounded bg-[var(--card)]" />
            <div className="mt-6 h-72 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
          </div>
        </Container>

        <Footer />
      </main>
    )
  }

  if (error && !transaction) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />

        <Container>
          <div className="mx-auto max-w-3xl py-20">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
              {error}
            </div>

            <Link
              href="/marketplace"
              className="mt-5 inline-block text-sm font-medium hover:text-lime-700"
            >
              ← Back to marketplace
            </Link>
          </div>
        </Container>

        <Footer />
      </main>
    )
  }

  if (!transaction) return null

  const statusLabel =
    transaction.status === "pending"
      ? "Pending"
      : transaction.status === "confirmed"
        ? "Confirmed"
        : transaction.status === "completed"
          ? "Completed"
          : "Cancelled"

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="mx-auto max-w-3xl py-10">
          <div className="mb-8">
            <Link
              href="/marketplace"
              className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              ← Back to marketplace
            </Link>

            <h1 className="mt-4 text-3xl font-bold">
              Transaction
            </h1>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Transaction #{transaction.id}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-lime-200 bg-lime-50 p-4 text-sm text-lime-800">
              {success}
            </div>
          )}

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--muted)]">
                  Status
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {statusLabel}
                </p>
              </div>

              <span className="rounded-full bg-[var(--background)] px-4 py-2 text-sm font-medium capitalize">
                {transaction.status}
              </span>
            </div>

            <div className="border-t border-[var(--border)] pt-6">
              <h2 className="text-lg font-semibold">
                {transaction.listing_title}
              </h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--muted)]">
                    Quantity
                  </span>

                  <span className="font-medium">
                    {transaction.quantity}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[var(--muted)]">
                    Unit price
                  </span>

                  <span className="font-medium">
                    GH₵{" "}
                    {Number(
                      transaction.unit_price
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-3">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-lg font-bold">
                    GH₵{" "}
                    {Number(
                      transaction.total_amount
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--muted)]">
                  Buyer
                </p>

                <p className="mt-1 font-medium">
                  {transaction.buyer_username}
                </p>
              </div>

              <div>
                <p className="text-sm text-[var(--muted)]">
                  Seller
                </p>

                <p className="mt-1 font-medium">
                  {transaction.seller_username}
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-[var(--border)] pt-6">
              <p className="text-sm text-[var(--muted)]">
                Created
              </p>

              <p className="mt-1 text-sm">
                {new Date(
                  transaction.created_at
                ).toLocaleString()}
              </p>

              {transaction.completed_at && (
                <div className="mt-3">
                  <p className="text-sm text-[var(--muted)]">
                    Completed
                  </p>

                  <p className="mt-1 text-sm">
                    {new Date(
                      transaction.completed_at
                    ).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {(isSeller || isBuyer) &&
              transaction.status === "pending" && (
                <div className="mt-7 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row">
                  {isSeller && (
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={actionLoading}
                      className="flex-1 rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading
                        ? "Processing..."
                        : "Confirm Transaction"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="flex-1 rounded-xl border border-[var(--border)] px-5 py-3 font-medium transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel Transaction
                  </button>
                </div>
              )}

            {isBuyer &&
              transaction.status === "confirmed" && (
                <div className="mt-7 border-t border-[var(--border)] pt-6">
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={actionLoading}
                    className="w-full rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Processing..."
                      : "Mark Transaction Complete"}
                  </button>

                  <p className="mt-2 text-center text-xs text-[var(--muted)]">
                    Only mark this complete once the transaction has been completed.
                  </p>
                </div>
              )}

            {isBuyer &&
              transaction.status === "completed" &&
              !reviewSubmitted && (
                <form
                  onSubmit={handleReview}
                  className="mt-7 border-t border-[var(--border)] pt-6"
                >
                  <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                      Review your purchase
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      This review is tied to your completed transaction.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="review-rating"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Rating
                    </label>

                    <select
                      id="review-rating"
                      value={reviewRating}
                      onChange={(event) =>
                        setReviewRating(
                          Number(event.target.value)
                        )
                      }
                      disabled={actionLoading}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none focus:border-lime-500 disabled:opacity-50"
                    >
                      <option value={5}>5 — Excellent</option>
                      <option value={4}>4 — Good</option>
                      <option value={3}>3 — Average</option>
                      <option value={2}>2 — Poor</option>
                      <option value={1}>1 — Very poor</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="review-comment"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Comment
                    </label>

                    <textarea
                      id="review-comment"
                      value={reviewComment}
                      onChange={(event) =>
                        setReviewComment(
                          event.target.value
                        )
                      }
                      disabled={actionLoading}
                      rows={4}
                      maxLength={1000}
                      placeholder="Share your experience with this seller."
                      className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none focus:border-lime-500 disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="mt-4 w-full rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </form>
              )}

            {isBuyer &&
              transaction.status === "completed" &&
              reviewSubmitted && (
                <div className="mt-7 border-t border-[var(--border)] pt-6">
                  <p className="font-semibold">
                    Review submitted
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Your verified purchase review has been recorded.
                  </p>
                </div>
              )}
          </div>
        </div>
      </Container>

      <Footer />
    </main>
  )
}