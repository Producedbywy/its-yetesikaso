"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { createConversation } from "@/lib/api/messages"

type ContactSellerButtonProps = {
  listingId: number
}

export default function ContactSellerButton({
  listingId,
}: ContactSellerButtonProps) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContactSeller() {
    try {
      setLoading(true)
      setError(null)

      const conversation = await createConversation(listingId)

      router.push(`/messages/${conversation.id}`)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start conversation"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleContactSeller}
        disabled={loading}
        className="w-full rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Opening..." : "Contact Seller"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}