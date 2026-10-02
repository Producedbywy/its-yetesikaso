"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import ImageUploader from "@/components/upload/ImageUploader"
import { apiClient } from "@/lib/api/client"
import { updateListing } from "@/lib/api/seller"
import type { Listing } from "@/types/listing"

type ListingForm = {
  title: string
  description: string
  price: string
  pricingType: string
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
    pricingType: "one_time",
    category: "",
    location: "",
  })

  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [listingSlug, setListingSlug] = useState("")
  const [newImages, setNewImages] = useState<File[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadListing() {
      try {
        setError(null)

        const data = await apiClient<Listing>(
          `/listings/${id}/`
        )

        if (cancelled) return

        setListingSlug(data.slug)

        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          price: String(data.price ?? ""),
          pricingType: data.pricing_type ?? "one_time",
          category: data.category ?? "",
          location: data.location ?? "",
        })

        const images =
          Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : data.image
              ? [data.image]
              : []

        setCurrentImages(images)
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

  function updateField(
    field: keyof ListingForm,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (
      !form.title.trim() ||
      !form.price ||
      !form.location.trim()
    ) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const data = new FormData()

      data.append("title", form.title.trim())
      data.append(
        "description",
        form.description.trim()
      )
      data.append("price", form.price)
      data.append("pricing_type", form.pricingType)
      data.append("category", form.category)
      data.append(
        "location",
        form.location.trim()
      )

      // If new images were selected, replace the
      // entire existing gallery with the new gallery.
      newImages.forEach((file) => {
        data.append("images", file)
      })

      const listing = await updateListing(
        Number(id),
        data
      )

      router.push(
        `/marketplace/${listing.slug}`
      )
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
              onClick={() => {
                if (listingSlug) {
                  router.push(`/marketplace/${listingSlug}`)
                }
              }}
              className="mb-4 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ← Back
            </button>

            <h1 className="text-4xl font-bold">
              Edit Listing
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Update the details and images of your listing.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* CURRENT IMAGES */}

            {currentImages.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Current images
                </label>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {currentImages.map(
                    (image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
                      >
                        <Image
                          src={image}
                          alt={
                            form.title ||
                            `Listing image ${index + 1}`
                          }
                          width={800}
                          height={600}
                          className="aspect-[4/3] w-full object-cover"
                          unoptimized
                        />

                        {index === 0 && (
                          <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                            Main image
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                <p className="mt-2 text-xs text-[var(--muted)]">
                  Selecting new images below will replace the
                  current gallery. The first new image becomes
                  the main image.
                </p>
              </div>
            )}

            {/* IMAGE GALLERY */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                {currentImages.length > 0
                  ? "Replace listing images"
                  : "Listing images"}
              </label>

              <ImageUploader
                onChange={(files) =>
                  setNewImages(files)
                }
              />
            </div>

            {/* TITLE */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Title"
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                className="min-h-[140px] w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Description"
              />
            </div>

            {/* PRICE + PRICING TYPE */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price
                </label>

                <input
                  value={form.price}
                  onChange={(event) =>
                    updateField(
                      "price",
                      event.target.value
                    )
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
                  Pricing
                </label>

                <select
                  value={form.pricingType}
                  onChange={(event) =>
                    updateField(
                      "pricingType",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:ring-2 focus:ring-lime-400"
                  required
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


            {/* CATEGORY */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:ring-2 focus:ring-lime-400"
                required
              >
                <option value="">
                  Select category
                </option>

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
              <label className="mb-2 block text-sm font-medium">
                Location
              </label>

              <input
                value={form.location}
                onChange={(event) =>
                  updateField(
                    "location",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Location"
                required
              />
            </div>

            {/* SAVE */}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-lime-400 p-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </form>
        </div>
      </Container>
    </main>
  )
}
