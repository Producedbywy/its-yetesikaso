"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import Container from "../../components/layout/container"

const slides = [
  {
    eyebrow: "YeteSikaso Marketplace",
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
    action: "Explore Listings",
    href: "/marketplace",
    image: "/images/hero/payment.jpg",
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
    <section className="py-6 md:py-8">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gray-950 text-white">
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />

          <div className="relative min-h-[420px] md:min-h-[500px]">
            <div className="flex min-h-[420px] items-center px-6 py-16 md:min-h-[500px] md:px-14 lg:px-20">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-lime-400">
                  {slide.eyebrow}
                </p>

                <h1 className="text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
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
            </div>

            <div className="absolute bottom-6 left-6 flex items-center gap-3 md:left-14 lg:left-20">
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg transition hover:bg-white/20"
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
                        ? "w-8 bg-lime-400"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={showNext}
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg transition hover:bg-white/20"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}