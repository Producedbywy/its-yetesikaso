import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

import Hero from '@/components/marketplace/hero'
import Categories from '@/components/marketplace/categories'
import AdBanner from "@/components/marketplace/ad-banner"
import MoreListings from "@/components/marketplace/more-listings"
import CtaBanner from '@/components/marketplace/cta-banner'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Hero />

      <Categories />

      <AdBanner />

      <MoreListings />

      <AdBanner large />

      <CtaBanner />

      <Footer />

    </main>
  )
}