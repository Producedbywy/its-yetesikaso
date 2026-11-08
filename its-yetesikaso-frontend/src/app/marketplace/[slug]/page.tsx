
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

  const cleanImage = image.startsWith('/')
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
            <h1 className="text-2xl font-bold">
              Listing not found
            </h1>
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

  const isFafamesoPlus =
    listing.fafameso_plus_requested &&
    listing.fafameso_plus_approved

  const formattedPrice = Number(listing.price).toLocaleString(
    'en-GH',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )

  const pricingLabel = getPricingTypeLabel(
    listing.pricing_type
  )

  const formattedCategory = listing.category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

  const formattedDate = new Date(
    listing.created_at
  ).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="py-8 sm:py-10">
        <Container>
          <div className="mx-auto grid max-w-6xl items-start gap-7 lg:grid-cols-[minmax(0,1fr)_370px]">

            {/* LEFT — LISTING CONTENT */}
            <div className="min-w-0 space-y-5">
              <ListingImageGallery
                images={imageSources}
                title={listing.title}
              />

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7">

                {/* Category and listing date */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-lime-100 px-3 py-1.5 text-sm font-medium text-lime-800">
                    {formattedCategory}
                  </span>

                  <span className="text-sm text-[var(--muted)]">
                    Listed {formattedDate}
                  </span>
                </div>

                {/* Listing title */}
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {listing.title}
                </h1>

                <div className="my-6 border-t border-[var(--border)]" />

                {/* Description */}
                <div>
                  <h2 className="mb-4 text-xl font-semibold">
                    Description
                  </h2>

                  <p className="whitespace-pre-line break-words leading-7 text-[var(--muted)]">
                    {listing.description}
                  </p>
                </div>

                <div className="my-7 border-t border-[var(--border)]" />

                {/* Listing details */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold">
                    Listing details
                  </h2>

                  <dl className="divide-y divide-[var(--border)] text-sm">

                    <div className="flex flex-wrap justify-between gap-2 py-3">
                      <dt className="text-[var(--muted)]">
                        Category
                      </dt>
                      <dd className="font-medium">
                        {formattedCategory}
                      </dd>
                    </div>

                    {pricingLabel && (
                      <div className="flex flex-wrap justify-between gap-2 py-3">
                        <dt className="text-[var(--muted)]">
                          Pricing
                        </dt>
                        <dd className="font-medium">
                          {pricingLabel}
                        </dd>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-between gap-2 py-3">
                      <dt className="text-[var(--muted)]">
                        Location
                      </dt>
                      <dd className="font-medium">
                        {listing.location}
                      </dd>
                    </div>

                    <div className="flex flex-wrap justify-between gap-2 py-3">
                      <dt className="text-[var(--muted)]">
                        Date listed
                      </dt>
                      <dd className="font-medium">
                        {formattedDate}
                      </dd>
                    </div>

                  </dl>
                </div>
              </div>
            </div>

            {/* RIGHT — PURCHASE PANEL */}
            <aside className="min-w-0 lg:sticky lg:top-44">
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">


                {/* PRICE AND PAYMENT INFORMATION */}
                <div className="border-b border-[var(--border)] px-6 pb-5 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                      GH₵ {formattedPrice}
                    </p>

                    {isFafamesoPlus && (
                      <span className="inline-flex rounded-full bg-[#F58220] px-3 py-1.5 text-xs font-extrabold text-[#073A78]">
                        FAFAMESO PLUS
                      </span>
                    )}
                  </div>

                  {pricingLabel && (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {pricingLabel}
                    </p>
                  )}

                  {isFafamesoPlus && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        Delivery coordinated by Yetesikaso
                      </p>

                      <p className="text-sm leading-relaxed text-[var(--muted)]">
                        Pay securely online using Paystack.
                        Yetesikaso coordinates delivery after
                        successful payment.
                      </p>
                    </div>
                  )}
                </div>


                {/* BUYING AND CONTACT OPTIONS */}
                <div className="p-6">

                  {isFafamesoPlus ? (
                    <BuyListingButton
                      listingId={listing.id}
                      availableQuantity={listing.available_quantity}
                    />
                  ) : (
                    <>
                      {/* Standard seller transaction */}
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                        <p className="text-sm font-semibold">
                          Interested in this listing?
                        </p>

                        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                          Contact the seller directly to
                          discuss availability, payment
                          and collection.
                        </p>
                      </div>

                      <div className="mt-5">
                        <ContactSellerButton
                          listingId={listing.id}
                        />
                      </div>
                    </>
                  )}

                  {/* SELLER INFORMATION */}
                  <div className="mt-7 border-t border-[var(--border)] pt-6">

                    <h2 className="mb-4 text-base font-bold">
                      Seller information
                    </h2>

                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lime-100 text-lg font-bold text-lime-700">
                        {seller?.display_name?.charAt(0).toUpperCase() ||
                          seller?.username?.charAt(0).toUpperCase() ||
                          'S'}
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words font-semibold">
                          {seller?.username ? (
                            <a
                              href={`/sellers/${encodeURIComponent(
                                seller.username
                              )}`}
                              className="transition hover:text-lime-700"
                            >
                              {seller.display_name ||
                                seller.username}
                            </a>
                          ) : (
                            'Seller'
                          )}
                        </h3>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {seller?.listing_count || 0} listings
                        </p>
                      </div>
                    </div>

                    {/* Direct contact on standard listings */}
                    {!isFafamesoPlus && (
                      <div className="mt-5">
                        <SellerContactDetails
                          listingSlug={listing.slug}
                        />
                      </div>
                    )}

                  </div>

                  {/* LOCATION */}
                  <div className="mt-6 border-t border-[var(--border)] pt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Location
                    </p>

                    <p className="font-semibold">
                      {listing.location}
                    </p>

                    {seller?.location &&
                      seller.location !== listing.location && (
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Seller location: {seller.location}
                        </p>
                      )}
                  </div>


                  {/* MORE LISTINGS FROM SELLER */}
                  {seller?.username && (
                    <a
                      href={`/sellers/${encodeURIComponent(
                        seller.username
                      )}`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#073A78] px-4 py-3.5 text-center text-sm font-bold text-[#073A78] transition hover:bg-[#073A78] hover:text-white"
                    >
                      <span>
                        More listings from{" "}
                        {seller.display_name || seller.username}
                      </span>

                      <span className="shrink-0 rounded-full bg-[#F58220] px-2 py-0.5 text-xs font-bold text-[#073A78]">
                        {seller.listing_count || 0}
                      </span>
                    </a>
                  )}

                  {/* REPORT LISTING */}
                  <div className="mt-6 border-t border-[var(--border)] pt-4">

                    <ReportListingButton
                      listingId={listing.id}
                    />
                  </div>

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
