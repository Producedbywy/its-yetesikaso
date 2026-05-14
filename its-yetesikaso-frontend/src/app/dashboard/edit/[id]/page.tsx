"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/client"

type ListingForm = {
  title: string
  description: string
  price: string
  category: string
  location: string
}

export default function EditListingPage() {
  const { id } = useParams()
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
    async function load() {
      try {
        setError(null)

        const data: any = await apiClient(`/listings/${id}/`)

        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          price: String(data.price ?? ""),
          category: data.category ?? "",
          location: data.location ?? "",
        })
      } catch (err: any) {
        setError(err.message || "Failed to load listing")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      await apiClient(`/listings/${id}/`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      })

      router.push(`/dashboard/${id}`)
    } catch (err: any) {
      setError(err.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-[var(--muted)]">
        Loading...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="mx-auto max-w-2xl py-10">

          <h1 className="mb-6 text-4xl font-bold">
            Edit Listing
          </h1>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="w-full rounded-xl border p-3"
              placeholder="Title"
            />

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-xl border p-3"
              placeholder="Description"
            />

            <input
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className="w-full rounded-xl border p-3"
              placeholder="Price"
            />

            <input
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="w-full rounded-xl border p-3"
              placeholder="Category"
            />

            <input
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
              className="w-full rounded-xl border p-3"
              placeholder="Location"
            />

            <button
              disabled={saving}
              className="w-full rounded-xl bg-lime-400 p-3 font-medium text-black"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </form>

        </div>
      </Container>
    </main>
  )
}