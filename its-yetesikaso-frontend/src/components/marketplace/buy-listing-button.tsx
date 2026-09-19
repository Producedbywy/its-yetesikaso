"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { createTransaction } from "@/lib/api/transactions"

type BuyListingButtonProps = {
  listingId: number
  availableQuantity: number
}

export default function BuyListingButton({
  listingId,
  availableQuantity,
}: BuyListingButtonProps) {
  const router = useRouter()

  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const soldOut = availableQuantity <= 0

  async function handleBuy() {
    try {
      setLoading(true)
      setError(null)

      const response = await createTransaction(
        listingId,
        quantity
      )

      router.push(`/transactions/${response.transaction.id}`)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start purchase"
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
        onClick={handleBuy}
        disabled={loading}
        className="w-full rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Starting purchase..." : "Buy Now"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}