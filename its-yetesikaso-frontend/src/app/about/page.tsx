import type { Metadata } from "next"
import Link from "next/link"

import Container from "@/components/layout/container"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "About Us | Yetesikaso",
  description:
    "Learn more about Yetesikaso, a marketplace built to make buying and selling in Ghana simpler and more trustworthy.",
}

export default function AboutPage() {
  return (
    <>
      <main>
        <section className="border-b border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                About Yetesikaso
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                A simpler way to buy and sell in Ghana.
              </h1>

              <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
                Yetesikaso is a marketplace designed to connect buyers and
                sellers while making the buying process clearer, safer and
                easier to manage.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold">Our approach</h2>
                <p className="mt-4 leading-7 text-[var(--muted)]">
                  We believe online marketplaces should make it easier to
                  discover what you need without making the buying process
                  unnecessarily complicated.
                </p>
                <p className="mt-4 leading-7 text-[var(--muted)]">
                  Yetesikaso brings listings, communication, orders and
                  payments together in one place so buyers and sellers can
                  manage more of the process on the platform.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold">Choose • Verify • Pay</h2>
                <p className="mt-4 leading-7 text-[var(--muted)]">
                  Our approach is built around three simple ideas: find the
                  right listing, verify the details that matter, and complete
                  your purchase through the platform.
                </p>
                <p className="mt-4 leading-7 text-[var(--muted)]">
                  We are building Yetesikaso to be useful for everyday
                  marketplace transactions across Ghana.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--card)] py-16">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Ready to explore Yetesikaso?
                </h2>
                <p className="mt-2 text-[var(--muted)]">
                  Browse current listings or start selling your own.
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
