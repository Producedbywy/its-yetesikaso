import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"

import Hero from "@/components/marketplace/hero"
import Categories from "@/components/marketplace/categories"
import AdBanner from "@/components/marketplace/ad-banner"
import MoreListings from "@/components/marketplace/more-listings"
import CtaBanner from "@/components/marketplace/cta-banner"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Hero />

      <Categories />

      <AdBanner />

      <MoreListings
        startIndex={6}
        endIndex={22}
        eyebrow="Keep Exploring"
        title="More Listings"
        description="Browse more products, services and opportunities available across the marketplace."
      />

      <AdBanner large />

      <MoreListings
        startIndex={22}
        endIndex={30}
        eyebrow="Discover More"
        title="More to Explore"
        description="Keep browsing products, services and opportunities available across the marketplace."
      />

      <CtaBanner />

      <MoreListings
        startIndex={30}
        endIndex={38}
        eyebrow="Keep Browsing"
        title="More Listings"
        description="Continue exploring products and opportunities across the marketplace."
      />

      <Footer />
    </main>
  )
}
