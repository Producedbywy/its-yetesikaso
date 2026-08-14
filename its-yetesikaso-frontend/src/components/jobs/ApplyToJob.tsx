"use client"

import {
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react"

import {
  applyToJob,
} from "@/lib/api/applications"

type ApplyToJobProps = {
  jobId: number
}

const MAX_CV_SIZE = 5 * 1024 * 1024

const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export default function ApplyToJob({
  jobId,
}: ApplyToJobProps) {
  const [open, setOpen] = useState(false)
  const [coverNote, setCoverNote] = useState("")
  const [cv, setCv] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleCvChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setError("")

    if (!ALLOWED_CV_TYPES.includes(file.type)) {
      setError(
        "CV must be a PDF, DOC, or DOCX file."
      )

      event.target.value = ""
      return
    }

    if (file.size > MAX_CV_SIZE) {
      setError("CV must be smaller than 5MB.")

      event.target.value = ""
      return
    }

    setCv(file)
  }

  function removeCv() {
    setCv(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!coverNote.trim() && !cv) {
      setError(
        "Please provide a cover note or upload a CV."
      )
      return
    }

    setSubmitting(true)
    setError("")

    try {
      await applyToJob(
        jobId,
        coverNote,
        cv
      )

      setSuccess(true)
      setCoverNote("")
      setCv(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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
      <div className="rounded-2xl border border-lime-300 bg-lime-50 p-6 dark:border-lime-800 dark:bg-lime-950">
        <h3 className="text-lg font-semibold text-lime-800 dark:text-lime-200">
          Application submitted
        </h3>

        <p className="mt-2 text-sm leading-6 text-lime-700 dark:text-lime-300">
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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-7">
      <div>
        <h2 className="text-xl font-bold">
          Apply for this job
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Complete your application below. You can include a
          cover note, upload your CV, or provide both.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-7"
      >
        <div>
          <label
            htmlFor="cover-note"
            className="text-sm font-semibold"
          >
            Cover note
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Introduce yourself and explain why You&apos;re a good
            fit for the role.
          </p>

          <textarea
            id="cover-note"
            value={coverNote}
            onChange={(event) =>
              setCoverNote(event.target.value)
            }
            maxLength={3000}
            rows={12}
            placeholder="Dear Hiring Manager,

I am interested in this position because...

Please tell the employer about your experience, relevant skills, and why you would be a good fit."
            className="mt-3 min-h-[260px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm leading-6 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
          />

          <div className="mt-2 flex justify-end text-xs text-[var(--muted)]">
            {coverNote.length}/3000
          </div>
        </div>

        <div>
          <label
            htmlFor="cv-upload"
            className="text-sm font-semibold"
          >
            CV / Resume
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Upload your CV as a PDF, DOC, or DOCX file.
            Maximum file size: 5MB.
          </p>

          {!cv ? (
            <label
              htmlFor="cv-upload"
              className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--background)] px-6 py-10 text-center transition hover:border-lime-500 hover:bg-lime-50/50 dark:hover:bg-lime-950/20"
            >
              <span className="text-sm font-semibold">
                Upload your CV
              </span>

              <span className="mt-1 text-xs text-[var(--muted)]">
                PDF, DOC or DOCX · Up to 5MB
              </span>

              <input
                ref={fileInputRef}
                id="cv-upload"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleCvChange}
                className="sr-only"
              />
            </label>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {cv.name}
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  {(cv.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                onClick={removeCv}
                disabled={submitting}
                className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--card)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="border-t border-[var(--border)] pt-5">
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setError("")
              }}
              disabled={submitting}
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-medium transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting application..."
                : "Submit application"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}