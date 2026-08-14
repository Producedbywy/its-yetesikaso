"use client"

import { FormEvent, useState } from "react"

import {
  applyToJob,
} from "@/lib/api/applications"

type ApplyToJobProps = {
  jobId: number
}

export default function ApplyToJob({
  jobId,
}: ApplyToJobProps) {
  const [open, setOpen] = useState(false)
  const [coverNote, setCoverNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setSubmitting(true)
    setError("")

    try {
      await applyToJob(jobId, coverNote)

      setSuccess(true)
      setCoverNote("")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your application."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-lime-300 bg-lime-50 p-5 dark:border-lime-800 dark:bg-lime-950">
        <h3 className="font-semibold text-lime-800 dark:text-lime-200">
          Application submitted
        </h3>

        <p className="mt-2 text-sm text-lime-700 dark:text-lime-300">
          Your application has been sent to the employer.
        </p>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl bg-lime-400 px-5 py-3 font-semibold text-black transition hover:bg-lime-300"
      >
        Apply for this job
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-bold">
        Apply for this job
      </h2>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Send the employer a short note with your application.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-4"
      >
        <div>
          <label
            htmlFor="cover-note"
            className="text-sm font-medium"
          >
            Cover note
          </label>

          <textarea
            id="cover-note"
            value={coverNote}
            onChange={(event) =>
              setCoverNote(event.target.value)
            }
            maxLength={3000}
            rows={6}
            placeholder="Tell the employer why you're interested in this role..."
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-lime-500"
          />

          <p className="mt-1 text-right text-xs text-[var(--muted)]">
            {coverNote.length}/3000
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Submitting..."
              : "Submit application"}
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setError("")
            }}
            disabled={submitting}
            className="rounded-xl border border-[var(--border)] px-5 py-3 font-medium transition hover:bg-[var(--background)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}