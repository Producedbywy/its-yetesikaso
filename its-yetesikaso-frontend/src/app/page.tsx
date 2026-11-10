
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"

import Hero from "@/components/marketplace/hero"
import Categories from "@/components/marketplace/categories"
import AdBanner from "@/components/marketplace/ad-banner"
import MoreListings from "@/components/marketplace/more-listings"
import CtaBanner from "@/components/marketplace/cta-banner"
import NearbyListings from "@/components/marketplace/nearby-listings"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Hero />

      <Categories />


      <NearbyListings />

      {/* SMALL SPONSORED ADVERTISEMENT */}
      <section
        aria-label="Sponsored advertisement"
        className="py-5"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <a
            href="https://managingghana.com"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group flex min-h-[130px] items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#dce5f0] bg-[#f1f6fc] px-5 py-4 transition hover:border-[#9bb5d3] hover:shadow-md sm:gap-8 sm:px-8"
          >
            {/* ADVERT CONTENT */}
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#71839a]">
                Sponsored
              </p>

              <h2 className="text-lg font-extrabold tracking-tight text-[#123b66] sm:text-2xl">
                Discover Managing Ghana
              </h2>

              <p className="mt-1 text-xs text-[#52677e] sm:text-sm">
                Explore jobs and opportunities in Ghana.
              </p>

              <span className="mt-3 inline-flex items-center rounded-lg bg-[#123b66] px-4 py-2 text-xs font-bold text-white transition group-hover:bg-[#f58220] sm:text-sm">
                Visit Website →
              </span>
            </div>

            {/* STYLISED WEBSITE PREVIEW */}
            <div
              aria-hidden="true"
              className="w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg sm:w-56"
            >
              <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="ml-2 h-2 flex-1 rounded bg-slate-200" />
              </div>

              <div className="bg-[#123b66] px-3 py-2">
                <p className="text-[8px] font-bold tracking-wide text-white sm:text-xs">
                  MANAGING GHANA
                </p>
                <div className="mt-1 h-1 w-12 rounded bg-[#f58220] sm:w-20" />
              </div>

              <div className="flex gap-2 p-2">
                <div className="h-10 w-9 shrink-0 rounded bg-[#f58220]/25 sm:h-12 sm:w-16" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 rounded bg-slate-200" />
                  <div className="h-2 w-4/5 rounded bg-slate-100" />
                  <div className="h-2 w-2/3 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      <MoreListings
        startIndex={0}
        endIndex={8}

        eyebrow="Fresh Finds"
        title="Latest Listings"
        description="Discover recently added products from sellers across Ghana."
      />

      <AdBanner large />

      <MoreListings
        startIndex={8}
        endIndex={16}
        eyebrow="Explore More"
        title="More to Discover"
        description="Find more products and opportunities available on Yetesikaso."
      />

      <CtaBanner />

      <Footer />
    </main>
  )
}
