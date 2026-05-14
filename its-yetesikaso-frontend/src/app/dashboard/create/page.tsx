"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import { createListing } from "@/lib/api/seller"

export default function CreateListingPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "electronics",
    location: "",
    image: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleImageChange(value: string) {
    updateField("image", value)
    setPreview(value || null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.title || !form.price || !form.location) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await createListing({
        ...form,
        price: Number(form.price),
      })

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to create listing")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="py-10 max-w-2xl mx-auto">

          <h1 className="text-4xl font-bold mb-6">
            Create Listing
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* TITLE */}
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Title"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none"
            />

            {/* DESCRIPTION */}
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Description"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none min-h-[120px]"
            />

            {/* PRICE + CATEGORY */}
            <div className="grid grid-cols-2 gap-4">

              <input
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="Price"
                type="number"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none"
              />

              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none"
              >
                <option value="electronics">Electronics</option>
                <option value="vehicles">Vehicles</option>
                <option value="property">Property</option>
                <option value="fashion">Fashion</option>
                <option value="services">Services</option>
              </select>

            </div>

            {/* LOCATION */}
            <input
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Location"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none"
            />

            {/* IMAGE INPUT (UX UPGRADED) */}
            <input
              value={form.image}
              onChange={(e) => handleImageChange(e.target.value)}
              placeholder="Image URL (optional)"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none"
            />

            {/* IMAGE PREVIEW */}
            {preview && (
              <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                <img
                  src={preview}
                  alt="preview"
                  className="h-60 w-full object-cover"
                />
              </div>
            )}

            {/* ERROR */}
            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            {/* SUBMIT */}
            <button
              disabled={loading}
              className="w-full rounded-2xl bg-lime-400 px-5 py-4 font-medium text-black hover:bg-lime-300 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Listing"}
            </button>

          </form>
        </div>
      </Container>
    </main>
  )
}