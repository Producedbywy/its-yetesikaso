"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/client"
import type { Listing } from "@/types/listing"
import Link from "next/link"

export default function ListingDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadListing() {
    try {
      setLoading(true)
      setError(null)

      const res: any = await apiClient(`/listings/${id}/`)
      setListing(res as Listing)
    } catch (err: any) {
      setError(err.message || "Failed to load listing")
    } finally {
      setLoading(false)
    }
  }

  async function deleteListing() {
    try {
      setDeleting(true)

      await apiClient(`/listings/${id}/`, {
        method: "DELETE",
      })

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to delete")
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    loadListing()
  }, [id])

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="mx-auto max-w-3xl py-10">

          {loading && (
            <p className="text-[var(--muted)]">
              Loading listing...
            </p>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-600">
              {error}
            </div>
          )}

          {listing && (
            <>
              <h1 className="text-4xl font-bold">
                {listing.title}
              </h1>

              <p className="mt-2 text-[var(--muted)]">
                {listing.category} • {listing.location}
              </p>

              <p className="mt-6 text-2xl font-bold text-lime-500">
                ${listing.price}
              </p>

              <p className="mt-6 leading-relaxed">
                {listing.description}
              </p>

              <div className="mt-10 flex gap-3">

                <Link
                  href={`/dashboard/edit/${listing.id}`}
                  className="rounded-xl bg-black px-4 py-2 text-white"
                >
                  Edit
                </Link>

                <button
                  onClick={deleteListing}
                  disabled={deleting}
                  className="rounded-xl bg-red-500 px-4 py-2 text-white disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>

              </div>
            </>
          )}

        </div>
      </Container>
    </main>
  )
}