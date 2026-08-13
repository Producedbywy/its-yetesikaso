"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import Container from "./container"
import ThemeToggle from "../shared/theme-toggle"
import { getAccessToken, clearTokens } from "@/lib/auth/tokens"
import { getConversations } from "@/lib/api/messages"

export default function Navbar() {
  const [authenticated, setAuthenticated] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAuthenticated(Boolean(getAccessToken()))
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!authenticated) {
      return
    }

    let cancelled = false

    async function loadUnreadMessages() {
      try {
        const response = await getConversations()

        if (!cancelled) {
          setUnreadMessages(response.unread_count || 0)
        }
      } catch {
        if (!cancelled) {
          setUnreadMessages(0)
        }
      }
    }

    void loadUnreadMessages()

    return () => {
      cancelled = true
    }
  }, [authenticated])

  function handleLogout() {
    clearTokens()
    setAuthenticated(false)
    setUnreadMessages(0)
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
                className="flex items-center gap-2 transition-opacity hover:opacity-70"
              >
                <span>Messages</span>

                {unreadMessages > 0 && (
                  <span className="flex min-w-5 items-center justify-center rounded-full bg-lime-400 px-1.5 py-0.5 text-xs font-bold text-black">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
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