'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Listing } from '@/types/listing'

interface ListingCardProps {
  listing: Listing
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || ''

function getImageUrl(image: string | null) {
  if (!image) return null

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  return `${API_BASE_URL}${image}`
}

export default function ListingCard({ listing }: ListingCardProps) {
const imageSrc = getImageUrl(listing.image)

const formattedDate = listing.created_at
? new Date(listing.created_at).toLocaleDateString()
: ''

return (
<motion.div
whileHover={{ y: -6 }}
transition={{ duration: 0.2 }}
>
<Link
href={`/marketplace/${listing.slug}`}
className="block overflow-hidden rounded-3xl border border-[var(--border)] bg-white transition hover:shadow-xl dark:bg-[var(--card)]"
>
{/* IMAGE */} <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
{imageSrc ? ( <Image
           src={imageSrc}
           alt={listing.title}
           fill
           priority
           sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
           className="object-cover object-center transition duration-500 hover:scale-105"
           unoptimized
         />
) : ( <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
No image </div>
)} </div>

```
    {/* CONTENT */}
    <div className="space-y-3 p-5">
      <div className="flex items-center justify-between gap-3">
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
