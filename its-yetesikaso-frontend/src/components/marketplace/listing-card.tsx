'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Listing } from "@/types/listing"

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const imageSrc = listing.image || '/placeholder.jpg'

  const formattedDate = listing.created_at
    ? new Date(listing.created_at).toLocaleDateString()
    : ''

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <Link
        href={`/marketplace/${listing.slug}`}
        className="block overflow-hidden rounded-3xl border border-[var(--border)] bg-white hover:shadow-xl"
      >
        {/* IMAGE */}
        <div className="relative h-64 overflow-hidden bg-gray-100">
          <Image
            src={imageSrc}
            alt={listing.title}
            fill
            className="object-cover transition duration-500 hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-700">
              {listing.category}
            </span>

            {formattedDate && (
              <span className="text-sm text-[var(--muted)]">
                {formattedDate}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold leading-snug">
            {listing.title}
          </h3>

          <p className="text-2xl font-bold">
            GH₵ {listing.price.toLocaleString()}
          </p>

          <p className="text-sm text-[var(--muted)]">
            {listing.location}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}