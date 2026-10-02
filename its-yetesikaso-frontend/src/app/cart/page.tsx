"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import Navbar from "@/components/layout/navbar"

import {
  clearCart,
  getMyCart,
  removeFromCart,
  updateCartItem,
  type Cart,
} from "@/lib/api/cart"

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true)
        setError(null)

        const response = await getMyCart()
        setCart(response.cart)
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your cart"
        )
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  async function handleQuantityChange(
    cartItemId: number,
    quantity: number
  ) {
    try {
      setActionLoading(cartItemId)
      setError(null)

      const response = await updateCartItem(cartItemId, quantity)
      setCart(response.cart)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update cart"
      )
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRemove(cartItemId: number) {
    try {
      setActionLoading(cartItemId)
      setError(null)

      const response = await removeFromCart(cartItemId)
      setCart(response.cart)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove item"
      )
    } finally {
      setActionLoading(null)
    }
  }

  async function handleClearCart() {
    try {
      setClearing(true)
      setError(null)

      await clearCart()

      setCart({
        id: cart?.id ?? 0,
        items: [],
        total_amount: "0.00",
        total_quantity: 0,
        created_at: cart?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to clear cart"
      )
    } finally {
      setClearing(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-[var(--muted)]">Loading cart...</p>
      </main>
    )
  }

  if (error && !cart) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Your Cart
        </h1>

        <p className="mt-4 text-sm text-red-600">{error}</p>

        <Link
          href="/marketplace"
          className="mt-6 inline-flex rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
        >
          Browse Listings
        </Link>
      </main>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Your Cart
        </h1>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <h2 className="text-xl font-semibold">
            Your cart is empty
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--muted)]">
            Items you've proceeded with are moved to Orders while payment is
            being completed.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/orders"
              className="inline-flex rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
            >
              View Orders
            </Link>

            <Link
              href="/marketplace"
              className="inline-flex rounded-xl border border-[var(--border)] px-5 py-3 font-medium transition hover:bg-[var(--muted)]"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Your Cart
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            {cart.total_quantity}{" "}
            {cart.total_quantity === 1 ? "item" : "items"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearCart}
          disabled={clearing}
          className="text-left text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-right"
        >
          {clearing ? "Clearing..." : "Clear cart"}
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4">
          {cart.items.map((item) => {
            const maxQuantity = item.available_quantity
            const disabled = actionLoading === item.id

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold">
                      {item.listing_title}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Seller: {item.seller_username}
                    </p>

                    <p className="mt-3 font-medium">
                      GHS {item.price} each
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="font-semibold">
                      GHS {item.total_amount}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      disabled={disabled}
                      className="mt-2 text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {disabled ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <label
                    htmlFor={`cart-quantity-${item.id}`}
                    className="text-sm font-medium"
                  >
                    Quantity
                  </label>

                  {item.available_quantity > 0 ? (
                    <>
                      <select
                        id={`cart-quantity-${item.id}`}
                        value={item.quantity}
                        onChange={(event) =>
                          handleQuantityChange(
                            item.id,
                            Number(event.target.value)
                          )
                        }
                        disabled={disabled}
                        className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none transition focus:border-lime-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {Array.from(
                          { length: maxQuantity },
                          (_, index) => index + 1
                        ).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>

                      <span className="text-sm text-[var(--muted)]">
                        {item.available_quantity} available
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-red-600">
                      Currently unavailable
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </section>

        <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold">
            Order Summary
          </h2>

          <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-5">
            <span className="font-medium">Total</span>
            <span className="text-xl font-semibold">
              GHS {cart.total_amount}
            </span>
          </div>

          <div className="mt-6 space-y-3">
  <Link
    href="/checkout"
    className="block rounded-xl bg-lime-400 px-5 py-3 text-center font-medium text-black transition hover:bg-lime-300"
  >
    Proceed to Checkout
  </Link>

  <Link
    href="/marketplace"
    className="block rounded-xl border border-[var(--border)] px-5 py-3 text-center font-medium transition hover:bg-[var(--muted)]"
  >
    Continue Shopping
  </Link>
</div>
        </aside>
      </div>
    </div>
  </main>
  )
}
