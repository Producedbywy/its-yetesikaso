"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"
import {
  confirmDelivery,
  getOrder,
  type Order,
} from "@/lib/api/orders"

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

function getOrderItemStatusLabel(
  status: string
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
                    <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-800 dark:bg-lime-950 dark:text-lime-300">
                      {getPaymentStatusLabel(
                        order.payment_status
                      )}
                    </span>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold dark:bg-gray-800">
                      {getFulfilmentStatusLabel(
                        order.fulfilment_status
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {confirmError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  {confirmError}
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
                    className="mt-6 block rounded-xl border border-[var(--border)] px-5 py-3 text-center text-sm font-medium transition hover:border-lime-400"
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
