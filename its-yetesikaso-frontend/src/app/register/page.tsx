"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import { useAuth } from "@/lib/auth/useAuth"
import { Eye, EyeOff } from "lucide-react"

function PasswordInput({
  value,
  onChange,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="Password"
        required
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

export default function RegisterPage() {
  const { register, loading, error } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isSellerRegistration = pathname === "/register/seller"
  const isBuyerRegistration = pathname === "/register/buyer"

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccess(false)

    const res = await register(
      username,
      email,
      password
    )

    if (res) {
      setSuccess(true)
      setUsername("")
      setEmail("")
      setPassword("")

      const returnTo =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get(
              "returnTo"
            )
          : null

      const loginBase = isSellerRegistration
        ? "/login/seller"
        : isBuyerRegistration
          ? "/login/buyer"
          : "/login"

      const loginUrl = returnTo
        ? `${loginBase}?returnTo=${encodeURIComponent(returnTo)}`
        : isSellerRegistration
          ? `${loginBase}?returnTo=${encodeURIComponent("/profile")}`
          : loginBase

      router.push(loginUrl)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="flex min-h-[80vh] items-center py-20">
        <Container>
          <div className="mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <h1 className="mb-3 text-4xl font-bold">
              {isSellerRegistration
                ? "Register as a Seller"
                : isBuyerRegistration
                  ? "Register as a Buyer"
                  : "Create Account"}
            </h1>

            <p className="mb-8 text-sm text-[var(--muted)]">
              {isSellerRegistration
                ? "Create your Yetesikaso account, then complete the seller application and identity verification before you start selling."
                : "Create your Yetesikaso account to discover products, contact sellers, save listings and make purchases."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-5 py-4 outline-none"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-5 py-4 outline-none"
              />

              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <p className="font-medium">
                  {isSellerRegistration
                    ? "Your Seller Application"
                    : "Your Buyer Account"}
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  {isSellerRegistration
                    ? "After creating your account, sign in and submit your seller details, including the required Ghana Card information. Seller access is subject to verification and approval."
                    : "Browse products, contact sellers, save favourites and manage purchases. You can also apply to become a seller later."}
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-500">
                  Account created successfully 🎉 You can now log in.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-lime-400 px-5 py-4 font-medium text-black transition hover:bg-lime-300 disabled:opacity-50"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>
          </div>
        </Container>
      </section>
    </main>
  )
}