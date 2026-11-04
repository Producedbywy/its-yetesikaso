import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Container from '@/components/layout/container'
import ListingImageGallery from '@/components/marketplace/listing-image-gallery'
import type { Listing } from '@/types/listing'
import ReportListingButton from '@/components/marketplace/report-listing-button'
import BuyListingButton from '@/components/marketplace/buy-listing-button'
import ContactSellerButton from '@/components/marketplace/contact-seller-button'
import SellerContactDetails from '@/components/marketplace/seller-contact-details'
import { getPricingTypeLabel } from '@/lib/listing-pricing'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || ''

function getImageUrl(image: string | null) {
  if (!image) return null

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  const cleanImage = image.startsWith("/")
    ? image
    : `/${image}`

  return `${API_BASE_URL}${cleanImage}`
}

async function getListing(slug: string): Promise<Listing | null> {
  const res = await fetch(
    `${API_BASE_URL}/api/listings/?slug=${encodeURIComponent(slug)}`,
    {
      cache: 'no-store',
    }
  )

  if (!res.ok) return null

  const data = await res.json()

  return data.results?.[0] || null
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const listing = await getListing(slug)

  if (!listing) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />

        <Container>
          <div className="py-20 text-center">
            <h1 className="text-2xl font-bold">Listing not found</h1>
          </div>
        </Container>

        <Footer />
      </main>
    )
  }

  const imageSources = (
    listing.images?.length
      ? listing.images
      : listing.image
        ? [listing.image]
        : []
  )
    .map(getImageUrl)
    .filter((image): image is string => Boolean(image))

  const seller = listing.seller

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="py-8 sm:py-10">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* LEFT */}
            <div className="min-w-0">
              <ListingImageGallery
                images={imageSources}
                title={listing.title}
              />

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-lime-100 px-3 py-1.5 text-sm font-medium text-lime-700">
                    {listing.category}
                  </span>

                  <span className="text-sm text-[var(--muted)]">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  {listing.title}
                </h1>

                <div className="mb-7">
                  <p className="text-2xl font-bold sm:text-3xl">
                    GH₵ {Number(listing.price).toLocaleString()}
                  </p>

                  {getPricingTypeLabel(listing.pricing_type) && (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {getPricingTypeLabel(listing.pricing_type)}
                    </p>
                  )}
                </div>

                <div className="max-w-3xl">
                  <h2 className="mb-3 text-lg font-semibold">
                    Description
                  </h2>

                  <p className="leading-7 text-[var(--muted)]">
                    {listing.description}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <aside>
              <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lime-100 text-lg font-bold text-lime-700">
                    {seller?.display_name?.charAt(0).toUpperCase() || 'S'}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {seller?.username ? (
                        <a
                          href={`/sellers/${encodeURIComponent(seller.username)}`}
                          className="transition hover:text-lime-700"
                        >
                          {seller.display_name || seller.username}
                        </a>
                      ) : (
                        "Seller"
                      )}
                    </h3>

                    <p className="text-sm text-[var(--muted)]">
                      {seller?.listing_count || 0} listings
                    </p>
                  </div>
                </div>

                <SellerContactDetails listingSlug={listing.slug} />

                <div className="mt-5">
                  <ContactSellerButton listingId={listing.id} />
                </div>

                <div className="mt-5 space-y-3">
                  {listing.fafameso_plus_requested &&
                  listing.fafameso_plus_approved ? (
                    <>
                      <div className="rounded-xl border border-lime-200 bg-lime-50 p-4">
                        <span className="inline-flex rounded-full bg-lime-600 px-3 py-1 text-xs font-semibold text-white">
                          Fafameso Plus
                        </span>

                        <p className="mt-2 text-sm text-lime-900">
                          Buy securely through Yetesikaso.
                          Payment is handled online, and
                          Yetesikaso coordinates delivery.
                        </p>
                      </div>

                      <BuyListingButton
                        listingId={listing.id}
                        availableQuantity={listing.available_quantity}
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[var(--muted)]">
                        Contact the seller directly to discuss
                        availability, payment and collection.
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <ReportListingButton listingId={listing.id} />
                </div>

                <div className="mt-7 rounded-xl bg-[var(--background)] p-4">
                  <p className="mb-1 text-sm text-[var(--muted)]">
                    Location
                  </p>

                  <p className="font-medium">
                    {listing.location}
                  </p>

                  {seller?.location &&
                    seller.location !== listing.location && (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Seller: {seller.location}
                      </p>
                    )}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  )
}
