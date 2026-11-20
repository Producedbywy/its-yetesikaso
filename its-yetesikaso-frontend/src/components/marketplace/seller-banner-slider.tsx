
"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const slides = [
  {
    src: "/images/banner/Ghanaian Artisan Market in Accra.png",
    alt: "Ghanaian craft seller showcasing handmade products",
  },
  {
    src: "/images/banner/Friendly Smartphone Demo in Kumasi.png",
    alt: "Ghanaian electronics retailer showcasing products",
  },
  {
    src: "/images/banner/Ghanaian craft shopkeeper arranging handmade goods.png",
    alt: "Ghanaian fashion entrepreneur displaying clothing",
  },
]

export default function SellerBannerSlider() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 6000)

    return () => window.clearInterval(interval)
  }, [paused])

  function changeSlide(direction: number) {
    setActiveSlide(
      (current) =>
        (current + direction + slides.length) % slides.length
    )
  }

  return (
    <section
      aria-label="Yetesikaso marketplace highlights"
      aria-roledescription="carousel"
      className="relative w-full overflow-hidden bg-slate-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[260px] sm:h-[420px] lg:h-[590px]">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            aria-hidden={activeSlide !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              activeSlide === index
                ? "z-10 opacity-100"
                : "z-0 opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => changeSlide(-1)}
        aria-label="Previous banner"
        className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-3xl text-white transition hover:bg-black/60 sm:left-6"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <button
        type="button"
        onClick={() => changeSlide(1)}
        aria-label="Next banner"
        className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-3xl text-white transition hover:bg-black/60 sm:right-6"
      >
        <span aria-hidden="true">›</span>
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActiveSlide(index)}
            aria-label={`Show banner ${index + 1}`}
            aria-current={activeSlide === index ? "true" : undefined}
            className={`h-2.5 rounded-full transition-all ${
              activeSlide === index
                ? "w-8 bg-[var(--primary)]"
                : "w-2.5 bg-white/75 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
