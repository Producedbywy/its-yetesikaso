import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import MobileNav from '@/components/layout/mobile-nav'

import Hero from '@/components/marketplace/hero'
import Categories from '@/components/marketplace/categories'
import FeaturedListings from '@/components/marketplace/featured-listings'
import Stats from '@/components/marketplace/stats'
import CtaBanner from '@/components/marketplace/cta-banner'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <Hero />

      <Categories />

      <FeaturedListings />

      <Stats />

      <CtaBanner />

      <Footer />

      <MobileNav />
    </main>
  )
}