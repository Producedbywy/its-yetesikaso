"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import {
  getMyEmployerProfile,
  getMyJobs,
  type EmployerProfile,
  type Job,
} from "@/lib/api/employer"
import {
  getEmployerApplications,
  type Application,
} from "@/lib/api/applications"

function getStatusClasses(status: Application["status"]) {
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

function getStatusLabel(status: Application["status"]) {
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function EmployerDashboardPage() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadDashboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const [
        profileResponse,
        jobsResponse,
        applicationsResponse,
      ] = await Promise.all([
        getMyEmployerProfile(),
        getMyJobs(),
        getEmployerApplications(),
      ])

      setProfile(profileResponse)
      setJobs(jobsResponse.results || [])
      setApplications(applicationsResponse.results || [])
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load employer dashboard"
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadInitialDashboard() {
      try {
        const [
          profileResponse,
          jobsResponse,
          applicationsResponse,
        ] = await Promise.all([
          getMyEmployerProfile(),
          getMyJobs(),
          getEmployerApplications(),
        ])

        if (!cancelled) {
          setProfile(profileResponse)
          setJobs(jobsResponse.results || [])
          setApplications(applicationsResponse.results || [])
          setError(null)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load employer dashboard"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadInitialDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  const activeJobs = jobs.filter(
    (job) => job.status === "active"
  ).length

  const draftJobs = jobs.filter(
    (job) => job.status === "draft"
  ).length

  const closedJobs = jobs.filter(
    (job) => job.status === "closed"
  ).length

  const recentApplications = applications.slice(0, 5)

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
                {profile?.display_name || "Employer Dashboard"}
              </h1>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Manage your company profile, job postings and applications
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing || loading}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <Link
                href="/employer/applications"
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--background)]"
              >
                Applications
              </Link>

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
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded-2xl border bg-[var(--card)]" />
              <div className="h-24 animate-pulse rounded-2xl border bg-[var(--card)]" />
              <div className="h-24 animate-pulse rounded-2xl border bg-[var(--card)]" />
            </div>
          )}

          {/* DASHBOARD */}
          {!loading && (
            <>
              {/* PROFILE CARD */}
              <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--muted)]">
                      Company / Employer Profile
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {profile?.display_name || profile?.username}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
                      {profile?.location && (
                        <span>{profile.location}</span>
                      )}

                      {profile?.email && (
                        <span>{profile.email}</span>
                      )}

                      {profile?.phone && (
                        <span>{profile.phone}</span>
                      )}
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--background)]"
                  >
                    Edit Profile
                  </Link>
                </div>

                {profile?.bio && (
                  <p className="mt-5 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                    {profile.bio}
                  </p>
                )}
              </section>

              {/* STATS */}
              <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="text-sm text-[var(--muted)]">
                    Total Jobs
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {jobs.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="text-sm text-[var(--muted)]">
                    Active
                  </p>

                  <p className="mt-2 text-3xl font-bold text-lime-500">
                    {activeJobs}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="text-sm text-[var(--muted)]">
                    Drafts
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {draftJobs}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="text-sm text-[var(--muted)]">
                    Closed
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {closedJobs}
                  </p>
                </div>

                <Link
                  href="/employer/applications"
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm text-[var(--muted)]">
                    Applications
                  </p>

                  <p className="mt-2 text-3xl font-bold text-lime-500">
                    {applications.length}
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    View candidates →
                  </p>
                </Link>
              </section>

              {/* APPLICATIONS */}
              <section className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Recent Applications
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Review the latest candidates who applied for your jobs.
                    </p>
                  </div>

                  {applications.length > 0 && (
                    <Link
                      href="/employer/applications"
                      className="text-sm font-medium text-lime-600 hover:underline"
                    >
                      View all
                    </Link>
                  )}
                </div>

                {applications.length === 0 ? (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
                    <h3 className="text-lg font-semibold">
                      No applications yet
                    </h3>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Applications from job seekers will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentApplications.map((application) => (
                      <Link
                        key={application.id}
                        href="/employer/applications"
                        className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <h3 className="font-semibold">
                              {application.applicant_name ||
                                application.applicant_username}
                            </h3>

                            <p className="mt-1 text-sm font-medium text-lime-600">
                              {application.job_title}
                            </p>

                            <p className="mt-1 text-xs text-[var(--muted)]">
                              Applied {formatDate(application.created_at)}
                            </p>
                          </div>

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              application.status
                            )}`}
                          >
                            {getStatusLabel(application.status)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* JOBS */}
              <section>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Your Job Posts
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Manage the jobs you have posted.
                    </p>
                  </div>

                  {jobs.length > 0 && (
                    <Link
                      href="/employer/jobs"
                      className="text-sm font-medium text-lime-600 hover:underline"
                    >
                      View all
                    </Link>
                  )}
                </div>

                {jobs.length === 0 ? (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
                    <h3 className="text-lg font-semibold">
                      No jobs posted yet
                    </h3>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Post your first job to start finding candidates.
                    </p>

                    <Link
                      href="/employer/jobs/create"
                      className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-2.5 font-medium text-black transition hover:bg-lime-300"
                    >
                      Post Your First Job
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-lime-600">
                              {job.category_display}
                            </p>

                            <h3 className="mt-1 text-xl font-semibold">
                              {job.title}
                            </h3>
                          </div>

                          <span className="rounded-full bg-[var(--background)] px-3 py-1 text-xs font-medium">
                            {job.status_display}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                          <p>
                            {job.location} •{" "}
                            {job.workplace_type_display}
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
                            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
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
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </Container>
    </main>
  )
}