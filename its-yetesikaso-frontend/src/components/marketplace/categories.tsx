"use client"

import { useMemo, useState } from "react"

import Container from "@/components/layout/container"
import ListingCard from "@/components/marketplace/listing-card"
import { useListings } from "@/lib/marketplace/useListings"

const categories = [
  { label: "All Categories", value: "all" },
  { label: "Electronics", value: "electronics" },
  { label: "Vehicles", value: "vehicles" },
  { label: "Property", value: "property" },
  { label: "Fashion", value: "fashion" },
  { label: "Services", value: "services" },
]

export default function Categories() {
  const [category, setCategory] = useState("all")

  const filters = useMemo(
    () => ({
      search: "",
      category,
      location: "all",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    }),
    [category]
  )

  const {
    data: listings = [],
    loading,
  } = useListings(filters, 1)

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-lime-600">
            Explore
          </p>

          <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">
            Browse Listings
          </h2>

          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Explore what is available across the marketplace and browse by
            category.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* CATEGORY SIDEBAR */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h3 className="mb-4 text-base font-semibold">
                Categories
              </h3>

              <div className="space-y-1">
                {categories.map((item) => {
                  const active = category === item.value

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "bg-lime-400 font-semibold text-black"
                          : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <span>{item.label}</span>

                      {active && (
                        <span className="text-xs">
                          →
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* LISTINGS */}
          <div className="min-w-0">
            {loading && listings.length === 0 && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-80 animate-pulse rounded-2xl bg-[var(--border)]"
                  />
                ))}
              </div>
            )}

            {!loading && listings.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {listings.slice(0, 6).map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                  />
                ))}
              </div>
            )}

            {loading && listings.length > 0 && (
              <div className="relative">
                <div className="absolute right-2 top-2 z-10 rounded-full bg-[var(--card)] px-3 py-1 text-xs text-[var(--muted)] shadow-sm">
                  Updating…
                </div>

                <div className="grid gap-5 opacity-60 sm:grid-cols-2 xl:grid-cols-3">
                  {listings.slice(0, 6).map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                    />
                  ))}
                </div>
              </div>
            )}

            {!loading && listings.length === 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-16 text-center">
                <p className="text-lg font-medium">
                  No listings in this category yet.
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Try another category.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}