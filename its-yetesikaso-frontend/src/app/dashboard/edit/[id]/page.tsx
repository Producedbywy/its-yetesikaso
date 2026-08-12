"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/client"
import type { Listing } from "@/types/listing"

type ListingForm = {
  title: string
  description: string
  price: string
  category: string
  location: string
}

export default function EditListingPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const [form, setForm] = useState<ListingForm>({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadListing() {
      try {
        setError(null)

        const data = await apiClient<Listing>(`/listings/${id}/`)

        if (cancelled) return

        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          price: String(data.price ?? ""),
          category: data.category ?? "",
          location: data.location ?? "",
        })
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      await apiClient<Listing>(`/listings/${id}/`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      })

      router.push(`/dashboard/${id}`)
      router.refresh()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save listing"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />

        <Container>
          <div className="mx-auto max-w-2xl py-10">
            <p className="text-[var(--muted)]">
              Loading listing...
            </p>
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="mx-auto max-w-2xl py-10">

          <div className="mb-8">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${id}`)}
              className="mb-4 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ← Back to listing
            </button>

            <h1 className="text-4xl font-bold">
              Edit Listing
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Update the details of your listing.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Title"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-[140px] w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Description"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Price
              </label>

              <input
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:ring-2 focus:ring-lime-400"
                required
              >
                <option value="">Select category</option>
                <option value="electronics">Electronics</option>
                <option value="vehicles">Vehicles</option>
                <option value="property">Property</option>
                <option value="fashion">Fashion</option>
                <option value="services">Services</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Location
              </label>

              <input
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Location"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-lime-400 p-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </form>
        </div>
      </Container>
    </main>
  )
}