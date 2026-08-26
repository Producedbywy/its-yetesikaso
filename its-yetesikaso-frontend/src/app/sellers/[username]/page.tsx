import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, ArrowLeft, Store } from "lucide-react"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"
import ListingCard from "@/components/marketplace/listing-card"

import { getPublicSellerProfile } from "@/lib/api/seller"

export default async function PublicSellerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const decodedUsername = decodeURIComponent(username)

  let data

  try {
    data = await getPublicSellerProfile(decodedUsername)
  } catch (error) {
    console.error("Failed to load public seller profile:", error)
    notFound()
  }

  const { seller, listings } = data

  const initial =
    seller.display_name?.charAt(0).toUpperCase() ||
    seller.username?.charAt(0).toUpperCase() ||
    "S"

  const memberSince = seller.created_at
    ? new Date(seller.created_at).toLocaleDateString("en-GH", {
        month: "long",
        year: "numeric",
      })
    : ""

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="py-8 sm:py-10">
        <Container>
          <div className="mx-auto max-w-6xl">
            {/* BACK */}
            <Link
              href="/marketplace"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to marketplace
            </Link>

            {/* SELLER HEADER */}
            <div className="mb-10 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  {/* AVATAR */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-lime-100 text-3xl font-bold text-lime-700">
                    {initial}
                  </div>

                  {/* SELLER INFO */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {seller.display_name || seller.username}
                      </h1>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-700">
                        <Store className="h-3.5 w-3.5" />
                        Seller
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
                      {seller.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {seller.location}
                        </span>
                      )}

                      <span>
                        {seller.listing_count}{" "}
                        {seller.listing_count === 1
                          ? "listing"
                          : "listings"}
                      </span>

                      {memberSince && (
                        <span>
                          Member since {memberSince}
                        </span>
                      )}
                    </div>

                    {seller.bio && (
                      <p className="mt-5 max-w-3xl leading-7 text-[var(--muted)]">
                        {seller.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* LISTINGS */}
            <div>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    Seller&apos;s listings
                  </h2>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Browse items currently available from{" "}
                    {seller.display_name || seller.username}.
                  </p>
                </div>

                <span className="hidden text-sm text-[var(--muted)] sm:block">
                  {listings.length}{" "}
                  {listings.length === 1
                    ? "listing"
                    : "listings"}
                </span>
              </div>

              {listings.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
                  <Store className="mx-auto mb-4 h-10 w-10 text-[var(--muted)]" />

                  <h3 className="text-lg font-semibold">
                    No active listings
                  </h3>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    This seller does not currently have any
                    available listings.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  )
}