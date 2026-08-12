"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import Container from "./container"
import ThemeToggle from "../shared/theme-toggle"
import { getAccessToken, clearTokens } from "@/lib/auth/tokens"

export default function Navbar() {
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAuthenticated(Boolean(getAccessToken()))
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [])

  function handleLogout() {
    clearTokens()
    setAuthenticated(false)
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 text-gray-900 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90 dark:text-white">
      <Container className="flex items-center justify-between py-4">
        {/* LOGO */}
        <Link
          href="/"
          className="text-xl font-bold"
        >
          Its Yetesikaso
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/marketplace"
            className="transition-opacity hover:opacity-70"
          >
            Marketplace
          </Link>

          <Link
            href="/jobs"
            className="transition-opacity hover:opacity-70"
          >
            Jobs
          </Link>

          {authenticated ? (
            <>
              <Link
                href="/dashboard"
                className="transition-opacity hover:opacity-70"
              >
                Dashboard
              </Link>

              <Link
                href="/profile"
                className="transition-opacity hover:opacity-70"
              >
                Profile
              </Link>

              <Link
                href="/messages"
                className="transition-opacity hover:opacity-70"
              >
                Messages
            </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="transition-opacity hover:opacity-70"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="transition-opacity hover:opacity-70"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="transition-opacity hover:opacity-70"
              >
                Register
              </Link>
            </>
          )}

          <ThemeToggle />

          {authenticated && (
            <Link
              href="/dashboard/create"
              className="rounded-xl bg-lime-400 px-5 py-2.5 font-medium text-black transition hover:bg-lime-300"
            >
              Post Listing
            </Link>
          )}
        </nav>
      </Container>
    </header>
  )
}