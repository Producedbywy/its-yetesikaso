"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"

import Container from "@/components/layout/container"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import ListingCard from "@/components/listings/ListingCard"

import type { Listing } from "@/types/listing"
import { getMyFavourites } from "@/lib/api/favourites"

export default function SavedPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadFavourites() {
      try {
        const response = await getMyFavourites()
        setListings(response.results)
      } catch (err) {
        console.error("Failed to load saved listings:", err)
        setError("Unable to load your saved listings.")
      } finally {
        setLoading(false)
      }
    }

    loadFavourites()
  }, [])

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="py-8 sm:py-10">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Saved Listings
            </h1>

            <p className="mt-2 text-[var(--muted)]">
              Listings you have saved for later.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[var(--muted)]">
              Loading saved listings...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-12 text-center">
              <p className="font-medium">{error}</p>

              <Link
                href="/marketplace"
                className="mt-5 inline-block rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-80 dark:bg-white dark:text-black"
              >
                Browse Listings
              </Link>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--background)]">
                <Heart className="h-6 w-6 text-[var(--muted)]" />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No saved listings yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
                When you find something you like, tap the heart to save it
                here.
              </p>

              <Link
                href="/marketplace"
                className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-80 dark:bg-white dark:text-black"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      <Footer />
    </main>
  )
}