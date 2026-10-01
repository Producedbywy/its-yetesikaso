"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  Home,
  Search,
  Briefcase,
  ShoppingCart,
  ClipboardList,
  User,
  Bookmark,
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

import {
  getConversations,
} from "@/lib/api/messages"

import {
  getMyCart,
} from "@/lib/api/cart"

export default function MobileNav() {
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [role, setRole] = useState<AccountRole>("user")
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [cartQuantity, setCartQuantity] = useState(0)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const token = getAccessToken()

      setAuthenticated(Boolean(token))
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  useEffect(() => {
    if (!authenticated) {
      return
    }

    let cancelled = false

    async function loadUserData() {
      try {
        const [profile, conversations, cartResponse] =
          await Promise.all([
            getMyProfile(),
            getConversations(),
            getMyCart(),
          ])

        if (!cancelled) {
          setRole(profile.role)
          setUnreadMessages(conversations.unread_count || 0)
          setCartQuantity(cartResponse.cart.total_quantity || 0)
        }
      } catch {
        if (!cancelled) {
          setRole("user")
          setUnreadMessages(0)
          setCartQuantity(0)
        }
      }
    }

    function handleCartUpdated() {
      void loadUserData()
    }

    void loadUserData()
    window.addEventListener("cart-updated", handleCartUpdated)

    return () => {
      cancelled = true
      window.removeEventListener(
        "cart-updated",
        handleCartUpdated
      )
    }
  }, [authenticated])

  function closeMenu() {
    setOpen(false)
  }

  function handleLogout() {
    clearTokens()
    setAuthenticated(false)
    setRole("user")
    setUnreadMessages(0)
    setCartQuantity(0)
    setOpen(false)
    window.location.href = "/"
  }

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  function linkClass(path: string) {
    return isActive(path)
      ? "flex items-center gap-3 rounded-xl bg-lime-100 px-4 py-3 font-semibold text-lime-800 transition"
      : "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100"
  }

  function actionClass(path: string) {
    return isActive(path)
      ? "flex items-center gap-3 rounded-xl bg-lime-200 px-4 py-3 font-semibold text-lime-900 transition"
      : "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100"
  }

  const isSeller =
    authenticated && role === "seller"

  const isEmployer =
    authenticated && role === "employer"

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-200 dark:bg-white md:hidden">
        <div className="flex h-24 items-center justify-center px-4">
          <Link
            href="/"
            onClick={closeMenu}
            className="relative block h-32 w-32"
            aria-label="Yetesikaso home"
          >
            <Image
              src="/images/Yetesikaso New Logo.png"
              alt="Yetesikaso"
              fill
              sizes="64px"
              className="scale-150 object-contain"
              priority
            />
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
            className="absolute right-4 rounded-xl border border-gray-200 p-2 text-gray-900 transition hover:bg-gray-100"
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
        <div className="fixed inset-0 top-24 z-40 overflow-y-auto bg-white md:hidden">
          <nav className="px-4 py-6">
            {/* GENERAL */}
            <div className="space-y-1">
              <Link
                href="/"
                onClick={closeMenu}
                className={linkClass("/")}
              >
                <Home size={20} />
                Home
              </Link>

              <Link
                href="/marketplace"
                onClick={closeMenu}
                className={linkClass("/marketplace")}
              >
                <Search size={20} />
                Marketplace
              </Link>

              <Link
                href="/jobs"
                onClick={closeMenu}
                className={linkClass("/jobs")}
              >
                <Briefcase size={20} />
                Jobs
              </Link>
            </div>

            {/* LOGGED-IN */}
            {authenticated && (
              <>
                <div className="my-5 border-t border-gray-200" />

                <div className="space-y-1">
                  <Link
                    href="/cart"
                    onClick={closeMenu}
                    className={linkClass("/cart")}
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingCart size={20} />
                      Cart
                    </span>

                    {cartQuantity > 0 && (
                      <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-lime-400 px-1.5 py-0.5 text-xs font-bold text-black">
                        {cartQuantity > 99
                          ? "99+"
                          : cartQuantity}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/orders"
                    onClick={closeMenu}
                    className={linkClass("/orders")}
                  >
                    <ClipboardList size={20} />
                    Orders
                  </Link>

                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className={linkClass("/profile")}
                  >
                    <User size={20} />
                    Profile
                  </Link>

                  <Link
                    href="/saved"
                    onClick={closeMenu}
                    className={linkClass("/saved")}
                  >
                    <Bookmark size={20} />
                    Saved
                  </Link>

                  <Link
                    href="/messages"
                    onClick={closeMenu}
                    className={linkClass("/messages")}
                  >
                    <span className="flex items-center gap-3">
                      <MessageSquare size={20} />
                      Messages
                    </span>

                    {unreadMessages > 0 && (
                      <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-lime-400 px-1.5 py-0.5 text-xs font-bold text-black">
                        {unreadMessages > 99
                          ? "99+"
                          : unreadMessages}
                      </span>
                    )}
                  </Link>
                </div>

                {/* SELLER */}
                {isSeller && (
                  <>
                    <div className="my-5 border-t border-gray-200" />

                    <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Seller
                    </p>

                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={closeMenu}
                        className={linkClass("/dashboard")}
                      >
                        <LayoutDashboard size={20} />
                        Seller Dashboard
                      </Link>

                      <Link
                        href="/dashboard/create"
                        onClick={closeMenu}
                        className={actionClass("/dashboard/create")}
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
                    <div className="my-5 border-t border-gray-200" />

                    <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Employer
                    </p>

                    <div className="space-y-1">
                      <Link
                        href="/employer/dashboard"
                        onClick={closeMenu}
                        className={linkClass("/employer/dashboard")}
                      >
                        <LayoutDashboard size={20} />
                        Employer Dashboard
                      </Link>

                      <Link
                        href="/employer/jobs/create"
                        onClick={closeMenu}
                        className={actionClass("/employer/jobs/create")}
                      >
                        <PlusCircle size={20} />
                        Post Job
                      </Link>
                    </div>
                  </>
                )}

                {/* ACCOUNT */}
                <div className="my-5 border-t border-gray-200" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-gray-100"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            )}

            {/* LOGGED-OUT */}
            {!authenticated && (
              <>
                <div className="my-5 border-t border-gray-200" />

                <div className="space-y-1">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className={linkClass("/login")}
                  >
                    <LogIn size={20} />
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className={linkClass("/register")}
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
