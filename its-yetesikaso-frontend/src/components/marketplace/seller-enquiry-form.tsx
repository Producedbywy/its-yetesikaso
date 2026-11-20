
"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"

type Feedback = {
  type: "success" | "error"
  message: string
}

function getApiError(data: unknown): string {
  if (data && typeof data === "object") {
    const errors = data as Record<string, unknown>

    if (typeof errors.detail === "string") {
      return errors.detail
    }

    if (typeof errors.error === "string") {
      return errors.error
    }

    for (const [field, value] of Object.entries(errors)) {
      if (Array.isArray(value) && typeof value[0] === "string") {
        const label = field.replaceAll("_", " ")
        return `${label}: ${value[0]}`
      }
    }
  }

  return "We couldn't submit your enquiry. Please check your details."
}

const inputClass =
  "mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-lime-500 focus:ring-2 focus:ring-lime-300"

export default function SellerEnquiryForm() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      full_name: String(formData.get("full_name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      inquiry_type: String(formData.get("inquiry_type") || ""),
      message: String(formData.get("message") || "").trim(),
      website: String(formData.get("website") || ""),
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      setFeedback({
        type: "error",
        message: "The enquiry service is unavailable. Please try again later.",
      })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/seller-enquiries/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      const result: unknown = await response
        .json()
        .catch(() => null)

      if (!response.ok) {
        throw new Error(getApiError(result))
      }

      form.reset()

      setFeedback({
        type: "success",
        message:
          "Thank you! Your enquiry has been received successfully. Our team will review your message.",
      })
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "We couldn't submit your enquiry. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--border)] border-t-[5px] border-t-[var(--primary)] bg-[var(--card)] p-6 shadow-lg sm:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="seller-enquiry-name"
            className="text-sm font-semibold"
          >
            Full Name <span className="text-lime-600">*</span>
          </label>

          <input
            id="seller-enquiry-name"
            name="full_name"
            type="text"
            placeholder="Your full name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={150}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="seller-enquiry-email"
            className="text-sm font-semibold"
          >
            Email Address <span className="text-lime-600">*</span>
          </label>

          <input
            id="seller-enquiry-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            maxLength={254}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="seller-enquiry-phone"
            className="text-sm font-semibold"
          >
            Phone Number
          </label>

          <input
            id="seller-enquiry-phone"
            name="phone"
            type="tel"
            placeholder="+233 24 000 0000"
            autoComplete="tel"
            maxLength={30}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="seller-enquiry-type"
            className="text-sm font-semibold"
          >
            Inquiry Type <span className="text-lime-600">*</span>
          </label>

          <select
            id="seller-enquiry-type"
            name="inquiry_type"
            defaultValue=""
            required
            className={inputClass}
          >
            <option value="" disabled>
              Select an enquiry type
            </option>
            <option value="general">General Support</option>
            <option value="seller_account">
              Seller Account Setup
            </option>
            <option value="verification">
              Seller Verification
            </option>
            <option value="listings">Listings</option>
            <option value="logistics">
              Logistics &amp; Delivery
            </option>
            <option value="partnership">
              Partnership Enquiry
            </option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="seller-enquiry-message"
            className="text-sm font-semibold"
          >
            Your Message <span className="text-lime-600">*</span>
          </label>

          <textarea
            id="seller-enquiry-message"
            name="message"
            rows={5}
            placeholder="How can we help you?"
            required
            minLength={10}
            maxLength={3000}
            className={`${inputClass} resize-y`}
          />
        </div>
      </div>

      {/* Honeypot: hidden from real visitors */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="seller-enquiry-website">
          Website
        </label>
        <input
          id="seller-enquiry-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p className="mt-5 text-xs leading-5 text-[var(--muted)]">
        We use the information you provide to respond to your enquiry.
        See our{" "}
        <Link
          href="/privacy"
          className="font-semibold underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </p>

      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`mt-5 rounded-xl px-4 py-3 text-sm leading-6 ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-bold text-[#111827] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Sending enquiry..." : "Send Message"}
      </button>
    </form>
  )
}
