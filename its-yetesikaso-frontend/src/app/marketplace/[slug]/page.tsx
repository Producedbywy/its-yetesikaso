import Image from 'next/image'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Container from '@/components/layout/container'
import Button from '@/components/shared/button'
import type { Listing } from "@/types/listing"

async function getListing(slug: string): Promise<Listing | null> {
  const res = await fetch(
    `http://127.0.0.1:8000/api/listings/?search=${slug}`
  )

  if (!res.ok) return null

  const data = await res.json()

  return data.results?.[0] || null
}

export default async function ListingDetailPage({
  params
}: {
  params: { slug: string }
}) {
  const listing = await getListing(params.slug)

  if (!listing) {
    return (
      <main className="p-10">
        Listing not found
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="py-10">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.3fr_420px]">
            
            {/* LEFT */}
            <div>
              <div className="relative mb-6 h-[500px] overflow-hidden rounded-3xl bg-gray-100">
                <Image
                  src={listing.image || '/placeholder.jpg'}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-white p-8">
                <div className="mb-6 flex items-center justify-between">
                  <span className="rounded-full bg-lime-100 px-4 py-2 text-sm font-medium text-lime-700">
                    {listing.category}
                  </span>

                  <span className="text-sm text-[var(--muted)]">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="mb-4 text-4xl font-bold">
                  {listing.title}
                </h1>

                <p className="mb-8 text-3xl font-bold">
                  GH₵ {listing.price.toLocaleString()}
                </p>

                <h2 className="mb-3 text-xl font-semibold">
                  Description
                </h2>

                <p className="leading-relaxed text-[var(--muted)]">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <aside>
              <div className="sticky top-24 rounded-3xl border border-[var(--border)] bg-white p-8">
                <div className="mb-8 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200" />

                  <div>
                    <h3 className="font-semibold">
                      Seller
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                      Member since 2025
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full">
                    Contact Seller
                  </Button>

                  <button className="w-full rounded-xl border border-[var(--border)] px-5 py-3 font-medium">
                    WhatsApp Seller
                  </button>
                </div>

                <div className="mt-8 rounded-2xl bg-gray-100 p-5">
                  <p className="mb-2 text-sm text-[var(--muted)]">
                    Location
                  </p>

                  <p className="font-medium">
                    {listing.location}
                  </p>
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