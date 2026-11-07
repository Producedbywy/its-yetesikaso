
"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search, MapPin, BriefcaseBusiness } from "lucide-react"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"
import ListingCard from "@/components/marketplace/listing-card"

import { useListings } from "@/lib/marketplace/useListings"
import { getJobs, type Job } from "@/lib/api/jobs"

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Suspense
        fallback={
          <Container>
            <div className="py-16 text-center text-[var(--muted)]">
              Loading search...
            </div>
          </Container>
        }
      >
        <SearchPageContent />
      </Suspense>

      <Footer />
    </main>
  )
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = (searchParams.get("q") || "").trim()

  return (
    <Container>
      <section className="py-10 md:py-14">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-lime-600">
            Yetesikaso Search
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Search Results
          </h1>

          {query ? (
            <p className="mt-3 text-[var(--muted)]">
              Showing results for{" "}
              <span className="font-semibold text-[var(--foreground)]">
                &ldquo;{query}&rdquo;
              </span>
            </p>
          ) : (
            <p className="mt-3 text-[var(--muted)]">
              Search products, property, vehicles and jobs across Yetesikaso.
            </p>
          )}
        </div>

        {query ? (
          <SearchResults key={query} query={query} />
        ) : (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-lime-600" />
            <h2 className="text-xl font-semibold">
              What are you looking for?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Enter a search term using the global search bar.
            </p>
          </div>
        )}
      </section>
    </Container>
  )
}

function SearchResults({ query }: { query: string }) {
  const {
    data: listings,
    total: listingTotal,
    loading: listingsLoading,
    error: listingsError,
  } = useListings(
    {
      search: query,
      category: "all",
      location: "all",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    },
    1
  )

  const [jobs, setJobs] = useState<Job[]>([])
  const [jobTotal, setJobTotal] = useState(0)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchJobs() {
      try {
        setJobsLoading(true)
        setJobsError(null)

        const response = await getJobs({
          search: query,
          page: 1,
          page_size: 6,
        })

        if (cancelled) return

        setJobs(response.results || [])
        setJobTotal(response.total || 0)
      } catch (err: unknown) {
        if (cancelled) return

        setJobsError(
          err instanceof Error
            ? err.message
            : "Failed to search jobs"
        )
      } finally {
        if (!cancelled) {
          setJobsLoading(false)
        }
      }
    }

    void fetchJobs()

    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <div className="space-y-14">
      {/* MARKETPLACE RESULTS */}
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">
              Marketplace
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Products, property, vehicles and other listings
            </p>
          </div>

          {!listingsLoading && !listingsError && (
            <span className="text-sm text-[var(--muted)]">
              {listingTotal} results
            </span>
          )}
        </div>

        {listingsLoading && (
          <p className="py-6 text-[var(--muted)]">
            Searching marketplace...
          </p>
        )}

        {listingsError && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {listingsError}
          </p>
        )}

        {!listingsLoading &&
          !listingsError &&
          listings.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
              No marketplace listings match your search.
            </div>
          )}

        {!listingsLoading && !listingsError && listings.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </div>

            {listingTotal > listings.length && (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Showing the first {listings.length} marketplace results.
              </p>
            )}
          </>
        )}
      </section>

      {/* JOB RESULTS */}
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">
              Jobs
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Employment and career opportunities
            </p>
          </div>

          {!jobsLoading && !jobsError && (
            <span className="text-sm text-[var(--muted)]">
              {jobTotal} results
            </span>
          )}
        </div>

        {jobsLoading && (
          <p className="py-6 text-[var(--muted)]">
            Searching jobs...
          </p>
        )}

        {jobsError && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {jobsError}
          </p>
        )}

        {!jobsLoading && !jobsError && jobs.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
            No jobs match your search.
          </div>
        )}

        {!jobsLoading && !jobsError && jobs.length > 0 && (
          <>
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-lime-400 hover:shadow-md md:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                      <BriefcaseBusiness size={24} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-lime-600">
                        {job.employer_name}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <MapPin size={15} />
                          {job.location}
                        </span>

                        <span>
                          {job.employment_type_display}
                        </span>

                        <span>
                          {job.salary_display}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {jobTotal > jobs.length && (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Showing the first {jobs.length} job results.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
