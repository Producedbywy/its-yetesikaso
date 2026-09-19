"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import {
  getMyListings,
  deleteListing,
  getMyProfile,
  getPublicSellerProfile,
  type SellerReview,
} from "@/lib/api/seller"
import { apiClient } from "@/lib/api/client"
import type { Listing } from "@/types/listing"

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [sellingId, setSellingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [saleQuantities, setSaleQuantities] = useState<
    Record<number, number>
  >({})

  const [error, setError] = useState<string | null>(null)

  const [reviews, setReviews] = useState<SellerReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)

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

  async function loadReviews() {
    try {
      setReviewsLoading(true)
      setReviewsError(null)

      const profile = await getMyProfile()
      const response = await getPublicSellerProfile(
        profile.username
      )

      setReviews(response.reviews || [])
    } catch (err: unknown) {
      setReviewsError(
        err instanceof Error
          ? err.message
          : "Failed to load reviews"
      )
    } finally {
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)

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
    loadReviews()

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

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / reviews.length
      : 0

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
                onClick={() => {
                  loadListings(true)
                  loadReviews()
                }}
                disabled={
                  !mounted ||
                  refreshing ||
                  loading ||
                  reviewsLoading
                }
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50"
              >
                {mounted && (refreshing || reviewsLoading)
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
            <div className="mb-10 grid gap-6 md:grid-cols-2">
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

          {/* REVIEWS */}
          <section className="mb-10">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Reviews
                </h2>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Reviews from buyers who have completed purchases from you.
                </p>
              </div>

              {!reviewsLoading && reviews.length > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold">
                    ⭐ {averageRating.toFixed(1)} / 5
                  </span>

                  <span className="text-[var(--muted)]">
                    {reviews.length}{" "}
                    {reviews.length === 1
                      ? "review"
                      : "reviews"}
                  </span>
                </div>
              )}
            </div>

            {reviewsLoading && (
              <div className="space-y-3">
                <div className="h-28 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
                <div className="h-28 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
              </div>
            )}

            {!reviewsLoading && reviewsError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                {reviewsError}
              </div>
            )}

            {!reviewsLoading &&
              !reviewsError &&
              reviews.length === 0 && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                  <p className="font-medium">
                    No reviews yet
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Completed buyer transactions can leave reviews for your listings.
                  </p>
                </div>
              )}

            {!reviewsLoading &&
              !reviewsError &&
              reviews.length > 0 && (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold">
                            {review.buyer_username}
                          </p>

                          <p className="mt-1 text-sm text-[var(--muted)]">
                            Purchased:{" "}
                            {review.listing_title}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <div
                            className="text-sm"
                            aria-label={`${review.rating} out of 5 stars`}
                          >
                            {"⭐".repeat(review.rating)}
                          </div>

                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {new Date(
                              review.created_at
                            ).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="mt-4 text-sm leading-6 text-[var(--foreground)]">
                          {review.comment}
                        </p>
                      )}

                      {review.verified_purchase && (
                        <div className="mt-4">
                          <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">
                            ✓ Verified purchase
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </section>

        </div>
      </Container>
    </main>
  )
}