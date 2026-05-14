import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import MobileNav from '@/components/layout/mobile-nav'
import Container from '@/components/layout/container'
import ListingCard from '@/components/marketplace/listing-card'

import { listings } from '@/data/listings'

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="border-b border-[var(--border)] bg-white py-14">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="h-28 w-28 rounded-full bg-gray-200" />

            <div>
              <h1 className="mb-2 text-4xl font-bold">
                Kwame Mensah
              </h1>

              <p className="mb-3 text-[var(--muted)]">
                Member since 2025
              </p>

              <div className="flex gap-3">
                <span className="rounded-full bg-lime-100 px-4 py-2 text-sm font-medium text-lime-700">
                  Verified Seller
                </span>

                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                  12 Listings
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              Seller Listings
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
              />
            ))}
          </div>
        </Container>
      </section>

      <Footer />
      <MobileNav />
    </main>
  )
}