"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import { createJob } from "@/lib/api/employer"

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

export default function CreateJobPage() {
  const router = useRouter()

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

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)

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
      setError("Minimum salary cannot be greater than maximum salary.")
      return
    }

    try {
      setSubmitting(true)

      const job = await createJob({
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

      router.push(`/employer/jobs/${job.id}/edit`)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create job"
      )
    } finally {
      setSubmitting(false)
    }
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

            <h1 className="mt-4 text-4xl font-bold">
              Post a Job
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Create a job listing and start finding candidates.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8"
          >
            {/* TITLE */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Job title
              </label>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            {/* DESCRIPTION */}
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
                placeholder="Describe the role, responsibilities and what the successful candidate will do."
                className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            {/* CATEGORY + LOCATION */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
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
                  placeholder="e.g. Accra"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
            </div>

            {/* EMPLOYMENT + WORKPLACE */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Employment type
                </label>

                <select
                  value={employmentType}
                  onChange={(event) =>
                    setEmploymentType(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
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
                  Workplace
                </label>

                <select
                  value={workplaceType}
                  onChange={(event) =>
                    setWorkplaceType(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
                >
                  {workplaceTypes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SALARY */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Salary
              </label>

              <p className="mb-3 text-xs text-[var(--muted)]">
                Leave both fields empty if the salary is negotiable.
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <input
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(event) =>
                    setSalaryMin(event.target.value)
                  }
                  placeholder="Minimum salary"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
                />

                <input
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(event) =>
                    setSalaryMax(event.target.value)
                  }
                  placeholder="Maximum salary"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
            </div>

            {/* REQUIREMENTS */}
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
                placeholder="Experience, qualifications, skills or other requirements."
                className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Publishing status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="active">
                  Publish immediately
                </option>

                <option value="draft">
                  Save as draft
                </option>
              </select>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/employer/dashboard"
                className="rounded-xl border border-[var(--border)] px-5 py-3 text-center text-sm font-medium transition hover:bg-[var(--background)]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Job"}
              </button>
            </div>
          </form>
        </div>
      </Container>
    </main>
  )
}