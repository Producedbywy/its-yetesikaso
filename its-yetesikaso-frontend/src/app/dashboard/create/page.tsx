"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import ImageUploader from "@/components/upload/ImageUploader"
import {
  createListing,
  getMyProfile,
  upgradeAccount,
} from "@/lib/api/seller"
import { getAccessToken } from "@/lib/auth/tokens"

type ListingDraft = {
  title: string
  description: string
  price: string
  pricingType: string
  quantity: string
  category: string
  location: string
}

const DRAFT_KEY = "yetesikaso_listing_draft"

const defaultForm: ListingDraft = {
  title: "",
  description: "",
  price: "",
  pricingType: "one_time",
  quantity: "1",
  category: "property_land",
  location: "",
}

export default function CreateListingPage() {
  const router = useRouter()

  const [form, setForm] = useState<ListingDraft>(defaultForm)
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [restoredDraft, setRestoredDraft] = useState(false)

  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem(DRAFT_KEY)

      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as Partial<ListingDraft>

        setForm({
          ...defaultForm,
          ...parsed,
        })
      }
    } catch {
      sessionStorage.removeItem(DRAFT_KEY)
    } finally {
      setRestoredDraft(true)
    }
  }, [])

  function updateField(
    field: keyof ListingDraft,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function saveDraft() {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify(form)
    )
  }

  function clearDraft() {
    sessionStorage.removeItem(DRAFT_KEY)
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    if (
      !form.title.trim() ||
      !form.price ||
      !form.location.trim()
    ) {
      setError("Please fill in all required fields")
      return
    }

    const quantity = Number(form.quantity)

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Quantity must be at least 1")
      return
    }

    const token = getAccessToken()

    if (!token) {
      saveDraft()

      router.push(
        `/login?returnTo=${encodeURIComponent(
          "/dashboard/create"
        )}`
      )

      return
    }

    try {
      setLoading(true)
      setError(null)

      const profile = await getMyProfile()

      if (profile.role === "user") {
        await upgradeAccount("seller")
      } else if (profile.role !== "seller") {
        throw new Error(
          "This account cannot create marketplace listings."
        )
      }

      const data = new FormData()

      data.append("title", form.title.trim())
      data.append("description", form.description.trim())
      data.append("price", form.price)
      data.append("pricing_type", form.pricingType)
      data.append("quantity", String(quantity))
      data.append("category", form.category)
      data.append("location", form.location.trim())

      images.forEach((file) => {
        data.append("images", file)
      })

      const listing = await createListing(data)

      clearDraft()

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

            {restoredDraft &&
              form.title.trim() !== "" &&
              typeof window !== "undefined" &&
              sessionStorage.getItem(DRAFT_KEY) && (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  Your listing details are saved while you complete
                  account setup.
                </p>
              )}
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

            {/* PRICE + PRICING TYPE */}
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
                  htmlFor="pricingType"
                  className="mb-2 block text-sm font-medium"
                >
                  Pricing
                </label>

                <select
                  id="pricingType"
                  name="pricingType"
                  value={form.pricingType}
                  onChange={(e) =>
                    updateField("pricingType", e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                >
                  <option value="one_time">
                    One-time
                  </option>

                  <option value="for_sale">
                    For sale
                  </option>

                  <option value="per_service">
                    Per service
                  </option>

                  <option value="per_day">
                    Per day
                  </option>

                  <option value="per_week">
                    Per week
                  </option>

                  <option value="per_month">
                    Per month
                  </option>

                  <option value="per_year">
                    Per year
                  </option>
                </select>
              </div>
            </div>

            {/* QUANTITY */}
            <div>
              <label
                htmlFor="quantity"
                className="mb-2 block text-sm font-medium"
              >
                Quantity available
              </label>

              <input
                id="quantity"
                name="quantity"
                value={form.quantity}
                onChange={(e) =>
                  updateField("quantity", e.target.value)
                }
                type="number"
                min="1"
                step="1"
                required
                disabled={loading}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
              />

              <p className="mt-2 text-xs text-[var(--muted)]">
                Enter 1 for a single item or the total number
                available if you have multiple units.
              </p>
            </div>

            {/* CATEGORY */}
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
                <option value="property_land">
                  Property & Land
                </option>

                <option value="vehicles">
                  Vehicles
                </option>

                <option value="phones_tablets">
                  Phones & Tablets
                </option>

                <option value="computers_office">
                  Computers & Office
                </option>

                <option value="electronics_appliances">
                  Electronics & Appliances
                </option>

                <option value="home_garden">
                  Home & Garden
                </option>

                <option value="fashion">
                  Fashion
                </option>

                <option value="baby_kids">
                  Baby & Kids
                </option>

                <option value="health_beauty">
                  Health & Beauty
                </option>

                <option value="sports_fitness">
                  Sports & Fitness
                </option>

                <option value="business_industrial">
                  Business & Industrial
                </option>

                <option value="education">
                  Education
                </option>

                <option value="food_agriculture">
                  Food & Agriculture
                </option>

                <option value="services">
                  Services
                </option>

                <option value="other">
                  Other
                </option>
              </select>
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

              <ImageUploader onChange={setImages} />
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
                ? "Preparing listing..."
                : "Create Listing"}
            </button>
          </form>
        </div>
      </Container>
    </main>
  )
}
