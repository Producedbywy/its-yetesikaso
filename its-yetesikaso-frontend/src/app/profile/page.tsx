"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import MobileNav from "@/components/layout/mobile-nav"
import Container from "@/components/layout/container"

import {
  getMyListings,
  getMyProfile,
  updateMyProfile,
  type SellerProfile,
} from "@/lib/api/seller"

import type { Listing } from "@/types/listing"

export default function ProfilePage() {
  const router = useRouter()

  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    location: "",
    bio: "",
  })

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        setLoading(true)
        setError(null)

        const profileData = await getMyProfile()

        if (cancelled) return

        setProfile(profileData)

        setForm({
          display_name: profileData.display_name || "",
          phone: profileData.phone || "",
          location: profileData.location || "",
          bio: profileData.bio || "",
        })

        /*
         * Listings are only relevant to sellers.
         * Buyers do not need to load seller listings.
         */
        if (profileData.role === "seller") {
          const listingsData = await getMyListings()

          if (cancelled) return

          setListings(listingsData.results || [])
        } else {
          setListings([])
        }
      } catch (err: unknown) {
        if (cancelled) return

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your profile"
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const updated = await updateMyProfile({
        display_name: form.display_name.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        onboarding_completed: true,
      })

      setProfile(updated)

      setForm({
        display_name: updated.display_name || "",
        phone: updated.phone || "",
        location: updated.location || "",
        bio: updated.bio || "",
      })

      setSuccess("Profile updated successfully.")

      /*
       * Onboarding is now complete.
       *
       * Sellers go to their dashboard.
       * Buyers go to the marketplace.
       */
      setTimeout(() => {
        if (updated.role === "seller") {
          router.push("/dashboard")
        } else {
          router.push("/marketplace")
        }
      }, 500)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update your profile"
      )
    } finally {
      setSaving(false)
    }
  }

  const isSeller = profile?.role === "seller"

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="mx-auto max-w-5xl py-10">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              {isSeller
                ? "Seller Profile"
                : "Buyer Profile"}
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              {isSeller
                ? "Complete your seller profile so buyers know who they are dealing with."
                : "Complete your profile before you start using Yetesikaso."}
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="space-y-4">
              <div className="h-64 animate-pulse rounded-3xl border border-[var(--border)] bg-[var(--card)]" />
              <div className="h-48 animate-pulse rounded-3xl border border-[var(--border)] bg-[var(--card)]" />
            </div>
          )}

          {!loading && (
            <>
              {/* ERROR */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="mb-6 rounded-xl border border-lime-200 bg-lime-50 p-4 text-sm text-lime-700">
                  {success}
                </div>
              )}

              {/* PROFILE */}
              <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-lime-100 text-3xl font-bold text-lime-700">
                    {(
                      profile?.display_name ||
                      profile?.username ||
                      "?"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      {profile?.display_name ||
                        profile?.username}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      @{profile?.username}
                    </p>

                    {profile?.email && (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {profile.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* ROLE */}
                <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                  <p className="text-sm text-[var(--muted)]">
                    Account type
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {isSeller ? "Seller" : "Buyer"}
                  </p>
                </div>

                {/* PROFILE STATUS */}
                <div className="mb-8 flex flex-wrap gap-3">
                  <span
                    className={
                      profile?.onboarding_completed
                        ? "rounded-full bg-lime-100 px-4 py-2 text-sm font-medium text-lime-700"
                        : "rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700"
                    }
                  >
                    {profile?.onboarding_completed
                      ? "Profile Complete"
                      : "Profile Incomplete"}
                  </span>

                  {isSeller && (
                    <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                      {profile?.listing_count ?? 0} Listings
                    </span>
                  )}
                </div>

                {/* FORM */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="display_name"
                      className="mb-2 block text-sm font-medium"
                    >
                      Display Name
                    </label>

                    <input
                      id="display_name"
                      value={form.display_name}
                      onChange={(event) =>
                        updateField(
                          "display_name",
                          event.target.value
                        )
                      }
                      maxLength={150}
                      required
                      disabled={saving}
                      placeholder={
                        isSeller
                          ? "Your seller name"
                          : "Your display name"
                      }
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium"
                      >
                        Phone
                      </label>

                      <input
                        id="phone"
                        value={form.phone}
                        onChange={(event) =>
                          updateField(
                            "phone",
                            event.target.value
                          )
                        }
                        maxLength={30}
                        disabled={saving}
                        placeholder="e.g. +233..."
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="location"
                        className="mb-2 block text-sm font-medium"
                      >
                        Location
                      </label>

                      <input
                        id="location"
                        value={form.location}
                        onChange={(event) =>
                          updateField(
                            "location",
                            event.target.value
                          )
                        }
                        maxLength={150}
                        disabled={saving}
                        placeholder="e.g. Accra, Ghana"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="mb-2 block text-sm font-medium"
                    >
                      About You
                    </label>

                    <textarea
                      id="bio"
                      value={form.bio}
                      onChange={(event) =>
                        updateField(
                          "bio",
                          event.target.value
                        )
                      }
                      maxLength={1000}
                      rows={6}
                      disabled={saving}
                      placeholder={
                        isSeller
                          ? "Tell buyers a little about yourself..."
                          : "Tell the Yetesikaso community a little about yourself..."
                      }
                      className="min-h-[140px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={
                        saving ||
                        !form.display_name.trim()
                      }
                      className="rounded-xl bg-lime-400 px-6 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : profile?.onboarding_completed
                          ? "Save Profile"
                          : "Complete Profile"}
                    </button>
                  </div>
                </form>
              </section>

              {/* SELLER LISTINGS */}
              {isSeller && (
                <section className="mt-10">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">
                      Your Listings
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Listings currently associated with your seller
                      account.
                    </p>
                  </div>

                  {listings.length === 0 ? (
                    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
                      <h3 className="text-lg font-semibold">
                        No listings yet
                      </h3>

                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Create your first listing to start selling.
                      </p>

                      <Link
                        href="/dashboard/create"
                        className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-black hover:bg-lime-300"
                      >
                        Create Listing
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                      {listings.map((listing) => (
                        <a
                          key={listing.id}
                          href={`/marketplace/${listing.slug}`}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {listing.title}
                              </h3>

                              <p className="mt-1 text-sm text-[var(--muted)]">
                                {listing.category} •{" "}
                                {listing.location}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-700">
                              Active
                            </span>
                          </div>

                          <p className="mt-4 text-xl font-bold text-lime-500">
                            GH₵{" "}
                            {listing.price.toLocaleString()}
                          </p>

                          {listing.description && (
                            <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
                              {listing.description}
                            </p>
                          )}

                          <p className="mt-4 text-sm font-medium">
                            View listing →
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </Container>

      <Footer />
      <MobileNav />
    </main>
  )
}