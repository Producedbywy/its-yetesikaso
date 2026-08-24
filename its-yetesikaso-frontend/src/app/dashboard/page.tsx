"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import {
  getMyListings,
  deleteListing,
} from "@/lib/api/seller"
import { apiClient } from "@/lib/api/client"
import type { Listing } from "@/types/listing"

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sellingId, setSellingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [saleQuantities, setSaleQuantities] = useState<
    Record<number, number>
  >({})

  const [error, setError] = useState<string | null>(null)

  async function loadListings(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const res = await getMyListings()
      setListings(res.results || [])
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load listings"
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadInitialListings() {
      try {
        const res = await getMyListings()

        if (!cancelled) {
          setListings(res.results || [])
          setError(null)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load listings"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInitialListings()

    return () => {
      cancelled = true
    }
  }, [])

  function getSaleQuantity(item: Listing) {
    return saleQuantities[item.id] || 1
  }

  function updateSaleQuantity(
    item: Listing,
    value: number
  ) {
    const maxQuantity = item.available_quantity

    const quantity = Math.min(
      Math.max(value, 1),
      maxQuantity
    )

    setSaleQuantities((prev) => ({
      ...prev,
      [item.id]: quantity,
    }))
  }

  async function markAsSold(item: Listing) {
    const quantity = getSaleQuantity(item)

    if (
      item.available_quantity <= 0
    ) {
      return
    }

    if (
      quantity > item.available_quantity
    ) {
      setError(
        `Only ${item.available_quantity} unit(s) remain available for "${item.title}".`
      )
      return
    }

    try {
      setSellingId(item.id)
      setError(null)

      const response = await apiClient<{
        available_quantity: number
        sold_out: boolean
        listing: Listing
      }>(`/listings/${item.id}/sold/`, {
        method: "POST",
        body: JSON.stringify({
          quantity,
        }),
      })

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === item.id
            ? {
                ...listing,
                ...response.listing,
                available_quantity:
                  response.available_quantity,
              }
            : listing
        )
      )

      setSaleQuantities((prev) => ({
        ...prev,
        [item.id]: 1,
      }))
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update listing inventory"
      )
    } finally {
      setSellingId(null)
    }
  }

  async function handleDelete(item: Listing) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?\n\nThis cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(item.id)
      setError(null)

      await deleteListing(item.id)

      setListings((prev) =>
        prev.filter(
          (listing) => listing.id !== item.id
        )
      )
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete listing"
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="py-10">

          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                Seller Dashboard
              </h1>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Manage your listings and track performance
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadListings(true)}
                disabled={refreshing || loading}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50"
              >
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <Link
                href="/dashboard/create"
                className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-medium text-black transition hover:bg-lime-300"
              >
                + Create
              </Link>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="space-y-3">
              <div className="h-24 animate-pulse rounded-2xl border bg-[var(--card)]" />
              <div className="h-24 animate-pulse rounded-2xl border bg-[var(--card)]" />
              <div className="h-24 animate-pulse rounded-2xl border bg-[var(--card)]" />
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && listings.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
              <p className="text-[var(--muted)]">
                You don’t have any listings yet.
              </p>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Create your first listing to start selling.
              </p>

              <Link
                href="/dashboard/create"
                className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-2 font-medium text-black hover:bg-lime-300"
              >
                Create Listing
              </Link>
            </div>
          )}

          {/* LISTINGS */}
          {!loading && listings.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {listings.map((item) => {
                const availableQuantity =
                  item.available_quantity

                const isSoldOut =
                  availableQuantity === 0

                const isSelling =
                  sellingId === item.id

                const isDeleting =
                  deletingId === item.id

                const selectedQuantity =
                  getSaleQuantity(item)

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* LISTING INFO */}
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-semibold">
                            {item.title}
                          </h2>

                          <p className="text-sm text-[var(--muted)]">
                            {item.category} •{" "}
                            {item.location}
                          </p>
                        </div>

                        {isSoldOut ? (
                          <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Sold Out
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">
                            Available
                          </span>
                        )}
                      </div>

                      <p className="mt-2 font-bold text-lime-500">
                        GH₵{" "}
                        {Number(
                          item.price
                        ).toLocaleString()}
                      </p>
                    </div>

                    {/* INVENTORY */}
                    <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--muted)]">
                          Available
                        </span>

                        <span
                          className={`text-lg font-bold ${
                            isSoldOut
                              ? "text-red-500"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {availableQuantity}
                        </span>
                      </div>

                      {!isSoldOut && (
                        <div className="mt-4">
                          <label
                            htmlFor={`quantity-${item.id}`}
                            className="mb-2 block text-xs font-medium text-[var(--muted)]"
                          >
                            Units sold
                          </label>

                          <div className="flex gap-2">
                            <select
                              id={`quantity-${item.id}`}
                              value={selectedQuantity}
                              onChange={(event) =>
                                updateSaleQuantity(
                                  item,
                                  Number(
                                    event.target.value
                                  )
                                )
                              }
                              disabled={
                                isSelling ||
                                isDeleting
                              }
                              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-lime-400 disabled:opacity-50"
                            >
                              {Array.from(
                                {
                                  length:
                                    availableQuantity,
                                },
                                (_, index) =>
                                  index + 1
                              ).map(
                                (quantity) => (
                                  <option
                                    key={quantity}
                                    value={
                                      quantity
                                    }
                                  >
                                    {quantity}
                                  </option>
                                )
                              )}
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                markAsSold(item)
                              }
                              disabled={
                                isSelling ||
                                isDeleting
                              }
                              className="flex-1 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
                            >
                              {isSelling
                                ? "Updating..."
                                : selectedQuantity ===
                                    1
                                  ? "Mark as Sold"
                                  : `Mark ${selectedQuantity} as Sold`}
                            </button>
                          </div>

                          <p className="mt-2 text-xs text-[var(--muted)]">
                            Mark units as sold when
                            they leave your inventory.
                          </p>
                        </div>
                      )}

                      {isSoldOut && (
                        <p className="mt-2 text-xs text-red-500">
                          This listing is no longer
                          available to buyers.
                        </p>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        {!isSoldOut ? (
                          <Link
                            href={`/marketplace/${item.slug}`}
                            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
                          >
                            View listing →
                          </Link>
                        ) : (
                          <span className="text-sm text-[var(--muted)]">
                            Listing sold out
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/edit/${item.id}`}
                          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium transition hover:bg-[var(--background)]"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item)
                          }
                          disabled={
                            isDeleting ||
                            isSelling
                          }
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </Container>
    </main>
  )
}