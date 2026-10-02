"use client"

import Image from "next/image"
import { useState } from "react"

type ListingImageGalleryProps = {
  images: string[]
  title: string
}

export default function ListingImageGallery({
  images,
  title,
}: ListingImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="relative mb-6 h-[360px] overflow-hidden rounded-2xl bg-[var(--card)] sm:h-[420px]">
        <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
          No image available
        </div>
      </div>
    )
  }

  const currentImage = images[currentIndex]

  return (
    <div className="mb-6">
      <div className="relative h-[360px] overflow-hidden rounded-2xl bg-[var(--card)] sm:h-[420px]">
        <Image
          src={currentImage}
          alt={`${title} - image ${currentIndex + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover"
          unoptimized
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex(
                  (currentIndex - 1 + images.length) % images.length
                )
              }
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-2xl text-white backdrop-blur-sm transition hover:bg-black/75"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentIndex((currentIndex + 1) % images.length)
              }
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-2xl text-white backdrop-blur-sm transition hover:bg-black/75"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                index === currentIndex
                  ? "border-lime-400"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
