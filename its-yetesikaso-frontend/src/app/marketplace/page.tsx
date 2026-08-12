"use client"

import { useState } from "react"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"
import ListingCard from "@/components/marketplace/listing-card"
import MobileStickySearch from "@/components/MobileStickySearch"
import MobileFilterModal from "@/components/MobileFilterModal"
import { useListings } from "@/lib/marketplace/useListings"

export default function MarketplacePage() {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    location: "all",
    sort: "newest",
  })

  const [page, setPage] = useState(1)

  const {
    data: listings = [],
    total = 0,
    loading = false,
  } = useListings(filters, page)

  function updateFilters(newFilters: Partial<typeof filters>) {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(1)
  }

  function resetFilters() {
    setFilters({
      search: "",
      category: "all",
      location: "all",
      sort: "newest",
    })
    setPage(1)
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <MobileStickySearch
        value={filters.search}
        onChange={(search) => {
          setPage(1)
          updateFilters({ search })
        }}
      />

      <MobileFilterModal
        filters={filters}
        onApply={(newFilters) => updateFilters(newFilters)}
      />

      {/* HERO */}
      <section className="border-b border-[var(--border)] bg-[var(--card)] py-10">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-lime-600">
                Marketplace
              </p>

              <h1 className="text-4xl font-bold md:text-6xl">
                Discover Listings
              </h1>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <input
                type="text"
                placeholder="Search listings..."
                value={filters.search}
                onChange={(e) =>
                  updateFilters({ search: e.target.value })
                }
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none"
              />

              <select
                value={filters.category}
                onChange={(e) =>
                  updateFilters({ category: e.target.value })
                }
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="vehicles">Vehicles</option>
                <option value="property">Property</option>
                <option value="fashion">Fashion</option>
                <option value="services">Services</option>
              </select>

              <select
                value={filters.location}
                onChange={(e) =>
                  updateFilters({ location: e.target.value })
                }
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none"
              >
                <option value="all">All Locations</option>
                <option value="accra">Accra</option>
                <option value="kumasi">Kumasi</option>
                <option value="tamale">Tamale</option>
              </select>
            </div>
          </div>
        </Container>
      </section>

      {/* CONTENT */}
      <section className="py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

            {/* SIDEBAR */}
            <aside className="hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 lg:block">
              <h3 className="mb-6 text-lg font-semibold">
                Filters
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="mb-3 font-medium">
                    Category
                  </p>

                  <div className="space-y-2 text-sm text-[var(--muted)]">
                    <button
                      onClick={() =>
                        updateFilters({ category: "all" })
                      }
                      className="block"
                    >
                      All Categories
                    </button>

                    <button
                      onClick={() =>
                        updateFilters({ category: "electronics" })
                      }
                      className="block"
                    >
                      Electronics
                    </button>

                    <button
                      onClick={() =>
                        updateFilters({ category: "vehicles" })
                      }
                      className="block"
                    >
                      Vehicles
                    </button>

                    <button
                      onClick={() =>
                        updateFilters({ category: "property" })
                      }
                      className="block"
                    >
                      Property
                    </button>

                    <button
                      onClick={() =>
                        updateFilters({ category: "fashion" })
                      }
                      className="block"
                    >
                      Fashion
                    </button>

                    <button
                      onClick={() =>
                        updateFilters({ category: "services" })
                      }
                      className="block"
                    >
                      Services
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-3 font-medium">
                    Price Range
                  </p>

                  <input
                    type="number"
                    placeholder="Min"
                    className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                  />

                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                  />
                </div>
              </div>
            </aside>

            {/* LISTINGS */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[var(--muted)]">
                  Showing {total} listings
                </p>

                <select
                  value={filters.sort}
                  onChange={(e) =>
                    updateFilters({ sort: e.target.value })
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="low">Lowest Price</option>
                  <option value="high">Highest Price</option>
                </select>
              </div>

              {/* LOADING */}
              {loading && listings.length === 0 && (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-80 animate-pulse rounded-3xl bg-[var(--border)]"
                    />
                  ))}
                </div>
              )}

              {listings.length > 0 && (
                <div className="relative">
                  {loading && (
                    <div className="absolute right-2 top-2 z-10 rounded-full bg-[var(--card)] px-3 py-1 text-xs text-[var(--muted)] shadow-sm">
                      Updating…
                    </div>
                  )}

                  <div
                    className={`grid gap-6 md:grid-cols-2 xl:grid-cols-3 transition-opacity ${
                      loading ? "opacity-60" : "opacity-100"
                    }`}
                  >
                    {listings.map((listing, i) => (
                      <div
                        key={listing.id}
                        className="animate-fadeIn"
                        style={{
                          animationDelay: `${i * 40}ms`,
                        }}
                      >
                        <ListingCard listing={listing} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMPTY STATE */}
              {!loading && listings.length === 0 && (
                <div className="py-24 text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[var(--border)]" />

                  <p className="text-lg font-medium text-[var(--foreground)]">
                    No listings found
                  </p>

                  <p className="text-sm text-[var(--muted)]">
                    Try changing your filters or search terms
                  </p>

                  <button
                    onClick={resetFilters}
                    className="mt-6 rounded-xl bg-black px-5 py-3 text-white"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* PAGINATION */}
              {!loading && total > 12 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 disabled:opacity-40"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                  >
                    Previous
                  </button>

                  <span className="text-sm text-[var(--muted)]">
                    Page {page}
                  </span>

                  <button
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2"
                    disabled={listings.length < 12}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
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