"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import { confirmPasswordReset } from "@/lib/auth/api"
import { Eye, EyeOff } from "lucide-react"

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        minLength={8}
        autoComplete="new-password"
        className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-5 py-4 pr-12 outline-none"
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()

  const uid = searchParams.get("uid") || ""
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const linkIsValid = Boolean(uid && token)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError("")
    setSuccess(false)

    if (!linkIsValid) {
      setError(
        "This password reset link is invalid or incomplete."
      )
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      await confirmPasswordReset(
        uid,
        token,
        password
      )

      setSuccess(true)
      setPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset password"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="mb-3 text-4xl font-bold">
        Reset password
      </h1>

      <p className="mb-8 text-sm text-[var(--muted)]">
        Enter a new password for your Yetesikaso account.
      </p>

      {!linkIsValid ? (
        <>
          <p className="text-sm text-red-500">
            This password reset link is invalid or incomplete.
          </p>

          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-gray-600 underline-offset-4 hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        </>
      ) : success ? (
        <>
          <p className="text-sm text-green-600">
            Your password has been reset successfully.
          </p>

          <div className="mt-6">
            <Link
              href="/login"
              className="block w-full rounded-2xl bg-lime-400 px-5 py-4 text-center font-medium text-black transition hover:bg-lime-300"
            >
              Back to login
            </Link>
          </div>
        </>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <PasswordInput
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="New password"
          />

          <PasswordInput
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm new password"
          />

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-lime-400 px-5 py-4 font-medium text-black transition hover:bg-lime-300 disabled:opacity-50"
          >
            {loading
              ? "Resetting password..."
              : "Reset password"}
          </button>
        </form>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="flex min-h-[80vh] items-center py-20">
        <Container>
          <div className="mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <Suspense
              fallback={
                <p className="text-sm text-[var(--muted)]">
                  Loading...
                </p>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </div>
        </Container>
      </section>
    </main>
  )
}