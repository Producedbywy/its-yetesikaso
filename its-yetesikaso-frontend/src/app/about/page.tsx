
import type { Metadata } from "next"
import Link from "next/link"

import Container from "@/components/layout/container"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "About Us | Yetesikaso",
  description:
    "Discover Yetesikaso, a marketplace connecting buyers and sellers in Ghana, with Fafameso Plus delivery, dispatch and direct payment services.",
}

export default function AboutPage() {
  return (
    <>
      <main>
        {/* Introduction */}
        <section className="border-b border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                About Yetesikaso
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Bringing buyers and sellers together.
              </h1>

              <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
                Yetesikaso is an online marketplace designed to make buying
                and selling in Ghana simpler. We connect people with products
                and services, giving buyers a place to discover what they
                need and sellers a platform to reach more customers.
              </p>

              <p className="mt-4 leading-7 text-[var(--muted)]">
                Whether you are looking for something specific or ready to
                sell, Yetesikaso brings opportunities, listings and
                marketplace services together in one place.
              </p>
            </div>
          </Container>
        </section>

        {/* Marketplace */}
        <section className="py-16 sm:py-20">
          <Container>
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold">
                  A marketplace built around choice
                </h2>

                <p className="mt-4 leading-7 text-[var(--muted)]">
                  Explore listings across different categories, compare
                  available options and connect with sellers. From everyday
                  products to larger purchases, Yetesikaso makes it easier
                  to find what you are looking for.
                </p>

                <p className="mt-4 leading-7 text-[var(--muted)]">
                  Sellers can create listings, showcase their products and
                  services, communicate with potential buyers and manage
                  their marketplace activity.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Choose • Verify • Pay
                </h2>

                <p className="mt-4 leading-7 text-[var(--muted)]">
                  Our approach encourages buyers to choose carefully, check
                  the details of a listing and seller, and understand the
                  payment arrangements before completing a purchase.
                </p>

                <p className="mt-4 leading-7 text-[var(--muted)]">
                  We bring discovery, communication, orders and payment
                  options together to make the marketplace experience easier
                  to navigate.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Fafameso Plus */}
        <section className="border-y border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <Container>
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                  An additional service from Yetesikaso
                </p>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Introducing Fafameso Plus
                </h2>

                <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                  Buying and selling can involve more than finding the right
                  product. Fafameso Plus adds payment and delivery support to
                  the marketplace experience.
                </p>

                <p className="mt-4 leading-7 text-[var(--muted)]">
                  Through Fafameso Plus, customers can access direct payment,
                  dispatch and delivery services, helping bring more of the
                  buying process together.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-7 sm:p-9">
                <h3 className="text-xl font-bold">
                  More support beyond the listing
                </h3>

                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="font-semibold">Direct Payment</h4>
                    <p className="mt-2 leading-7 text-[var(--muted)]">
                      Access direct payment arrangements through the
                      Fafameso Plus service.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Dispatch</h4>
                    <p className="mt-2 leading-7 text-[var(--muted)]">
                      Arrange dispatch as part of the service.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Delivery</h4>
                    <p className="mt-2 leading-7 text-[var(--muted)]">
                      Access delivery support to help get purchases to
                      their destination.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Closing CTA */}
        <section className="py-16 sm:py-20">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Ready to explore Yetesikaso?
                </h2>

                <p className="mt-2 text-[var(--muted)]">
                  Discover listings, connect with sellers or start selling
                  on the marketplace.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/marketplace"
                  className="rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Browse Listings
                </Link>

                <Link
                  href="/dashboard/create"
                  className="rounded-lg border border-[var(--border)] px-5 py-3 text-sm font-semibold"
                >
                  Post a Listing
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
