import type { Metadata } from "next"
import Link from "next/link"

import Container from "@/components/layout/container"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Contact Us | Yetesikaso",
  description:
    "Get in touch with the Yetesikaso team for questions, feedback or assistance.",
}

export default function ContactPage() {
  return (
    <>
      <main>
        <section className="border-b border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Contact Us
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                We&apos;re here to help.
              </h1>

              <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
                Have a question about Yetesikaso, your account, a listing or
                an order? Get in touch with our team.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] p-7">
                <h2 className="text-xl font-bold">General enquiries</h2>
                <p className="mt-3 leading-7 text-[var(--muted)]">
                  For general questions about the marketplace, accounts,
                  listings or how Yetesikaso works, contact our team.
                </p>

                <Link
                  href="/support"
                  className="mt-5 inline-flex font-semibold text-[var(--primary)]"
                >
                  Visit Support
                </Link>
              </div>

              <div className="rounded-2xl border border-[var(--border)] p-7">
                <h2 className="text-xl font-bold">Need help with an order?</h2>
                <p className="mt-3 leading-7 text-[var(--muted)]">
                  If you already have an order, check your Orders area first
                  for the latest payment and fulfilment information.
                </p>

                <Link
                  href="/orders"
                  className="mt-5 inline-flex font-semibold text-[var(--primary)]"
                >
                  View My Orders
                </Link>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7">
              <h2 className="text-xl font-bold">Before contacting us</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                For listing, payment or order issues, including the relevant
                order or listing details in your message will help us
                understand the issue and respond more efficiently.
              </p>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
