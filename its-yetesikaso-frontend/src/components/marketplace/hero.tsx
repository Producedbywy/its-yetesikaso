"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const slides = [
  {
    eyebrow: "Yetesikaso Marketplace",
    title: "Find what you need across Ghana.",
    description:
      "Discover products, services, vehicles, property and more from sellers across the marketplace.",
    action: "Browse Marketplace",
    href: "/marketplace",
    image: "/images/hero/marketplace.jpg",
  },
  {
    eyebrow: "Buy & Sell",
    title: "A simpler way to buy and sell.",
    description:
      "Explore listings, compare what is available and connect with sellers through one marketplace.",
    action: "Learn About Fafameso Plus",
    href: "/fafameso-plus",
    image: "/images/hero/payment.png",
  },
  {
    eyebrow: "Jobs & Opportunities",
    title: "Discover more opportunities.",
    description:
      "Explore marketplace listings and job opportunities in one place.",
    action: "View Jobs",
    href: "/jobs",
    image: "/images/hero/opportunities.jpg",
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length)
    }, 6000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const slide = slides[currentSlide]

  function showPrevious() {
    setCurrentSlide(
      (current) => (current - 1 + slides.length) % slides.length
    )
  }

  function showNext() {
    setCurrentSlide((current) => (current + 1) % slides.length)
  }

  return (
    <section className="py-3 md:py-4">
      <div className="relative w-full overflow-hidden bg-gray-950 text-white">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          priority
          sizes="100vw"
className={`object-cover ${
  currentSlide === 1
    ? "object-right md:object-center"
    : currentSlide === 2
      ? "object-top"
      : "object-center"
}`}
        />

        <div
className={`absolute inset-0 ${
  currentSlide === 1
    ? "bg-gradient-to-r from-black/95 via-black/80 to-black/10 md:bg-gradient-to-l md:from-black/90 md:via-black/35 md:to-transparent"
    : "bg-gradient-to-r from-black/85 via-black/60 to-black/20"
}`}
        />

        <div className="relative min-h-[360px] md:min-h-[420px]">
          <div
            className={`mx-auto flex min-h-[360px] max-w-7xl px-6 md:min-h-[420px] md:px-14 lg:px-20 ${
              currentSlide === 1
                ? "items-start justify-end pb-10 pt-12"
                : "items-center py-10 md:py-12"
            }`}
          >
            {currentSlide === 1 ? (
<div className="flex w-full max-w-[350px] flex-col items-start text-left md:max-w-[380px] lg:translate-x-10 xl:translate-x-16 2xl:translate-x-20">
  <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg md:text-5xl">
    Pay securely.
    <span className="mt-2 block">
      Get it delivered.
    </span>
  </h2>

  <p className="mt-5 max-w-sm text-base font-medium leading-7 text-white drop-shadow-lg md:text-lg">
    Shop with confidence using Fafameso Plus.
  </p>

  <Link
    href={slide.href}
    className="mt-7 inline-flex rounded-xl bg-lime-400 px-7 py-4 text-base font-bold text-black shadow-lg transition hover:bg-lime-300"
  >
    {slide.action}
  </Link>
</div>
            ) : (
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-lime-400">
                  {slide.eyebrow}
                </p>

                <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-gray-200 md:text-lg">
                  {slide.description}
                </p>

                <Link
                  href={slide.href}
                  className="mt-8 inline-flex rounded-xl bg-lime-400 px-6 py-3.5 font-semibold text-black transition hover:bg-lime-300"
                >
                  {slide.action}
                </Link>
              </div>
            )}
          </div>

          <div
            className={`absolute bottom-4 z-10 flex items-center gap-2 md:bottom-6 ${
              currentSlide === 1
                ? "left-4 rounded-full border border-white/20 bg-gray-950/80 px-3 py-2 shadow-lg backdrop-blur-sm md:left-10 lg:left-14"
                : "right-4 md:right-10 lg:right-14"
            }`}
          >
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous slide"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base transition hover:bg-white/20"
            >
              ←
            </button>

            <div className="flex items-center gap-2">
              {slides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentSlide}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? "w-6 bg-lime-400"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base transition hover:bg-white/20"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
