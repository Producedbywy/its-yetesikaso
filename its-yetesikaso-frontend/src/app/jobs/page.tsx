"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import MobileNav from "@/components/layout/mobile-nav"
import Container from "@/components/layout/container"
import { getJobs } from "@/lib/api/jobs"
import type { Job } from "@/types/job"

const categories = [
  { value: "all", label: "All categories" },
  { value: "technology", label: "Technology" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "construction", label: "Construction" },
  { value: "hospitality", label: "Hospitality" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
]

const employmentTypes = [
  { value: "all", label: "All types" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "internship", label: "Internship" },
  { value: "casual", label: "Casual" },
]

const workplaceTypes = [
  { value: "all", label: "All workplaces" },
  { value: "on_site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
]

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [employmentType, setEmploymentType] = useState("all")
  const [workplaceType, setWorkplaceType] = useState("all")

  async function loadJobs(filters?: {
    search?: string
    category?: string
    employmentType?: string
    workplaceType?: string
  }) {
    try {
      setLoading(true)
      setError(null)

      const response = await getJobs({
        search: filters?.search ?? "",
        category: filters?.category ?? category,
        employment_type:
          filters?.employmentType ?? employmentType,
        workplace_type:
          filters?.workplaceType ?? workplaceType,
      })

      setJobs(response.results || [])
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load jobs"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadInitialJobs() {
      try {
        const response = await getJobs({
          search: "",
          category: "all",
          employment_type: "all",
          workplace_type: "all",
        })

        if (!cancelled) {
          setJobs(response.results || [])
          setError(null)
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load jobs"
          )
          setLoading(false)
        }
      }
    }

    void loadInitialJobs()

    return () => {
      cancelled = true
    }
  }, [])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    void loadJobs({
      search,
      category,
      employmentType,
      workplaceType,
    })
  }

  function handleFilterChange(
    nextCategory: string,
    nextEmploymentType: string,
    nextWorkplaceType: string
  ) {
    setCategory(nextCategory)
    setEmploymentType(nextEmploymentType)
    setWorkplaceType(nextWorkplaceType)

    void loadJobs({
      search,
      category: nextCategory,
      employmentType: nextEmploymentType,
      workplaceType: nextWorkplaceType,
    })
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-20">
      <Navbar />

      {/* HERO */}
      <section className="border-b border-[var(--border)] bg-[var(--card)] py-12 md:py-16">
        <Container>
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-lime-600">
              Jobs
            </p>

            <h1 className="text-4xl font-bold md:text-6xl">
              Find your next opportunity
            </h1>

            <p className="mt-4 text-base text-[var(--muted)] md:text-lg">
              Discover jobs from employers across Ghana.
            </p>
          </div>

          {/* SEARCH */}
          <form
            onSubmit={handleSearch}
            className="mt-8 flex flex-col gap-3 md:flex-row"
          >
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search jobs..."
              className="min-h-12 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 outline-none transition focus:border-lime-400"
            />

            <button
              type="submit"
              className="min-h-12 rounded-xl bg-lime-400 px-6 font-medium text-black transition hover:bg-lime-300"
            >
              Search
            </button>
          </form>

          {/* FILTERS */}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select
              value={category}
              onChange={(event) =>
                handleFilterChange(
                  event.target.value,
                  employmentType,
                  workplaceType
                )
              }
              className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 outline-none"
            >
              {categories.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={employmentType}
              onChange={(event) =>
                handleFilterChange(
                  category,
                  event.target.value,
                  workplaceType
                )
              }
              className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 outline-none"
            >
              {employmentTypes.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={workplaceType}
              onChange={(event) =>
                handleFilterChange(
                  category,
                  employmentType,
                  event.target.value
                )
              }
              className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 outline-none"
            >
              {workplaceTypes.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </Container>
      </section>

      {/* MY APPLICATIONS */}
      <section className="border-b border-[var(--border)] bg-[var(--background)] py-5">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                Already applied for a job?
              </h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Track your applications and see their current status.
              </p>
            </div>

            <Link
              href="/applications"
              className="inline-flex w-fit rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--card)] hover:shadow-sm"
            >
              My Applications →
            </Link>
          </div>
        </Container>
      </section>

      {/* JOB LIST */}
      <section className="py-10 md:py-12">
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Available jobs
              </h2>

              {!loading && (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {jobs.length}{" "}
                  {jobs.length === 1 ? "job" : "jobs"} found
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
              {error}
            </div>
          )}

          {loading && (
            <div className="grid gap-5">
              <div className="h-48 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
              <div className="h-48 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
              <div className="h-48 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
              <h3 className="text-xl font-semibold">
                No jobs found
              </h3>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Try changing your search or filters.
              </p>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="grid gap-5">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700 dark:bg-lime-950 dark:text-lime-300">
                          {job.category_display}
                        </span>

                        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                          {job.workplace_type_display}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold md:text-2xl">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-lime-600">
                        {job.employer_name}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>
                          {job.employment_type_display}
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm text-[var(--muted)]">
                        {job.description}
                      </p>
                    </div>

                    <div className="shrink-0 md:text-right">
                      <p className="font-semibold">
                        {job.salary_display}
                      </p>

                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Posted {formatDate(job.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <Footer />
      <MobileNav />
    </main>
  )
}