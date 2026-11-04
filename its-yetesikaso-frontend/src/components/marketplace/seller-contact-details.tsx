"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { apiClient } from "@/lib/api/client"
import { getAccessToken } from "@/lib/auth/tokens"
import type { Listing } from "@/types/listing"

type SellerContactDetailsProps = {
  listingSlug: string
}

type ContactDetails = {
  phone?: string
  email?: string
}

export default function SellerContactDetails({
  listingSlug,
}: SellerContactDetailsProps) {
  const [status, setStatus] = useState<
    "checking" | "guest" | "loading" | "ready" | "error"
  >("checking")

  const [contact, setContact] =
    useState<ContactDetails | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!getAccessToken()) {
      setStatus("guest")
      return
    }

    setStatus("loading")

    async function loadContactDetails() {
      try {
        const data = await apiClient<{
          results: Listing[]
        }>(
          `/listings/?slug=${encodeURIComponent(listingSlug)}`
        )

        if (cancelled) return

        const seller = data.results?.[0]?.seller

        setContact(
          seller
            ? {
                phone: seller.phone,
                email: seller.email,
              }
            : null
        )

        setStatus("ready")
      } catch {
        if (!cancelled) {
          setStatus("error")
        }
      }
    }

    loadContactDetails()

    return () => {
      cancelled = true
    }
  }, [listingSlug])

  const loginUrl =
    `/login?returnTo=${encodeURIComponent(
      `/marketplace/${listingSlug}`
    )}`

  return (
    <div className="mt-5 border-t border-[var(--border)] pt-5">
      <h4 className="mb-3 text-sm font-semibold">
        Seller Contact Details
      </h4>

      {status === "checking" || status === "loading" ? (
        <p className="text-sm text-[var(--muted)]">
          Checking contact details...
        </p>
      ) : status === "guest" ? (
        <div className="rounded-xl bg-[var(--background)] p-4">
          <p className="text-sm text-[var(--muted)]">
            Log in to view the seller&apos;s phone number
            and email address.
          </p>

          <Link
            href={loginUrl}
            className="mt-3 inline-block text-sm font-semibold text-lime-600 hover:underline"
          >
            Log in to view contact details
          </Link>
        </div>
      ) : status === "error" ? (
        <p className="text-sm text-[var(--muted)]">
          Contact details are currently unavailable.
        </p>
      ) : contact?.phone || contact?.email ? (
        <div className="space-y-3">
          {contact.phone && (
            <div>
              <p className="text-xs text-[var(--muted)]">
                Phone
              </p>

              <a
                href={`tel:${contact.phone}`}
                className="text-sm font-medium hover:text-lime-600"
              >
                {contact.phone}
              </a>
            </div>
          )}

          {contact.email && (
            <div>
              <p className="text-xs text-[var(--muted)]">
                Email
              </p>

              <a
                href={`mailto:${contact.email}`}
                className="break-all text-sm font-medium hover:text-lime-600"
              >
                {contact.email}
              </a>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          The seller has not provided contact details.
        </p>
      )}
    </div>
  )
}