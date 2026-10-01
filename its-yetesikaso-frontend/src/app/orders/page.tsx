"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"
import {
  getMyOrders,
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

function getFulfilmentStatusLabel(status: Order["fulfilment_status"]) {
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

function getOrderTitle(order: Order) {
  if (order.items.length === 1) {
    return order.items[0].listing_title
  }

  return `${order.items.length} items`
}

function getOrderItemSummary(order: Order) {
  if (order.items.length === 0) {
    return "No items"
  }

  if (order.items.length === 1) {
    return `Seller: ${order.items[0].seller_username}`
  }

  const firstItem = order.items[0].listing_title
  const remainingCount = order.items.length - 1

  return `${firstItem} + ${remainingCount} more`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadOrders() {
      try {
        setLoading(true)
        setError(null)

        const response = await getMyOrders()

        if (!cancelled) {
          setOrders(response.orders)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load orders"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <main className="py-10 md:py-14">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Orders
            </h1>

            <p className="mt-2 text-[var(--muted-foreground)]">
              View your purchases and payment status.
            </p>
          </div>

          {loading && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
              <p className="text-[var(--muted-foreground)]">
                Loading orders...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
              <h2 className="text-xl font-semibold">
                No orders yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-[var(--muted-foreground)]">
                Your purchases will appear here after you place an
                order.
              </p>

              <Link
                href="/marketplace"
                className="mt-6 inline-flex rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
              >
                Browse Marketplace
              </Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${encodeURIComponent(
                    order.order_reference
                  )}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-lime-400 hover:shadow-sm md:p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold dark:bg-gray-800">
                          Order
                        </span>

                        <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-800 dark:bg-lime-950 dark:text-lime-300">
                          {getPaymentStatusLabel(
                            order.payment_status
                          )}
                        </span>
                      </div>

                      <h2 className="truncate text-lg font-semibold">
                        {getOrderTitle(order)}
                      </h2>

                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {getOrderItemSummary(order)}
                      </p>
                    </div>

                    <div className="shrink-0 md:text-right">
                      <p className="text-lg font-bold">
                        {formatAmount(order.total_amount)}
                      </p>

                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {getFulfilmentStatusLabel(
                          order.fulfilment_status
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-1 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <span>
                        Order {order.order_reference}
                      </span>

                      <span className="hidden sm:inline">·</span>

                      <span>
                        Ordered {formatDate(order.created_at)}
                      </span>
                    </div>

                    <span className="font-medium text-[var(--foreground)]">
                      View order →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  )
}
