import Image from 'next/image'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Container from '@/components/layout/container'
import type { Listing } from '@/types/listing'
import ContactSellerButton from '@/components/marketplace/contact-seller-button'

const API_BASE_URL = 'http://127.0.0.1:8000'

function getImageUrl(image: string | null) {
  if (!image) return null

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  return `${API_BASE_URL}${image}`
}

function getWhatsAppUrl(phone: string) {
  const cleanedPhone = phone.replace(/\D/g, '')

  return `https://wa.me/${cleanedPhone}`
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

  const imageSrc = getImageUrl(listing.image)
  const seller = listing.seller

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="py-8 sm:py-10">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* LEFT */}
            <div className="min-w-0">
              <div className="relative mb-6 h-[360px] overflow-hidden rounded-2xl bg-[var(--card)] sm:h-[420px]">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                    No image available
                  </div>
                )}
              </div>

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

                <p className="mb-7 text-2xl font-bold sm:text-3xl">
                  GH₵ {Number(listing.price).toLocaleString()}
                </p>

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
                      {seller?.display_name || 'Seller'}
                    </h3>

                    <p className="text-sm text-[var(--muted)]">
                      {seller?.listing_count || 0} listings
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <ContactSellerButton listingId={listing.id} />

                  {seller?.phone ? (
                    <a
                      href={getWhatsAppUrl(seller.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl border border-[var(--border)] px-5 py-3 text-center font-medium transition hover:bg-[var(--background)]"
                    >
                      WhatsApp Seller
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl border border-[var(--border)] px-5 py-3 font-medium opacity-50"
                    >
                      WhatsApp Unavailable
                    </button>
                  )}
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
