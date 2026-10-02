"use client"

import { useEffect, useRef, useState } from "react"

import { addToCart } from "@/lib/api/cart"
import { getAccessToken } from "@/lib/auth/tokens"

const PENDING_CART_KEY = "yetesikaso_pending_cart"

type BuyListingButtonProps = {
  listingId: number
  availableQuantity: number
}

export default function BuyListingButton({
  listingId,
  availableQuantity,
}: BuyListingButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const restoringPendingRef = useRef(false)

  const soldOut = availableQuantity <= 0

useEffect(() => {
  const token = getAccessToken()

  if (!token || restoringPendingRef.current) {
    return
  }

  const saved = sessionStorage.getItem(PENDING_CART_KEY)

  if (!saved) {
    return
  }

  try {
    const pending = JSON.parse(saved) as {
      listingId?: number
      quantity?: number
    }

    if (
      pending.listingId !== listingId ||
      !pending.quantity ||
      pending.quantity < 1
    ) {
      sessionStorage.removeItem(PENDING_CART_KEY)
      return
    }

    restoringPendingRef.current = true

    async function restorePendingCart() {
      try {
        setLoading(true)
        setError(null)

        await addToCart(listingId, pending.quantity!)

        sessionStorage.removeItem(PENDING_CART_KEY)
        window.dispatchEvent(new Event("cart-updated"))

        setMessage(
          pending.quantity === 1
            ? "Added to cart."
            : `${pending.quantity} items added to cart.`
        )
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to add item to cart"
        )
      } finally {
        setLoading(false)
        restoringPendingRef.current = false
      }
    }

    restorePendingCart()
  } catch {
    sessionStorage.removeItem(PENDING_CART_KEY)
    restoringPendingRef.current = false
  }
}, [listingId])

async function handleAddToCart() {

    const token = getAccessToken()

    if (!token) {
      setShowLoginPrompt(true)
      return
    }

    try {
      setLoading(true)
      setMessage(null)
      setError(null)

      await addToCart(listingId, quantity)

      window.dispatchEvent(new Event("cart-updated"))

      setMessage(
        quantity === 1
          ? "Added to cart."
          : `${quantity} items added to cart.`
      )
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add item to cart"
      )
    } finally {
      setLoading(false)
    }
  }

  if (soldOut) {
    return (
      <div className="rounded-xl border border-[var(--border)] px-5 py-3 text-center font-medium opacity-60">
        Sold Out
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3">
        <label
          htmlFor="purchase-quantity"
          className="mb-1.5 block text-sm font-medium"
        >
          Quantity
        </label>

        <select
          id="purchase-quantity"
          value={quantity}
          onChange={(event) =>
            setQuantity(Number(event.target.value))
          }
          disabled={loading}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none transition focus:border-lime-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {Array.from(
            { length: availableQuantity },
            (_, index) => index + 1
          ).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={loading}
        className="w-full rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Adding to cart..." : "Add to Cart"}
      </button>

      {message && (
        <p className="mt-2 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-prompt-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-[var(--card)] p-6 shadow-xl">
            <h2
              id="login-prompt-title"
              className="text-xl font-bold text-[var(--foreground)]"
            >
              Sign in to buy
            </h2>

            <p className="mt-2 text-[var(--muted)]">
              Please sign up or log in to your account to buy this item.
              You can continue browsing without signing in.
            </p>

<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
  <button
    type="button"
    onClick={() => setShowLoginPrompt(false)}
    className="rounded-xl border border-[var(--border)] px-5 py-3 font-medium transition hover:bg-[var(--background)]"
  >
    Continue Browsing
  </button>

  <button
    type="button"
    onClick={() => {
      sessionStorage.setItem(
        PENDING_CART_KEY,
        JSON.stringify({
          listingId,
          quantity,
        })
      )

      window.location.href = `/login?returnTo=${encodeURIComponent(
        window.location.pathname + window.location.search
      )}`
    }}
    className="rounded-xl border border-[var(--border)] px-5 py-3 font-medium transition hover:bg-[var(--background)]"
  >
    Log In
  </button>

  <button
    type="button"
    onClick={() => {
      sessionStorage.setItem(
        PENDING_CART_KEY,
        JSON.stringify({
          listingId,
          quantity,
        })
      )

      window.location.href = `/register?returnTo=${encodeURIComponent(
        window.location.pathname + window.location.search
      )}`
    }}
    className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
  >
    Sign Up
  </button>
</div>
          </div>
        </div>
      )}
    </div>
  )
}
