"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import Container from "./container"
import { getAccessToken, clearTokens } from "@/lib/auth/tokens"
import { getConversations } from "@/lib/api/messages"
import { getMyCart } from "@/lib/api/cart"
import { getMyProfile, type AccountRole } from "@/lib/api/seller"

export default function Navbar() {
  const pathname = usePathname()

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
  }, [])

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

  function handleLogout() {
    clearTokens()
    setAuthenticated(false)
    setRole("user")
    setUnreadMessages(0)
    setCartQuantity(0)
    window.location.href = "/"
  }

  const isSeller = authenticated && role === "seller"
  const isEmployer = authenticated && role === "employer"

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  function linkClass(path: string) {
    return isActive(path)
      ? "rounded-lg bg-lime-100 px-2.5 py-1.5 font-semibold text-lime-800"
      : "rounded-lg px-2.5 py-1.5 transition-opacity hover:opacity-70"
  }

  function actionClass(path: string) {
    return isActive(path)
      ? "rounded-xl bg-lime-300 px-5 py-2.5 font-semibold text-black transition hover:bg-lime-200"
      : "rounded-xl bg-lime-400 px-5 py-2.5 font-medium text-black transition hover:bg-lime-300"
  }

  return (
    <header className="hidden border-b border-gray-200 bg-white text-gray-900 md:block">
      <Container className="py-1">
        {/* LOGO */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="relative block h-44 w-44"
            aria-label="Yetesikaso home"
          >
            <Image
              src="/images/Yetesikaso New Logo.png"
              alt="Yetesikaso"
              fill
              sizes="176px"
              className="scale-125 object-contain"
              priority
            />
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="relative z-10 -mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
          <Link
            href="/"
            className={linkClass("/")}
          >
            Home
          </Link>

          <Link
            href="/marketplace"
            className={linkClass("/marketplace")}
          >
            Marketplace
          </Link>

          <Link
            href="/jobs"
            className={linkClass("/jobs")}
          >
            Jobs
          </Link>

          {authenticated ? (
            <>
              <Link
                href="/cart"
                className={`flex items-center gap-2 ${linkClass("/cart")}`}
              >
                <span>Cart</span>

                {cartQuantity > 0 && (
                  <span className="flex min-w-5 items-center justify-center rounded-full bg-lime-400 px-1.5 py-0.5 text-xs font-bold text-black">
                    {cartQuantity > 99 ? "99+" : cartQuantity}
                  </span>
                )}
              </Link>

              <Link
                href="/orders"
                className={linkClass("/orders")}
              >
                Orders
              </Link>

              {isSeller && (
                <Link
                  href="/dashboard"
                  className={linkClass("/dashboard")}
                >
                  Seller Dashboard
                </Link>
              )}

              {isEmployer && (
                <Link
                  href="/employer/dashboard"
                  className={linkClass("/employer/dashboard")}
                >
                  Employer Dashboard
                </Link>
              )}

              <Link
                href="/profile"
                className={linkClass("/profile")}
              >
                Profile
              </Link>

              <Link
                href="/saved"
                className={linkClass("/saved")}
              >
                Saved
              </Link>

              <Link
                href="/messages"
                className={`flex items-center gap-2 ${linkClass("/messages")}`}
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
                className="rounded-lg px-2.5 py-1.5 transition-opacity hover:opacity-70"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={linkClass("/login")}
              >
                Login
              </Link>

              <Link
                href="/register"
                className={linkClass("/register")}
              >
                Register
              </Link>

              <Link
                href="/dashboard/create"
                className={actionClass("/dashboard/create")}
              >
                Post Listing
              </Link>
            </>
          )}

          {isSeller && (
            <Link
              href="/dashboard/create"
              className={actionClass("/dashboard/create")}
            >
              Post Listing
            </Link>
          )}

          {isEmployer && (
            <Link
              href="/employer/jobs/create"
              className={actionClass("/employer/jobs/create")}
            >
              Post Job
            </Link>
          )}
        </nav>
      </Container>
    </header>
  )
}
