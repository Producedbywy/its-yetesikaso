
import Link from "next/link"
import {
  Store,
  House,
  CarFront,
  BriefcaseBusiness,
  ArrowRight,
} from "lucide-react"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"

const postingOptions = [
  {
    title: "Property",
    description: "Sell or rent property",
    href: "/dashboard/create?category=property_land",
    icon: House,
  },
  {
    title: "Cars",
    description: "List vehicles",
    href: "/dashboard/create?category=vehicles",
    icon: CarFront,
  },
  {
    title: "Jobs",
    description: "Advertise jobs",
    href: "/employer/jobs/create",
    icon: BriefcaseBusiness,
  },
]

export default function PostListingPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="py-10 md:py-16">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-8 lg:p-10">

            {/* HEADER */}
            <div className="mb-9 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold md:text-3xl">
                Post a Listing
              </h1>

              <p className="text-sm text-[var(--muted)]">
                Choose a category to get started
              </p>
            </div>

            {/* FEATURED MARKETPLACE OPTION */}
            <div className="rounded-2xl border border-[var(--border)] p-5 md:p-7">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                  <Store size={26} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold md:text-2xl">
                    Marketplace
                  </h2>

                  <p className="mt-1 text-sm text-[var(--muted)] md:text-base">
                    Sell products and everyday items
                  </p>
                </div>

                <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-900">
                  Free
                </span>
              </div>

              <Link
                href="/dashboard/create"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-lime-400 px-5 py-4 text-center text-base font-bold text-black transition hover:bg-lime-300 md:text-lg"
              >
                + Post a Free Listing
                <ArrowRight size={20} />
              </Link>
            </div>

            {/* OTHER POSTING OPTIONS */}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {postingOptions.map((option) => {
                const Icon = option.icon

                return (
                  <Link
                    key={option.title}
                    href={option.href}
                    className="group flex min-h-48 flex-col items-center justify-center rounded-2xl border border-[var(--border)] p-6 text-center transition hover:border-lime-400 hover:bg-[var(--background)] hover:shadow-sm"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                      <Icon size={27} />
                    </div>

                    <h2 className="text-lg font-bold">
                      {option.title}
                    </h2>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {option.description}
                    </p>

                    <ArrowRight
                      size={18}
                      className="mt-4 text-lime-600 transition group-hover:translate-x-1"
                    />
                  </Link>
                )
              })}
            </div>

          </div>
        </Container>
      </section>

      <Footer />
    </main>
  )
}
