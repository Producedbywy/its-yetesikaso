
"use client"

import { useEffect, useRef, useState } from "react"

import { addToCart, buyNow } from "@/lib/api/cart"
import { initializePayment } from "@/lib/api/payments"
import { getAccessToken } from "@/lib/auth/tokens"
import ContactSellerButton from "@/components/marketplace/contact-seller-button"

const PENDING_CART_KEY = "yetesikaso_pending_cart"
const PENDING_BUY_KEY = "yetesikaso_pending_buy_now"

type PurchaseAction = "cart" | "buy"

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
  const [authAction, setAuthAction] =
    useState<PurchaseAction>("buy")

  const [hasPendingOrder, setHasPendingOrder] = useState(false)
  const [paymentNeedsAttention, setPaymentNeedsAttention] =
    useState(false)

  const restoringPendingRef = useRef(false)
  const busyRef = useRef(false)

  const pendingOrderRef = useRef<string | null>(null)
  const checkoutUrlRef = useRef<string | null>(null)

  const soldOut = availableQuantity <= 0

  useEffect(() => {
    const token = getAccessToken()

    if (!token) {
      return
    }

    const savedBuy = sessionStorage.getItem(PENDING_BUY_KEY)

    if (savedBuy) {
      try {
        const pending = JSON.parse(savedBuy) as {
          listingId?: number
          quantity?: number
        }

        if (
          pending.listingId === listingId &&
          typeof pending.quantity === "number" &&
          Number.isInteger(pending.quantity) &&
          pending.quantity >= 1
        ) {
          setQuantity(
            Math.min(
              pending.quantity,
              Math.max(1, availableQuantity)
            )
          )

          setMessage(
            "You're signed in. Select Buy Now to continue your purchase."
          )

          sessionStorage.removeItem(PENDING_BUY_KEY)
        }
      } catch {
        sessionStorage.removeItem(PENDING_BUY_KEY)
      }
    }

    if (restoringPendingRef.current) {
      return
    }

    const savedCart = sessionStorage.getItem(PENDING_CART_KEY)

    if (!savedCart) {
      return
    }

    try {
      const pending = JSON.parse(savedCart) as {
        listingId?: number
        quantity?: number
      }

      if (
        pending.listingId !== listingId ||
        typeof pending.quantity !== "number" ||
        !Number.isInteger(pending.quantity) ||
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

      void restorePendingCart()
    } catch {
      sessionStorage.removeItem(PENDING_CART_KEY)
      restoringPendingRef.current = false
    }
  }, [listingId, availableQuantity])

  function requestLogin(action: PurchaseAction) {
    setAuthAction(action)
    setShowLoginPrompt(true)
  }

  async function handleAddToCart() {
    if (busyRef.current || hasPendingOrder) {
      return
    }

    if (!getAccessToken()) {
      requestLogin("cart")
      return
    }

    busyRef.current = true

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
      busyRef.current = false
      setLoading(false)
    }
  }

  async function handleBuyNow() {
    if (busyRef.current || paymentNeedsAttention) {
      return
    }

    if (!getAccessToken()) {
      requestLogin("buy")
      return
    }

    busyRef.current = true

    try {
      setLoading(true)
      setMessage(null)
      setError(null)

      if (checkoutUrlRef.current) {
        window.location.assign(checkoutUrlRef.current)
        return
      }

      let orderReference = pendingOrderRef.current

      if (!orderReference) {
        const response = await buyNow(listingId, quantity)

        orderReference = response.order.order_reference

        pendingOrderRef.current = orderReference
        setHasPendingOrder(true)
      }

      const paymentResponse = await initializePayment(
        orderReference
      )

      const checkoutUrl =
        paymentResponse.payment.authorization_url

      if (!checkoutUrl) {
        setPaymentNeedsAttention(true)

        throw new Error(
          `Payment has already been initialized for order ${orderReference}, but the checkout link is unavailable. Please contact support with this order reference. Do not create another order.`
        )
      }

      checkoutUrlRef.current = checkoutUrl

      window.location.assign(checkoutUrl)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to start checkout"

      if (
        pendingOrderRef.current &&
        /this order has expired/i.test(errorMessage)
      ) {
        pendingOrderRef.current = null
        checkoutUrlRef.current = null

        setHasPendingOrder(false)
        setPaymentNeedsAttention(false)

        setError(
          "Your previous order has expired. Select Buy Now again to start a new purchase."
        )
      } else {
        setError(errorMessage)
      }
    } finally {
      busyRef.current = false
      setLoading(false)
    }
  }

  function continueToAuth(destination: "login" | "register") {
    const key =
      authAction === "buy"
        ? PENDING_BUY_KEY
        : PENDING_CART_KEY

    const otherKey =
      authAction === "buy"
        ? PENDING_CART_KEY
        : PENDING_BUY_KEY

    sessionStorage.removeItem(otherKey)

    sessionStorage.setItem(
      key,
      JSON.stringify({
        listingId,
        quantity,
      })
    )

    const returnTo = encodeURIComponent(
      window.location.pathname + window.location.search
    )

    window.location.href =
      `/${destination}?returnTo=${returnTo}`
  }

  if (soldOut && !hasPendingOrder) {
    return (
      <div className="rounded-xl border border-[var(--border)] px-5 py-3 text-center font-medium opacity-60">
        Sold Out
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <label
          htmlFor="purchase-quantity"
          className="mb-1.5 block text-sm font-medium"
        >
          Quantity
        </label>

        <select
          id="purchase-quantity"
          value={quantity}
          onChange={(event) => {
            setQuantity(Number(event.target.value))
            setError(null)
            setMessage(null)
          }}
          disabled={loading || hasPendingOrder || soldOut}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none transition focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {Array.from(
            {
              length: Math.max(
                availableQuantity,
                hasPendingOrder ? quantity : 0
              ),
            },
            (_, index) => index + 1
          ).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={
            loading ||
            paymentNeedsAttention ||
            (soldOut && !hasPendingOrder)
          }
          className="w-full rounded-xl bg-[#F58220] px-5 py-3.5 font-bold text-[#073A78] transition hover:bg-[#ff9c48] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : paymentNeedsAttention
              ? "Payment Needs Attention"
              : hasPendingOrder
                ? "Continue to Payment"
                : "Buy Now"}
        </button>

        <div className="w-full">
          <ContactSellerButton listingId={listingId} />
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={loading || hasPendingOrder || soldOut}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-3 font-medium transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to Cart
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        Secure online payment through Paystack
      </p>

      {message && (
        <p className="mt-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
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
              Sign in to{" "}
              {authAction === "buy" ? "buy" : "add to cart"}
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Please sign up or log in to continue.
              Your selected quantity will be remembered.
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
                onClick={() => continueToAuth("login")}
                className="rounded-xl border border-[var(--border)] px-5 py-3 font-medium transition hover:bg-[var(--background)]"
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => continueToAuth("register")}
                className="rounded-xl bg-[#F58220] px-5 py-3 font-bold text-[#073A78] transition hover:bg-[#ff9c48]"
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
