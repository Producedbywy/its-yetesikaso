"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import {
  getMyJobs,
  type Job,
} from "@/lib/api/employer"

export default function EmployerManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadJobs(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const response = await getMyJobs()
      setJobs(response.results || [])
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your jobs"
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadJobs()
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="py-10">
          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-lime-600">
                Employer
              </p>

              <h1 className="text-4xl font-bold">
                Manage Jobs
              </h1>

              <p className="mt-1 text-sm text-[var(--muted)]">
                View, edit and manage your job postings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => loadJobs(true)}
                disabled={refreshing || loading}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium transition hover:opacity-80 disabled:opacity-50"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <Link
                href="/employer/jobs/create"
                className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-medium text-black transition hover:bg-lime-300"
              >
                + Post Job
              </Link>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
              <div className="h-32 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
              <div className="h-32 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
            </div>
          )}

          {/* EMPTY */}
          {!loading && jobs.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
              <h2 className="text-xl font-semibold">
                No jobs posted yet
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Create your first job posting to start finding candidates.
              </p>

              <Link
                href="/employer/jobs/create"
                className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
              >
                Post Your First Job
              </Link>
            </div>
          )}

          {/* JOBS */}
          {!loading && jobs.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-lime-600">
                        {job.category_display}
                      </p>

                      <h2 className="mt-1 text-xl font-semibold">
                        {job.title}
                      </h2>
                    </div>

                    <span className="shrink-0 rounded-full bg-[var(--background)] px-3 py-1 text-xs font-medium">
                      {job.status_display}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                    <p>
                      {job.location} • {job.workplace_type_display}
                    </p>

                    <p>
                      {job.employment_type_display}
                    </p>

                    <p className="font-medium text-[var(--foreground)]">
                      {job.salary_display}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
                    >
                      View job →
                    </Link>

                    <Link
                      href={`/employer/jobs/${job.id}/edit`}
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium transition hover:bg-[var(--background)]"
                    >
                      Manage
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}