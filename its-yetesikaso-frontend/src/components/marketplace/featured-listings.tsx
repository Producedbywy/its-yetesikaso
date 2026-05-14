import Container from '../layout/container'
import ListingCard from './listing-card'
import { listings } from '@/data/listings'

export default function FeaturedListings() {
  return (
    <section className="pb-20">
      <Container>
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-lime-600">
              Marketplace
            </p>

            <h2 className="text-3xl font-bold md:text-5xl">
              Featured Listings
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </Container>
    </section>
  )
}