"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { verifyPayment } from "@/lib/api/payments"

type PaymentState =
  | "verifying"
  | "success"
  | "failed"

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")

  const [state, setState] =
    useState<PaymentState>("verifying")
  const [message, setMessage] = useState(
    "Verifying your payment..."
  )
  const [orderReference, setOrderReference] =
    useState<string | null>(null)

  useEffect(() => {
    if (!reference) {
      setState("failed")
      setMessage("No payment reference was provided.")
      return
    }

    let cancelled = false

    async function verify() {
      if (!reference) {
        return
      }

      try {
        const response = await verifyPayment(reference)

        if (cancelled) {
          return
        }

        if (
          response.payment.status === "successful" &&
          response.order.payment_status === "paid"
        ) {
          setOrderReference(
            response.order.order_reference
          )
          setState("success")
          setMessage(
            "Your payment was successful and your order has been confirmed."
          )
          return
        }

        setState("failed")
        setMessage(
          "We could not confirm your payment. Please check your payment status or try again."
        )
      } catch (err: unknown) {
        if (cancelled) {
          return
        }

        setState("failed")
        setMessage(
          err instanceof Error
            ? err.message
            : "Unable to verify your payment"
        )
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [reference])

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        {state === "verifying" && (
          <>
            <h1 className="text-2xl font-semibold">
              Verifying Payment
            </h1>

            <p className="mt-3 text-[var(--muted)]">
              {message}
            </p>
          </>
        )}

        {state === "success" && orderReference && (
          <>
            <h1 className="text-2xl font-semibold">
              Payment Successful
            </h1>

            <p className="mt-3 text-[var(--muted)]">
              {message}
            </p>

            <Link
              href={`/orders/${encodeURIComponent(
                orderReference
              )}`}
              className="mt-6 inline-flex rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
            >
              View My Order
            </Link>
          </>
        )}

        {state === "failed" && (
          <>
            <h1 className="text-2xl font-semibold">
              Payment Could Not Be Confirmed
            </h1>

            <p className="mt-3 text-red-600">
              {message}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/cart"
                className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
              >
                Return to Cart
              </Link>

              <Link
                href="/marketplace"
                className="rounded-xl border border-[var(--border)] px-5 py-3 font-medium transition hover:bg-[var(--card)]"
              >
                Browse Listings
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
            <h1 className="text-2xl font-semibold">
              Verifying Payment
            </h1>

            <p className="mt-3 text-[var(--muted)]">
              Verifying your payment...
            </p>
          </div>
        </main>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  )
}
