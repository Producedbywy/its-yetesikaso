"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Menu,
  X,
  Home,
  Search,
  Briefcase,
  User,
  MessageSquare,
  LayoutDashboard,
  PlusCircle,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react"

import {
  getAccessToken,
  clearTokens,
} from "@/lib/auth/tokens"

import {
  getMyProfile,
  type AccountRole,
} from "@/lib/api/seller"

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [role, setRole] = useState<AccountRole>("user")

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

    async function loadProfile() {
      try {
        const profile = await getMyProfile()

        if (!cancelled) {
          setRole(profile.role)
        }
      } catch {
        if (!cancelled) {
          setRole("user")
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [authenticated])

  function closeMenu() {
    setOpen(false)
  }

  function handleLogout() {
    clearTokens()
    setAuthenticated(false)
    setRole("user")
    setOpen(false)
    window.location.href = "/"
  }

  const isSeller =
    authenticated && role === "seller"

  const isEmployer =
    authenticated && role === "employer"

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90 md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href="/"
            onClick={closeMenu}
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            Its Yetesikaso
          </Link>

          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            aria-label={
              open
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={open}
            className="rounded-xl border border-gray-200 p-2 text-gray-900 transition hover:bg-gray-100 dark:border-gray-800 dark:text-white dark:hover:bg-gray-900"
          >
            {open ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="fixed inset-0 top-[65px] z-40 overflow-y-auto bg-white dark:bg-gray-950 md:hidden">
          <nav className="px-4 py-6">
            {/* GENERAL */}
            <div className="space-y-1">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <Home size={20} />
                Home
              </Link>

              <Link
                href="/marketplace"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <Search size={20} />
                Marketplace
              </Link>

              <Link
                href="/jobs"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <Briefcase size={20} />
                Jobs
              </Link>
            </div>

            {/* LOGGED-IN */}
            {authenticated && (
              <>
                <div className="my-5 border-t border-gray-200 dark:border-gray-800" />

                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    <User size={20} />
                    Profile
                  </Link>

                  <Link
                    href="/messages"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    <MessageSquare size={20} />
                    Messages
                  </Link>
                </div>

                {/* SELLER */}
                {isSeller && (
                  <>
                    <div className="my-5 border-t border-gray-200 dark:border-gray-800" />

                    <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Seller
                    </p>

                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
                      >
                        <LayoutDashboard size={20} />
                        Seller Dashboard
                      </Link>

                      <Link
                        href="/dashboard/create"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
                      >
                        <PlusCircle size={20} />
                        Post Listing
                      </Link>
                    </div>
                  </>
                )}

                {/* EMPLOYER */}
                {isEmployer && (
                  <>
                    <div className="my-5 border-t border-gray-200 dark:border-gray-800" />

                    <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Employer
                    </p>

                    <div className="space-y-1">
                      <Link
                        href="/employer/dashboard"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
                      >
                        <LayoutDashboard size={20} />
                        Employer Dashboard
                      </Link>

                      <Link
                        href="/employer/jobs/create"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
                      >
                        <PlusCircle size={20} />
                        Post Job
                      </Link>
                    </div>
                  </>
                )}

                {/* ACCOUNT */}
                <div className="my-5 border-t border-gray-200 dark:border-gray-800" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            )}

            {/* LOGGED OUT */}
            {!authenticated && (
              <>
                <div className="my-5 border-t border-gray-200 dark:border-gray-800" />

                <div className="space-y-1">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    <LogIn size={20} />
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    <UserPlus size={20} />
                    Register
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  )
}