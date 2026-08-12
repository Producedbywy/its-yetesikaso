"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import ImageUploader from "@/components/upload/ImageUploader"
import { createListing } from "@/lib/api/seller"

export default function CreateListingPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "electronics",
    location: "",
  })

  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!form.title.trim() || !form.price || !form.location.trim()) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = new FormData()

      data.append("title", form.title.trim())
      data.append("description", form.description.trim())
      data.append("price", form.price)
      data.append("category", form.category)
      data.append("location", form.location.trim())

      if (image) {
        data.append("image", image)
      }

      const listing = await createListing(data)

      router.push(`/marketplace/${listing.slug}`)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create listing"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="mx-auto max-w-2xl py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Create Listing
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Add your item to the marketplace.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* TITLE */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium"
              >
                Title
              </label>

              <input
                id="title"
                name="title"
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                placeholder="e.g. Samsung Galaxy S24"
                required
                maxLength={120}
                disabled={loading}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                placeholder="Describe the item, condition, features, and anything buyers should know."
                rows={6}
                maxLength={5000}
                disabled={loading}
                className="min-h-[140px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
              />
            </div>

            {/* PRICE + CATEGORY */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium"
                >
                  Price
                </label>

                <input
                  id="price"
                  name="price"
                  value={form.price}
                  onChange={(e) =>
                    updateField("price", e.target.value)
                  }
                  placeholder="0"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={(e) =>
                    updateField("category", e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                >
                  <option value="electronics">
                    Electronics
                  </option>

                  <option value="vehicles">
                    Vehicles
                  </option>

                  <option value="property">
                    Property
                  </option>

                  <option value="fashion">
                    Fashion
                  </option>

                  <option value="services">
                    Services
                  </option>
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium"
              >
                Location
              </label>

              <input
                id="location"
                name="location"
                value={form.location}
                onChange={(e) =>
                  updateField("location", e.target.value)
                }
                placeholder="e.g. Accra, Ghana"
                required
                maxLength={150}
                disabled={loading}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
              />
            </div>

            {/* IMAGE */}
            <div>
              <p className="mb-2 text-sm font-medium">
                Listing image
              </p>

              <p className="mb-3 text-xs text-[var(--muted)]">
                Add a clear photo of the item. PNG, JPG, or WEBP.
              </p>

              <ImageUploader onChange={setImage} />
            </div>

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-lime-400 px-5 py-4 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating listing..."
                : "Create Listing"}
            </button>
          </form>
        </div>
      </Container>
    </main>
  )
}