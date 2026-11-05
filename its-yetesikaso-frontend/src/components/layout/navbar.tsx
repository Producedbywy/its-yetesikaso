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
      <Container>

        {/* TOP HEADER */}
        <div className="relative flex h-36 items-center justify-center">

          {/* CENTRED LOGO */}
          <Link
            href="/"
            className="relative block h-32 w-44"
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

          {/* ACCOUNT CONTROLS — TOP RIGHT */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">

            {authenticated ? (
              <details key={pathname} className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                  My Account
                  <span aria-hidden="true">⌄</span>
                </summary>

                <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">

                  <div className="flex flex-col gap-1">

                    <Link
                      href="/profile"
                      className={linkClass("/profile")}
                    >
                      Profile
                    </Link>

                    <Link
                      href="/cart"
                      className={`flex items-center justify-between ${linkClass("/cart")}`}
                    >
                      Cart
                      {cartQuantity > 0 && (
                        <span className="rounded-full bg-lime-400 px-2 py-0.5 text-xs text-black">
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

                    <Link
                      href="/saved"
                      className={linkClass("/saved")}
                    >
                      Saved Listings
                    </Link>

                    <Link
                      href="/messages"
                      className={`flex items-center justify-between ${linkClass("/messages")}`}
                    >
                      Messages
                      {unreadMessages > 0 && (
                        <span className="rounded-full bg-lime-400 px-2 py-0.5 text-xs text-black">
                          {unreadMessages > 99 ? "99+" : unreadMessages}
                        </span>
                      )}
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
                      <>
                        <Link
                          href="/employer/dashboard"
                          className={linkClass("/employer/dashboard")}
                        >
                          Employer Dashboard
                        </Link>

                        <Link
                          href="/employer/jobs/create"
                          className={linkClass("/employer/jobs/create")}
                        >
                          Post a Job
                        </Link>
                      </>
                    )}

                  </div>

                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>

                </div>
              </details>
            ) : (
              <div className="flex items-center gap-3 text-sm">

                <Link
                  href="/login"
                  className="font-semibold transition hover:text-lime-700"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl border border-gray-200 px-4 py-2.5 font-semibold transition hover:bg-gray-50"
                >
                  Register
                </Link>

              </div>
            )}

          </div>
        </div>


        {/* MAIN NAVIGATION */}
        <nav
          aria-label="Main navigation"
          className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-t border-gray-200 py-3"
        >
          {/* BALANCE SPACE TO KEEP LINKS CENTRED */}
          <div aria-hidden="true" />

          {/* CENTRED NAVIGATION LINKS */}
          <div className="flex items-center justify-center gap-4 whitespace-nowrap text-sm font-semibold lg:gap-12">
            <Link
              href="/marketplace"
              className={linkClass("/marketplace")}
            >
              Marketplace
            </Link>

            <Link
              href="/marketplace?category=property_land"
              className="rounded-lg px-3 py-2 transition hover:bg-lime-100 hover:text-lime-800"
            >
              Property
            </Link>

            <Link
              href="/marketplace?category=vehicles"
              className="rounded-lg px-3 py-2 transition hover:bg-lime-100 hover:text-lime-800"
            >
              Cars
            </Link>

            <Link
              href="/jobs"
              className={linkClass("/jobs")}
            >
              Jobs
            </Link>
          </div>

          {/* POST LISTING BUTTON — RIGHT */}
          <Link
            href="/post-listing"
            className={`${actionClass("/post-listing")} justify-self-end whitespace-nowrap text-sm`}
          >
            + Post a Listing
          </Link>
        </nav>


      </Container>
    </header>
  )
}
