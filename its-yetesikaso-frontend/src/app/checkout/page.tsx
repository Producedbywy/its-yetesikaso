"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { checkoutCart, getMyCart, type Cart } from "@/lib/api/cart"
import { initializePayment } from "@/lib/api/payments"

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
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

  async function handleCheckout() {
    try {
      setProcessing(true)
      setError(null)

      const checkoutResponse = await checkoutCart()

      const paymentResponse = await initializePayment(
        checkoutResponse.order.order_reference
      )

      window.location.href =
        paymentResponse.payment.authorization_url
    } catch (err: unknown) {
      setProcessing(false)
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment"
      )
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-[var(--muted)]">
          Loading checkout...
        </p>
      </main>
    )
  }

  if (error && !cart) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Checkout
        </h1>

        <p className="mt-4 text-sm text-red-600">{error}</p>

        <Link
          href="/cart"
          className="mt-6 inline-flex rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
        >
          Back to Cart
        </Link>
      </main>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Checkout
        </h1>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--muted)]">
            Your cart is empty.
          </p>

          <Link
            href="/marketplace"
            className="mt-5 inline-flex rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
          >
            Browse Listings
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Checkout
        </h1>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Review your order before continuing to payment.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold">
          Order Summary
        </h2>

        <div className="mt-5 divide-y divide-[var(--border)]">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p className="font-medium">
                  {item.listing_title}
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  {item.quantity} × GHS {item.price}
                </p>
              </div>

              <p className="font-medium">
                GHS {item.total_amount}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-6">
          <span className="font-medium">Total</span>

          <span className="text-xl font-semibold">
            GHS {cart.total_amount}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={processing}
          className="mt-6 w-full rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing
            ? "Redirecting to payment..."
            : "Continue to Payment"}
        </button>

        <Link
          href="/cart"
          className="mt-3 block text-center text-sm font-medium text-[var(--muted)] transition hover:text-black"
        >
          Back to Cart
        </Link>
      </div>
    </main>
  )
}
