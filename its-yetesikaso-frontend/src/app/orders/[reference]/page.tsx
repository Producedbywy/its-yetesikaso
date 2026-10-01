"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"
import {
  confirmDelivery,
  getOrder,
  type Order,
} from "@/lib/api/orders"
import { createOrderItemReview } from "@/lib/api/orders"

function formatAmount(amount: string) {
  return `GHS ${Number(amount).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getPaymentStatusLabel(status: Order["payment_status"]) {
  switch (status) {
    case "paid":
      return "Paid"
    case "failed":
      return "Payment failed"
    case "refunded":
      return "Refunded"
    case "unpaid":
    default:
      return "Awaiting payment"
  }
}

function getFulfilmentStatusLabel(
  status: Order["fulfilment_status"]
) {
  switch (status) {
    case "paid":
      return "Paid"
    case "dispatched":
      return "Dispatched"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    case "expired":
      return "Expired"
    case "awaiting_payment":
    default:
      return "Awaiting payment"
  }
}

function getOrderItemStatusLabel(status: string) {
  switch (status) {
    case "awaiting_payment":
      return "Awaiting payment"
    case "paid":
      return "Paid"
    case "dispatched":
      return "Dispatched"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    default:
      return status
  }
}

export default function OrderDetailPage() {
  const params = useParams<{ reference: string }>()
  const reference = params.reference

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmingItemId, setConfirmingItemId] =
    useState<number | null>(null)
  const [confirmError, setConfirmError] =
    useState<string | null>(null)

  const [reviewingItemId, setReviewingItemId] =
    useState<number | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewError, setReviewError] =
    useState<string | null>(null)

  async function loadOrder() {
    if (!reference) {
      setError("Order reference is missing")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await getOrder(reference)
      setOrder(response.order)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load order"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadInitialOrder() {
      if (!reference) {
        if (!cancelled) {
          setError("Order reference is missing")
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await getOrder(reference)

        if (!cancelled) {
          setOrder(response.order)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load order"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadInitialOrder()

    return () => {
      cancelled = true
    }
  }, [reference])

  async function handleConfirmDelivery(orderItemId: number) {
    try {
      setConfirmingItemId(orderItemId)
      setConfirmError(null)

      await confirmDelivery(orderItemId)
      await loadOrder()
    } catch (err: unknown) {
      setConfirmError(
        err instanceof Error
          ? err.message
          : "Unable to confirm delivery"
      )
    } finally {
      setConfirmingItemId(null)
    }
  }

  function openReviewForm(orderItemId: number) {
    setReviewingItemId(orderItemId)
    setReviewRating(5)
    setReviewComment("")
    setReviewError(null)
  }

  function closeReviewForm() {
    setReviewingItemId(null)
    setReviewError(null)
  }

  async function handleReview(
    event: FormEvent<HTMLFormElement>,
    orderItemId: number
  ) {
    event.preventDefault()

    try {
      setReviewingItemId(orderItemId)
      setReviewError(null)

      await createOrderItemReview(
        orderItemId,
        reviewRating,
        reviewComment.trim()
      )

      setOrder((currentOrder) => {
        if (!currentOrder) {
          return currentOrder
        }

        return {
          ...currentOrder,
          items: currentOrder.items.map((item) =>
            item.id === orderItemId
              ? { ...item, has_review: true }
              : item
          ),
        }
      })

      setReviewingItemId(null)
      setReviewRating(5)
      setReviewComment("")
    } catch (err: unknown) {
      setReviewError(
        err instanceof Error
          ? err.message
          : "Unable to submit review"
      )
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <main className="py-10 md:py-14">
        <Container>
          <div className="mb-6">
            <Link
              href="/orders"
              className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            >
              ← Back to Orders
            </Link>
          </div>

          {loading && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
              <p className="text-[var(--muted-foreground)]">
                Loading order...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <h1 className="text-xl font-semibold">
                Unable to load order
              </h1>

              <p className="mt-2">{error}</p>

              <Link
                href="/orders"
                className="mt-5 inline-flex rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
              >
                Back to Orders
              </Link>
            </div>
          )}

          {!loading && !error && order && (
            <>
              <div className="mb-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Order
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
                      {order.order_reference}
                    </h1>

                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      Ordered {formatDate(order.created_at)}
                    </p>
                  </div>

<div className="flex flex-wrap gap-2">
  {getPaymentStatusLabel(order.payment_status) ===
  getFulfilmentStatusLabel(order.fulfilment_status) ? (
    <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-800 dark:bg-lime-950 dark:text-lime-300">
      {getPaymentStatusLabel(order.payment_status)}
    </span>
  ) : (
    <>
      <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-800 dark:bg-lime-950 dark:text-lime-300">
        {getPaymentStatusLabel(order.payment_status)}
      </span>

      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold dark:bg-gray-800">
        {getFulfilmentStatusLabel(order.fulfilment_status)}
      </span>
    </>
  )}
</div>
                </div>
              </div>

              {confirmError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  {confirmError}
                </div>
              )}

              {order.payment_status === "unpaid" && (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
                  <h2 className="font-semibold text-amber-900 dark:text-amber-200">
                    Payment pending
                  </h2>

                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                    Your order has been created and is waiting for payment.
                  </p>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                  <h2 className="text-lg font-semibold">
                    Items
                  </h2>

                  <div className="mt-5 divide-y divide-[var(--border)]">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-5 first:pt-0 last:pb-0"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="font-semibold">
                              {item.listing_title}
                            </h3>

                            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                              Seller: {item.seller_username}
                            </p>

                            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                              {item.quantity}{" "}
                              {item.quantity === 1
                                ? "unit"
                                : "units"}{" "}
                              × {formatAmount(item.unit_price)}
                            </p>
                          </div>

                          <div className="shrink-0 sm:text-right">
                            <p className="font-semibold">
                              {formatAmount(item.total_amount)}
                            </p>

                            <span className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold dark:bg-gray-800">
                              {getOrderItemStatusLabel(
                                item.fulfilment_status
                              )}
                            </span>
                          </div>
                        </div>

                        {item.dispatched_at && (
                          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                            Dispatched{" "}
                            {formatDate(item.dispatched_at)}
                          </p>
                        )}

                        {item.completed_at && (
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                            Completed{" "}
                            {formatDate(item.completed_at)}
                          </p>
                        )}

                        {item.fulfilment_status ===
                          "dispatched" && (
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() =>
                                void handleConfirmDelivery(
                                  item.id
                                )
                              }
                              disabled={
                                confirmingItemId === item.id
                              }
                              className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {confirmingItemId === item.id
                                ? "Confirming..."
                                : "Confirm Delivery"}
                            </button>
                          </div>
                        )}

                        {item.fulfilment_status ===
                          "completed" &&
                          !item.has_review && (
                            <div className="mt-6 border-t border-[var(--border)] pt-6">
                              {reviewingItemId !== item.id ? (
                                <>
                                  <div>
                                    <h3 className="text-base font-semibold">
                                      Review your purchase
                                    </h3>

                                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                      Share your experience with this seller.
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openReviewForm(item.id)
                                    }
                                    className="mt-4 rounded-xl bg-lime-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-lime-300"
                                  >
                                    Write a Review
                                  </button>
                                </>
                              ) : (
                                <form
                                  onSubmit={(event) =>
                                    void handleReview(
                                      event,
                                      item.id
                                    )
                                  }
                                >
                                  <div>
                                    <h3 className="text-base font-semibold">
                                      Review your purchase
                                    </h3>

                                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                      Share your experience with this seller.
                                    </p>
                                  </div>

                                  {reviewError && (
                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                                      {reviewError}
                                    </div>
                                  )}

                                  <div className="mt-5">
                                    <label
                                      htmlFor={`review-rating-${item.id}`}
                                      className="mb-1.5 block text-sm font-medium"
                                    >
                                      Rating
                                    </label>

                                    <select
                                      id={`review-rating-${item.id}`}
                                      value={reviewRating}
                                      onChange={(event) =>
                                        setReviewRating(
                                          Number(
                                            event.target.value
                                          )
                                        )
                                      }
                                      disabled={
                                        reviewingItemId !==
                                        item.id
                                      }
                                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none focus:border-lime-500 disabled:opacity-50"
                                    >
                                      <option value={5}>
                                        5 — Excellent
                                      </option>
                                      <option value={4}>
                                        4 — Good
                                      </option>
                                      <option value={3}>
                                        3 — Average
                                      </option>
                                      <option value={2}>
                                        2 — Poor
                                      </option>
                                      <option value={1}>
                                        1 — Very poor
                                      </option>
                                    </select>
                                  </div>

                                  <div className="mt-4">
                                    <label
                                      htmlFor={`review-comment-${item.id}`}
                                      className="mb-1.5 block text-sm font-medium"
                                    >
                                      Comment
                                    </label>

                                    <textarea
                                      id={`review-comment-${item.id}`}
                                      value={reviewComment}
                                      onChange={(event) =>
                                        setReviewComment(
                                          event.target.value
                                        )
                                      }
                                      disabled={
                                        reviewingItemId !==
                                        item.id
                                      }
                                      rows={4}
                                      maxLength={1000}
                                      placeholder="Share your experience with this seller."
                                      className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none focus:border-lime-500 disabled:opacity-50"
                                    />
                                  </div>

                                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    <button
                                      type="submit"
                                      disabled={
                                        reviewingItemId !==
                                        item.id
                                      }
                                      className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {reviewingItemId ===
                                      item.id
                                        ? "Submitting..."
                                        : "Submit Review"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={
                                        closeReviewForm
                                      }
                                      disabled={
                                        reviewingItemId ===
                                        item.id
                                      }
                                      className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:border-lime-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-lime-400 dark:hover:bg-gray-700"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          )}

                        {item.fulfilment_status ===
                          "completed" &&
                          item.has_review && (
                            <div className="mt-6 border-t border-[var(--border)] pt-6">
                              <p className="font-semibold">
                                Review submitted
                              </p>

                              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                Your verified purchase review has been recorded.
                              </p>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </section>

                <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                  <h2 className="text-lg font-semibold">
                    Order Summary
                  </h2>

                  <div className="mt-5 space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--muted-foreground)]">
                        Payment
                      </span>

                      <span className="font-medium">
                        {getPaymentStatusLabel(
                          order.payment_status
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--muted-foreground)]">
                        Fulfilment
                      </span>

                      <span className="font-medium">
                        {getFulfilmentStatusLabel(
                          order.fulfilment_status
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--muted-foreground)]">
                        Items
                      </span>

                      <span className="font-medium">
                        {order.items.length}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-5">
                    <span className="font-medium">
                      Total
                    </span>

                    <span className="text-xl font-bold">
                      {formatAmount(order.total_amount)}
                    </span>
                  </div>

                  {order.paid_at && (
                    <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                      Paid {formatDate(order.paid_at)}
                    </p>
                  )}

                  {order.completed_at && (
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Completed{" "}
                      {formatDate(order.completed_at)}
                    </p>
                  )}

                  <Link
                    href="/marketplace"
                    className="mt-6 block rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-medium text-gray-900 transition hover:border-lime-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-lime-400 dark:hover:bg-gray-700"
                  >
                    Continue Shopping
                  </Link>
                </aside>
              </div>
            </>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  )
}
