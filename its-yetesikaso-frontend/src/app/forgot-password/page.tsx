"use client"

import Link from "next/link"
import { useState } from "react"
import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import { requestPasswordReset } from "@/lib/auth/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setLoading(true)
    setMessage("")
    setError("")

    try {
      const data = await requestPasswordReset(email)

      setMessage(
        data.message ||
          "If an account exists for that email, a password reset link has been sent."
      )
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to request password reset"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="flex min-h-[80vh] items-center py-20">
        <Container>
          <div className="mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <h1 className="mb-3 text-4xl font-bold">
              Forgot password?
            </h1>

            <p className="mb-6 text-sm text-gray-600">
              Enter the email address associated with your
              account and we&apos;ll send you a link to reset
              your password.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Email address"
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-[var(--border)] px-5 py-4 outline-none"
              />

              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              {message && (
                <p className="text-sm text-green-600">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-lime-400 px-5 py-4 font-medium text-black transition hover:bg-lime-300 disabled:opacity-50"
              >
                {loading
                  ? "Sending..."
                  : "Send reset link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  )
}