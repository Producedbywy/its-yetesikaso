"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import { getMyListings } from "@/lib/api/seller"
import type { Listing } from "@/types/listing"
import Link from "next/link"

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
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
                onClick={() => loadListings(true)}
                disabled={refreshing || loading}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
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
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
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

          {/* GRID */}
          {!loading && listings.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {listings.map((item) => (
                <Link
                  key={item.id}
                  href={`/marketplace/${item.slug}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <h2 className="text-xl font-semibold">
                    {item.title}
                  </h2>

                  <p className="text-sm text-[var(--muted)]">
                    {item.category} • {item.location}
                  </p>

                  <p className="mt-2 font-bold text-lime-500">
                    GH₵ {item.price.toLocaleString()}
                  </p>

                  <p className="mt-3 text-sm font-medium text-[var(--muted)]">
                    View listing →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}