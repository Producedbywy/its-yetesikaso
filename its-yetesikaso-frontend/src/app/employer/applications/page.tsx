"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import MobileNav from "@/components/layout/mobile-nav"
import Container from "@/components/layout/container"

import {
  getEmployerApplications,
  updateApplicationStatus,
  type Application,
  type ApplicationStatus,
} from "@/lib/api/applications"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getStatusLabel(status: ApplicationStatus) {
  switch (status) {
    case "submitted":
      return "Submitted"
    case "reviewing":
      return "Under Review"
    case "shortlisted":
      return "Shortlisted"
    case "rejected":
      return "Rejected"
    case "accepted":
      return "Accepted"
    default:
      return status
  }
}

function getStatusClasses(status: ApplicationStatus) {
  switch (status) {
    case "submitted":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"

    case "reviewing":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"

    case "shortlisted":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"

    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"

    case "accepted":
      return "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300"

    default:
      return "bg-gray-100 text-gray-700"
  }
}

const statuses: ApplicationStatus[] = [
  "submitted",
  "reviewing",
  "shortlisted",
  "accepted",
  "rejected",
]

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadApplications() {
      try {
        const response = await getEmployerApplications()

        if (!cancelled) {
          setApplications(response.results || [])
          setError(null)
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load applications"
          )
          setLoading(false)
        }
      }
    }

    void loadApplications()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleStatusChange(
    applicationId: number,
    status: ApplicationStatus
  ) {
    try {
      setUpdatingId(applicationId)
      setError(null)

      const updated = await updateApplicationStatus(
        applicationId,
        status
      )

      setApplications((current) =>
        current.map((application) =>
          application.id === updated.id
            ? updated
            : application
        )
      )
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update application status"
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-20">
      <Navbar />

      {/* HEADER */}
      <section className="border-b border-[var(--border)] bg-[var(--card)] py-10 md:py-14">
        <Container>
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-lime-600">
              Employer
            </p>

            <h1 className="text-4xl font-bold md:text-5xl">
              Applications
            </h1>

            <p className="mt-3 text-base text-[var(--muted)] md:text-lg">
              Review applications for your jobs and manage candidate
              statuses.
            </p>
          </div>
        </Container>
      </section>

      {/* APPLICATIONS */}
      <section className="py-10 md:py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            {!loading && !error && (
              <div className="mb-6">
                <p className="text-sm text-[var(--muted)]">
                  {applications.length}{" "}
                  {applications.length === 1
                    ? "application"
                    : "applications"}
                </p>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="space-y-5">
                <div className="h-64 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
                <div className="h-64 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
                <div className="h-64 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
              </div>
            )}

            {/* EMPTY */}
            {!loading && !error && applications.length === 0 && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center md:p-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 text-2xl dark:bg-lime-950">
                  📋
                </div>

                <h2 className="mt-5 text-2xl font-bold">
                  No applications yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Applications submitted to your jobs will appear here.
                </p>

                <Link
                  href="/employer/jobs/manage"
                  className="mt-6 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
                >
                  Manage Jobs
                </Link>
              </div>
            )}

            {/* APPLICATION LIST */}
            {!loading && !error && applications.length > 0 && (
              <div className="space-y-5">
                {applications.map((application) => (
                  <article
                    key={application.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:-translate-y-0.5 hover:shadow-md md:p-7"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold md:text-2xl">
                            {application.job_title}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              application.status
                            )}`}
                          >
                            {getStatusLabel(
                              application.status
                            )}
                          </span>
                        </div>

                        <p className="mt-2 font-medium text-lime-600">
                          {application.applicant_name ||
                            application.applicant_username}
                        </p>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                          @{application.applicant_username}
                        </p>

                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Applied {formatDate(application.created_at)}
                        </p>
                      </div>

                      <Link
                        href={`/jobs/${application.job}`}
                        className="shrink-0 text-sm font-medium text-lime-600 hover:underline"
                      >
                        View Job →
                      </Link>
                    </div>

                    {/* COVER NOTE */}
                    <div className="mt-6 border-t border-[var(--border)] pt-5">
                      <p className="text-sm font-semibold">
                        Cover note
                      </p>

                      {application.cover_note ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">
                          {application.cover_note}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          No cover note provided.
                        </p>
                      )}
                    </div>

                    {/* STATUS */}
                    <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          Application status
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Update the candidate&apos;s current stage.
                        </p>
                      </div>

                      <select
                        value={application.status}
                        disabled={updatingId === application.id}
                        onChange={(event) =>
                          void handleStatusChange(
                            application.id,
                            event.target
                              .value as ApplicationStatus
                          )
                        }
                        className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-medium outline-none transition focus:border-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {statuses.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {getStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
                      <span>
                        Application #{application.id}
                      </span>

                      {application.updated_at !==
                        application.created_at && (
                        <span>
                          Updated{" "}
                          {formatDate(
                            application.updated_at
                          )}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      <Footer />
      <MobileNav />
    </main>
  )
}