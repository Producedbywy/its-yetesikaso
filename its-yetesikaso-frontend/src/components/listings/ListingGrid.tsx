"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Share2 } from "lucide-react"
import { useState } from "react"
import type { Listing } from "@/types/listing"

interface ListingCardProps {
  listing: Listing
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || ''

function getImageUrl(image: string | null) {
  if (!image) return null

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image
  }

  return `${API_BASE_URL}${image}`
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [saved, setSaved] = useState(false)

  const imageSrc = getImageUrl(listing.image)

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition hover:shadow-md">
      {/* IMAGE */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover object-center transition duration-500 hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            No image
          </div>
        )}

        {/* SAVE */}
        <button
          type="button"
          onClick={() => setSaved((value) => !value)}
          aria-label={saved ? "Remove from saved listings" : "Save listing"}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 ${
              saved
                ? "fill-red-500 text-red-500"
                : "text-[var(--muted)]"
            }`}
          />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <Link href={`/marketplace/${listing.slug}`} className="block">
          <h3 className="line-clamp-1 text-sm font-semibold">
            {listing.title}
          </h3>

          <p className="mt-1 text-xs text-[var(--muted)]">
            {listing.location}
          </p>

          <p className="mt-3 text-lg font-bold">
            GH₵ {listing.price.toLocaleString()}
          </p>
        </Link>

        {/* ACTIONS */}
        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
          <span className="text-xs text-[var(--muted)]">
            {listing.category}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Share listing"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: listing.title,
                    url: `${window.location.origin}/marketplace/${listing.slug}`,
                  })
                }
              }}
              className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--background)]"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <Link
              href={`/marketplace/${listing.slug}`}
              className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-80 dark:bg-white dark:text-black"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}