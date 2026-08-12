"use client"

import { useMemo } from "react"
import Container from "../layout/container"
import ListingCard from "./listing-card"
import { useListings } from "@/lib/marketplace/useListings"

export default function FeaturedListings() {
  const filters = useMemo(
    () => ({
      search: "",
      category: "all",
      location: "all",
      sort: "newest",
    }),
    []
  )

  const { data: listings = [], loading } = useListings(filters, 1)

  return (
    <section className="pb-20">
      <Container>
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-lime-600">
              Marketplace
            </p>

            <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-5xl">
              Featured Listings
            </h2>
          </div>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-3xl bg-gray-200"
              />
            ))}
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.slice(0, 6).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] py-16 text-center">
            <p className="text-lg font-medium">
              No listings available yet.
            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Check back soon for new listings.
            </p>
          </div>
        )}
      </Container>
    </section>
  )
}