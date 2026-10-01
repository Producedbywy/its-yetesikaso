import type { Metadata } from "next"
import Link from "next/link"

import Container from "@/components/layout/container"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Support | Yetesikaso",
  description:
    "Find help with buying, selling, payments, orders and your Yetesikaso account.",
}

const supportTopics = [
  {
    title: "Buying",
    description:
      "Browse listings, review seller information, save items and proceed with purchases through Yetesikaso.",
    href: "/marketplace",
    label: "Browse Listings",
  },
  {
    title: "Selling",
    description:
      "Create and manage your listings from your seller dashboard.",
    href: "/dashboard",
    label: "Seller Dashboard",
  },
  {
    title: "Orders",
    description:
      "View your orders and check payment and fulfilment information.",
    href: "/orders",
    label: "View Orders",
  },
  {
    title: "Account",
    description:
      "Manage your profile and account information.",
    href: "/profile",
    label: "My Profile",
  },
]

export default function SupportPage() {
  return (
    <>
      <main>
        <section className="border-b border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Support
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                How can we help?
              </h1>

              <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
                Find your way around Yetesikaso or get help with buying,
                selling, orders and your account.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="grid gap-6 sm:grid-cols-2">
              {supportTopics.map((topic) => (
                <div
                  key={topic.title}
                  className="rounded-2xl border border-[var(--border)] p-7"
                >
                  <h2 className="text-xl font-bold">{topic.title}</h2>

                  <p className="mt-3 leading-7 text-[var(--muted)]">
                    {topic.description}
                  </p>

                  <Link
                    href={topic.href}
                    className="mt-5 inline-flex font-semibold text-[var(--primary)]"
                  >
                    {topic.label}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-[var(--border)] p-7">
              <h2 className="text-xl font-bold">Still need help?</h2>

              <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                If you cannot find what you need, contact the Yetesikaso team
                and provide as much relevant information as possible.
              </p>

              <Link
                href="/contact"
                className="mt-5 inline-flex rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
              >
                Contact Us
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
