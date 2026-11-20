"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  MailCheck,
  XCircle,
} from "lucide-react"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"

import { confirmBuyerEmail } from "@/lib/api/buyer-registration"

type VerificationStatus =
  | "checking"
  | "success"
  | "error"

export default function VerifyBuyerEmailPage() {
  const [status, setStatus] =
    useState<VerificationStatus>("checking")

  const [message, setMessage] = useState(
    "We're confirming your email address."
  )

  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return

    attempted.current = true

    const params = new URLSearchParams(
      window.location.search
    )

    const token = params.get("token")

    if (!token) {
      setStatus("error")
      setMessage(
        "This verification link is missing its confirmation token."
      )
      return
    }

    async function verify() {
      try {
        const response = await confirmBuyerEmail(
          token as string
        )

        setStatus("success")
        setMessage(
          response.message ||
            "Your email has been verified successfully."
        )
      } catch (error: unknown) {
        setStatus("error")

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify your email address."
        )
      } finally {
        // Remove the token from the address bar.
        if (
          window.location.pathname ===
          "/verify-buyer-email"
        ) {
          window.history.replaceState(
            null,
            "",
            "/verify-buyer-email"
          )
        }
      }
    }

    verify()
  }, [])

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="flex min-h-[75vh] items-center py-16">
        <Container>
          <div className="mx-auto max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm sm:p-12">
            {status === "checking" && (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lime-100 text-lime-800">
                  <MailCheck
                    size={38}
                    className="animate-pulse"
                  />
                </div>

                <h1 className="mt-7 text-3xl font-bold">
                  Verifying your email
                </h1>

                <p
                  className="mt-4 leading-7 text-[var(--muted)]"
                  aria-live="polite"
                >
                  {message}
                </p>

                <div className="mx-auto mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-[var(--border)]">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--primary)]" />
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lime-100 text-lime-800">
                  <CheckCircle2 size={42} />
                </div>

                <h1 className="mt-7 text-3xl font-bold">
                  Your account is ready!
                </h1>

                <p
                  className="mt-4 leading-7 text-[var(--muted)]"
                  aria-live="polite"
                >
                  {message}
                </p>

                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  You can now log in to Yetesikaso
                  using your email address and password.
                </p>

                <Link
                  href="/login/buyer"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-4 font-bold text-gray-950"
                >
                  Log In to Yetesikaso
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <XCircle size={42} />
                </div>

                <h1 className="mt-7 text-3xl font-bold">
                  Verification unsuccessful
                </h1>

                <p
                  className="mt-4 leading-7 text-[var(--muted)]"
                  aria-live="polite"
                >
                  {message}
                </p>

                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Your link may have expired.
                  You can request another confirmation
                  email from the registration page
                  once the service is enabled.
                </p>

                <Link
                  href="/support"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-4 font-bold text-gray-950"
                >
                  Contact Support
                </Link>
              </>
            )}
          </div>
        </Container>
      </section>
    </main>
  )
}
