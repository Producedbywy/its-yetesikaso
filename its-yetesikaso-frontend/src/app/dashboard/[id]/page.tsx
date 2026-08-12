"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/client"
import type { Listing } from "@/types/listing"
import Link from "next/link"

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadListing() {
      try {
        const data = await apiClient<Listing>(`/listings/${id}/`)

        if (cancelled) return

        setListing(data)
        setError(null)
      } catch (err: unknown) {
        if (cancelled) return

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load listing"
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (id) {
      loadListing()
    }

    return () => {
      cancelled = true
    }
  }, [id])

  async function deleteListing() {
    try {
      setDeleting(true)
      setError(null)

      await apiClient(`/listings/${id}/`, {
        method: "DELETE",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete listing"
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="mx-auto max-w-3xl py-10">

          <Link
            href="/dashboard"
            className="mb-6 inline-block text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ← Back to Dashboard
          </Link>

          {loading && (
            <p className="text-[var(--muted)]">
              Loading listing...
            </p>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && !listing && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
              <h1 className="text-xl font-semibold">
                Listing not found
              </h1>

              <p className="mt-2 text-sm text-[var(--muted)]">
                This listing may have been removed.
              </p>
            </div>
          )}

          {listing && (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">

              <div className="mb-6">
                <span className="inline-block rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-700">
                  {listing.category}
                </span>

                <h1 className="mt-4 text-4xl font-bold">
                  {listing.title}
                </h1>

                <p className="mt-2 text-[var(--muted)]">
                  {listing.location}
                </p>
              </div>

              <p className="text-3xl font-bold text-lime-500">
                GH₵ {listing.price.toLocaleString()}
              </p>

              {listing.description && (
                <div className="mt-8">
                  <h2 className="mb-2 text-lg font-semibold">
                    Description
                  </h2>

                  <p className="leading-relaxed text-[var(--muted)]">
                    {listing.description}
                  </p>
                </div>
              )}

              <div className="mt-10 flex flex-wrap gap-3">

                <Link
                  href={`/dashboard/edit/${listing.id}`}
                  className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
                >
                  Edit Listing
                </Link>

                <button
                  type="button"
                  onClick={deleteListing}
                  disabled={deleting}
                  className="rounded-xl bg-red-500 px-5 py-3 font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete Listing"}
                </button>

              </div>
            </div>
          )}

        </div>
      </Container>
    </main>
  )
}
