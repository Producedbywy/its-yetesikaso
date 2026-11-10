
"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

import type { Listing } from "@/types/listing"
import {
  favouriteListing,
  unfavouriteListing,
} from "@/lib/api/favourites"
import { getPricingTypeLabel } from "@/lib/listing-pricing"

interface ListingCardProps {
  listing: Listing
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || ""

function getImageUrl(image: string | null) {
  if (!image) return null

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image
  }

  const cleanImage = image.startsWith("/")
    ? image
    : `/${image}`

  return `${API_BASE_URL}${cleanImage}`
}

function formatListingDate(dateString: string) {
  if (!dateString) return ""

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleDateString("en-GB")
}

export default function ListingCard({
  listing,
}: ListingCardProps) {
  const [saved, setSaved] = useState(listing.is_favourited)
  const [saving, setSaving] = useState(false)

  const imageSrc = getImageUrl(listing.image)
  const formattedDate = formatListingDate(listing.created_at)
  const pricingLabel = getPricingTypeLabel(listing.pricing_type)

  const formattedCategory = listing.category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())

  const formattedPrice = Number(listing.price).toLocaleString(
    "en-GH",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )

  const isFafamesoPlus =
    listing.fafameso_plus_requested &&
    listing.fafameso_plus_approved

  async function handleFavourite(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault()
    event.stopPropagation()

    if (saving) return

    try {
      setSaving(true)

      if (saved) {
        await unfavouriteListing(listing.id)
        setSaved(false)
      } else {
        await favouriteListing(listing.id)
        setSaved(true)
      }
    } catch (error) {
      console.error("Failed to update favourite:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        href={`/marketplace/${listing.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white transition hover:border-gray-300 hover:shadow-md dark:bg-[var(--card)]"
      >
        {/* PRODUCT IMAGE */}
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-900">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={listing.title}
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
              className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
              No image available
            </div>
          )}

          {/* FAFAMESO PLUS */}
          {isFafamesoPlus && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-[#F58220] px-2.5 py-1 text-[11px] font-bold text-[#073A78] shadow-sm">
              Fafameso Plus
            </span>
          )}

          {/* SAVE LISTING */}
          <button
            type="button"
            onClick={handleFavourite}
            disabled={saving}
            aria-label={
              saved
                ? "Remove from saved listings"
                : "Save listing"
            }
            aria-pressed={saved}
            className="absolute right-2.5 top-2.5 rounded-full bg-white/95 p-2 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart
              className={`h-4 w-4 ${
                saved
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600"
              }`}
            />
          </button>
        </div>

        {/* LISTING INFORMATION */}
        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          {/* CATEGORY AND DATE */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              {formattedCategory}
            </span>

            {formattedDate && (
              <span className="shrink-0 text-[11px] text-[var(--muted)]">
                {formattedDate}
              </span>
            )}
          </div>

          {/* TITLE */}
          <h3
            title={listing.title}
            className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-[var(--foreground)] sm:text-[15px]"
          >
            {listing.title}
          </h3>

          {/* PRICE */}
          <div className="mt-auto pt-3">
            <p className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">
              GH₵ {formattedPrice}
            </p>

            {pricingLabel && (
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {pricingLabel}
              </p>
            )}
          </div>

          {/* LOCATION */}
          <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--border)] pt-2.5 text-xs text-[var(--muted)]">
            <MapPin
              size={14}
              className="shrink-0"
              aria-hidden="true"
            />

            <span className="truncate">
              {listing.location}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
