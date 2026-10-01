"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import Container from "./container"
import { getAccessToken, clearTokens } from "@/lib/auth/tokens"
import { getConversations } from "@/lib/api/messages"
import { getMyProfile, type AccountRole } from "@/lib/api/seller"

export default function Navbar() {
  const [authenticated, setAuthenticated] = useState(false)
  const [role, setRole] = useState<AccountRole>("user")
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const token = getAccessToken()
      setAuthenticated(Boolean(token))
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

    async function loadUserData() {
      try {
        const [profile, conversations] = await Promise.all([
          getMyProfile(),
          getConversations(),
        ])

        if (!cancelled) {
          setRole(profile.role)
          setUnreadMessages(conversations.unread_count || 0)
        }
      } catch {
        if (!cancelled) {
          setRole("user")
          setUnreadMessages(0)
        }
      }
    }

    void loadUserData()

    return () => {
      cancelled = true
    }
  }, [authenticated])

  function handleLogout() {
    clearTokens()
    setAuthenticated(false)
    setRole("user")
    setUnreadMessages(0)
    window.location.href = "/"
  }

  const isSeller = authenticated && role === "seller"
  const isEmployer = authenticated && role === "employer"

  return (
      <header className="hidden border-b border-gray-200 bg-white text-gray-900 md:block">
       <Container className="py-2">
        {/* LOGO */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="relative block h-40 w-40"
            aria-label="Yetesikaso home"
          >
            <Image
              src="/images/Yetesikaso New Logo.png"
              alt="Yetesikaso"
              fill
              sizes="160px"
              className="scale-125 object-contain"
              priority
            />
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="relative z-10 -mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
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
              {isSeller && (
                <Link
                  href="/dashboard"
                  className="transition-opacity hover:opacity-70"
                >
                  Seller Dashboard
                </Link>
              )}

              {isEmployer && (
                <Link
                  href="/employer/dashboard"
                  className="transition-opacity hover:opacity-70"
                >
                  Employer Dashboard
                </Link>
              )}

              <Link
                href="/profile"
                className="transition-opacity hover:opacity-70"
              >
                Profile
              </Link>

              <Link
                href="/saved"
                className="transition-opacity hover:opacity-70"
              >
                Saved
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

              <Link
                href="/dashboard/create"
                className="rounded-xl bg-lime-400 px-5 py-2.5 font-medium text-black transition hover:bg-lime-300"
              >
                Post Listing
              </Link>
            </>
          )}

          {isSeller && (
            <Link
              href="/dashboard/create"
              className="rounded-xl bg-lime-400 px-5 py-2.5 font-medium text-black transition hover:bg-lime-300"
            >
              Post Listing
            </Link>
          )}

          {isEmployer && (
            <Link
              href="/employer/jobs/create"
              className="rounded-xl bg-lime-400 px-5 py-2.5 font-medium text-black transition hover:bg-lime-300"
            >
              Post Job
            </Link>
          )}
        </nav>
      </Container>
    </header>
  )
}