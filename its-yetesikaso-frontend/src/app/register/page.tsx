"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export default function RegisterPage() {
  const { register, loading, error } = useAuth()
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"buyer" | "seller">("buyer")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccess(false)

    const res = await register(
      username,
      email,
      password,
      role
    )

    if (res) {
      setSuccess(true)
      setUsername("")
      setEmail("")
      setPassword("")
      setRole("buyer")

      router.push("/login")
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="flex min-h-[80vh] items-center py-20">
        <Container>
          <div className="mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <h1 className="mb-6 text-4xl font-bold">
              Create Account
            </h1>

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

              <div>
                <p className="mb-3 text-sm font-medium">
                  I want to use Yetesikaso as:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      role === "buyer"
                        ? "border-lime-400 bg-lime-400/10"
                        : "border-[var(--border)] hover:bg-[var(--background)]"
                    }`}
                  >
                    <span className="block font-semibold">
                      Buyer
                    </span>

                    <span className="mt-1 block text-sm text-[var(--muted)]">
                      Browse and buy items
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("seller")}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      role === "seller"
                        ? "border-lime-400 bg-lime-400/10"
                        : "border-[var(--border)] hover:bg-[var(--background)]"
                    }`}
                  >
                    <span className="block font-semibold">
                      Seller
                    </span>

                    <span className="mt-1 block text-sm text-[var(--muted)]">
                      List and sell items
                    </span>
                  </button>
                </div>
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
