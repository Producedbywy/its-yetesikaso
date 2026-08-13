"use client"

import { useState } from "react"
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
        className="w-full rounded-2xl border border-[var(--border)] px-5 py-4 pr-12 outline-none"
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

export default function LoginPage() {
  const { login, loading, error } = useAuth()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    await login(username, password)
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="flex min-h-[80vh] items-center py-20">
        <Container>
          <div className="mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <h1 className="mb-6 text-4xl font-bold">
              Login
            </h1>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <input
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Username"
                required
                className="w-full rounded-2xl border border-[var(--border)] px-5 py-4 outline-none"
              />

              <PasswordInput
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
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
                  ? "Logging in..."
                  : "Login"}
              </button>
            </form>
          </div>
        </Container>
      </section>
    </main>
  )
}