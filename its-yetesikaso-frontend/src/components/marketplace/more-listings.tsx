"use client"

import { useMemo } from "react"

import Container from "@/components/layout/container"
import ListingCard from "@/components/marketplace/listing-card"
import { useListings } from "@/lib/marketplace/useListings"

interface MoreListingsProps {
  startIndex: number
  endIndex: number
  eyebrow?: string
  title?: string
  description?: string
}

export default function MoreListings({
  startIndex,
  endIndex,
  eyebrow = "Keep Exploring",
  title = "More Listings",
  description = "Browse more products, services and opportunities available across the marketplace.",
}: MoreListingsProps) {
  const filters = useMemo(
    () => ({
      search: "",
      category: "all",
      location: "all",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    }),
    []
  )

  const pageOne = useListings(filters, 1)
  const pageTwo = useListings(filters, 2)
  const pageThree = useListings(filters, 3)

  const loading =
    pageOne.loading ||
    pageTwo.loading ||
    pageThree.loading

  const listings = useMemo(() => {
    const combined = [
      ...pageOne.data,
      ...pageTwo.data,
      ...pageThree.data,
    ]

    const uniqueListings = Array.from(
      new Map(combined.map((listing) => [listing.id, listing])).values()
    )

    return uniqueListings.slice(startIndex, endIndex)
  }, [
    pageOne.data,
    pageTwo.data,
    pageThree.data,
    startIndex,
    endIndex,
  ])

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-lime-600">
            {eyebrow}
          </p>

          <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">
            {title}
          </h2>

          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            {description}
          </p>
        </div>

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({
              length: endIndex - startIndex,
            }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl bg-[var(--border)]"
              />
            ))}
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-12 text-center">
            <p className="text-lg font-medium">
              More listings will appear here as the marketplace grows.
            </p>
          </div>
        )}
      </Container>
    </section>
  )
}
