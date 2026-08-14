"use client"

import { FormEvent, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import {
  getEmployerJob,
  updateEmployerJob,
  deleteEmployerJob,
  type Job,
} from "@/lib/api/employer"

const categories = [
  ["technology", "Technology"],
  ["sales", "Sales"],
  ["marketing", "Marketing"],
  ["finance", "Finance"],
  ["construction", "Construction"],
  ["hospitality", "Hospitality"],
  ["healthcare", "Healthcare"],
  ["education", "Education"],
  ["transport", "Transport"],
  ["other", "Other"],
]

const employmentTypes = [
  ["full_time", "Full-time"],
  ["part_time", "Part-time"],
  ["contract", "Contract"],
  ["temporary", "Temporary"],
  ["internship", "Internship"],
  ["casual", "Casual"],
]

const workplaceTypes = [
  ["on_site", "On-site"],
  ["hybrid", "Hybrid"],
  ["remote", "Remote"],
]

export default function EmployerJobEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const jobId = Number(params.id)
  const validJobId = Number.isFinite(jobId)

  const [job, setJob] = useState<Job | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("technology")
  const [location, setLocation] = useState("")
  const [employmentType, setEmploymentType] = useState("full_time")
  const [workplaceType, setWorkplaceType] = useState("on_site")
  const [salaryMin, setSalaryMin] = useState("")
  const [salaryMax, setSalaryMax] = useState("")
  const [requirements, setRequirements] = useState("")
  const [status, setStatus] = useState("active")

  const [loading, setLoading] = useState(validJobId)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [error, setError] = useState<string | null>(
    validJobId ? null : "Invalid job ID."
  )
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!validJobId) {
      return
    }

    let cancelled = false

    async function loadJob() {
      try {
        const response = await getEmployerJob(jobId)

        if (cancelled) {
          return
        }

        setJob(response)

        setTitle(response.title)
        setDescription(response.description)
        setCategory(response.category)
        setLocation(response.location)
        setEmploymentType(response.employment_type)
        setWorkplaceType(response.workplace_type)
        setSalaryMin(response.salary_min ?? "")
        setSalaryMax(response.salary_max ?? "")
        setRequirements(response.requirements)
        setStatus(response.status)
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load job"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadJob()

    return () => {
      cancelled = true
    }
  }, [jobId, validJobId])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError(null)
    setSuccess(null)

    if (!title.trim()) {
      setError("Job title is required.")
      return
    }

    if (!description.trim()) {
      setError("Job description is required.")
      return
    }

    if (!location.trim()) {
      setError("Location is required.")
      return
    }

    if (
      salaryMin &&
      salaryMax &&
      Number(salaryMin) > Number(salaryMax)
    ) {
      setError(
        "Minimum salary cannot be greater than maximum salary."
      )
      return
    }

    try {
      setSaving(true)

      const updatedJob = await updateEmployerJob(jobId, {
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        employment_type: employmentType,
        workplace_type: workplaceType,
        salary_min: salaryMin || null,
        salary_max: salaryMax || null,
        requirements: requirements.trim(),
        status,
      })

      setJob(updatedJob)
      setSuccess("Job updated successfully.")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update job"
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job? This cannot be undone."
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)
      setError(null)

      await deleteEmployerJob(jobId)

      router.push("/employer/dashboard")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete job"
      )
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />

        <Container>
          <div className="py-10">
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="h-10 w-64 animate-pulse rounded-xl bg-[var(--card)]" />
              <div className="h-8 animate-pulse rounded-xl bg-[var(--card)]" />
              <div className="h-[600px] animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
            </div>
          </div>
        </Container>
      </main>
    )
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />

        <Container>
          <div className="py-20 text-center">
            <h1 className="text-2xl font-bold">
              Job not found
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              We couldn&apos;t load this job.
            </p>

            <Link
              href="/employer/dashboard"
              className="mt-6 inline-block rounded-xl bg-lime-400 px-5 py-2.5 font-medium text-black"
            >
              Back to Dashboard
            </Link>
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="mx-auto max-w-3xl py-10">
          <div className="mb-8">
            <Link
              href="/employer/dashboard"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ← Back to employer dashboard
            </Link>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-lime-600">
                  Manage Job
                </p>

                <h1 className="mt-1 text-4xl font-bold">
                  {job.title}
                </h1>
              </div>

              <span className="w-fit rounded-full bg-[var(--card)] px-3 py-1.5 text-sm font-medium">
                {job.status_display}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Job Title
              </label>

              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={7}
                className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-lime-500"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-lime-500"
                >
                  {categories.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Location
                </label>

                <input
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-lime-500"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Employment Type
                </label>

                <select
                  value={employmentType}
                  onChange={(event) =>
                    setEmploymentType(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-lime-500"
                >
                  {employmentTypes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Workplace Type
                </label>

                <select
                  value={workplaceType}
                  onChange={(event) =>
                    setWorkplaceType(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-lime-500"
                >
                  {workplaceTypes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Salary
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(event) =>
                    setSalaryMin(event.target.value)
                  }
                  placeholder="Minimum salary"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-lime-500"
                />

                <input
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(event) =>
                    setSalaryMax(event.target.value)
                  }
                  placeholder="Maximum salary"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-lime-500"
                />
              </div>

              <p className="mt-2 text-xs text-[var(--muted)]">
                Leave both fields empty if salary is negotiable.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Requirements
              </label>

              <textarea
                value={requirements}
                onChange={(event) =>
                  setRequirements(event.target.value)
                }
                rows={5}
                className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-lime-500"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="rounded-xl border border-red-200 px-5 py-3 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Job"}
              </button>

              <div className="flex gap-3">
                <Link
                  href="/employer/dashboard"
                  className="rounded-xl border border-[var(--border)] px-5 py-3 font-medium transition hover:bg-[var(--background)]"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Container>
    </main>
  )
}