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
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  })

  const [page, setPage] = useState(1)

  const {
    data: listings = [],
    total = 0,
    loading = false,
  } = useListings(filters, page)

  function updateFilters(
    newFilters: Partial<typeof filters>
  ) {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))

    setPage(1)
  }

  function resetFilters() {
    setFilters({
      search: "",
      category: "all",
      location: "all",
      minPrice: "",
      maxPrice: "",
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
          updateFilters({ search })
        }}
      />

      <MobileFilterModal
        filters={filters}
        onApply={(newFilters) =>
          updateFilters(newFilters)
        }
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
                  updateFilters({
                    search: e.target.value,
                  })
                }
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
              />

              <select
                value={filters.category}
                onChange={(e) =>
                  updateFilters({
                    category: e.target.value,
                  })
                }
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="all">
                  All Categories
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

              <select
                value={filters.location}
                onChange={(e) =>
                  updateFilters({
                    location: e.target.value,
                  })
                }
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="all">
                  All Locations
                </option>

                <option value="accra">
                  Accra
                </option>

                <option value="kumasi">
                  Kumasi
                </option>

                <option value="tamale">
                  Tamale
                </option>
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
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Filters
                </h3>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-6">

                {/* CATEGORY */}
                <div>
                  <p className="mb-3 font-medium">
                    Category
                  </p>

                  <div className="space-y-2 text-sm text-[var(--muted)]">
                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "all",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "all"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      All Categories
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "property_land",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "property_land"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Property & Land
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "vehicles",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "vehicles"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Vehicles
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "phones_tablets",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "phones_tablets"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Phones & Tablets
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "computers_office",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "computers_office"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Computers & Office
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "electronics_appliances",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "electronics_appliances"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Electronics & Appliances
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "home_garden",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "home_garden"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Home & Garden
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "fashion",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "fashion"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Fashion
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "baby_kids",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "baby_kids"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Baby & Kids
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "health_beauty",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "health_beauty"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Health & Beauty
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "sports_fitness",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "sports_fitness"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Sports & Fitness
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "business_industrial",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "business_industrial"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Business & Industrial
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "education",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "education"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Education
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "food_agriculture",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "food_agriculture"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Food & Agriculture
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "services",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "services"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Services
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: "other",
                        })
                      }
                      className={`block transition hover:text-[var(--foreground)] ${
                        filters.category === "other"
                          ? "font-semibold text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      Other
                    </button>
                  </div>
                </div>

                {/* LOCATION */}
                <div>
                  <p className="mb-3 font-medium">
                    Location
                  </p>

                  <select
                    value={filters.location}
                    onChange={(e) =>
                      updateFilters({
                        location: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <option value="all">
                      All Locations
                    </option>

                    <option value="accra">
                      Accra
                    </option>

                    <option value="kumasi">
                      Kumasi
                    </option>

                    <option value="tamale">
                      Tamale
                    </option>
                  </select>
                </div>

                {/* PRICE RANGE */}
                <div>
                  <p className="mb-3 font-medium">
                    Price Range
                  </p>

                  <input
                    type="number"
                    min="0"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) =>
                      updateFilters({
                        minPrice: e.target.value,
                      })
                    }
                    className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:ring-2 focus:ring-lime-400"
                  />

                  <input
                    type="number"
                    min="0"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      updateFilters({
                        maxPrice: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>

              </div>
            </aside>

            {/* LISTINGS */}
            <div>
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-[var(--muted)]">
                  Showing {total} listings
                </p>

                <select
                  value={filters.sort}
                  onChange={(e) =>
                    updateFilters({
                      sort: e.target.value,
                    })
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2"
                >
                  <option value="newest">
                    Newest First
                  </option>

                  <option value="low">
                    Lowest Price
                  </option>

                  <option value="high">
                    Highest Price
                  </option>
                </select>
              </div>

              {/* LOADING */}
              {loading && listings.length === 0 && (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="h-80 animate-pulse rounded-3xl bg-[var(--border)]"
                      />
                    )
                  )}
                </div>
              )}

              {/* LISTINGS */}
              {listings.length > 0 && (
                <div className="relative">
                  {loading && (
                    <div className="absolute right-2 top-2 z-10 rounded-full bg-[var(--card)] px-3 py-1 text-xs text-[var(--muted)] shadow-sm">
                      Updating…
                    </div>
                  )}

                  <div
                    className={`grid gap-6 transition-opacity md:grid-cols-2 xl:grid-cols-3 ${
                      loading
                        ? "opacity-60"
                        : "opacity-100"
                    }`}
                  >
                    {listings.map(
                      (listing, i) => (
                        <div
                          key={listing.id}
                          className="animate-fadeIn"
                          style={{
                            animationDelay: `${i * 40}ms`,
                          }}
                        >
                          <ListingCard
                            listing={listing}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ERROR */}
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
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 rounded-xl bg-black px-5 py-3 text-white transition hover:opacity-80"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* PAGINATION */}
              {!loading && total > 12 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 disabled:opacity-40"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((p) =>
                        Math.max(1, p - 1)
                      )
                    }
                  >
                    Previous
                  </button>

                  <span className="text-sm text-[var(--muted)]">
                    Page {page}
                  </span>

                  <button
                    type="button"
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 disabled:opacity-40"
                    disabled={listings.length < 12}
                    onClick={() =>
                      setPage((p) => p + 1)
                    }
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