
import Link from "next/link"
import {
  ArrowRight,
  CarFront,
  House,
  Laptop,
  Shirt,
  Smartphone,
  Sofa,
  Tv,
  Wrench,
} from "lucide-react"

import Container from "@/components/layout/container"

const categories = [
  {
    label: "Property & Land",
    href: "/marketplace?category=property_land",
    icon: House,
  },
  {
    label: "Vehicles",
    href: "/marketplace?category=vehicles",
    icon: CarFront,
  },
  {
    label: "Phones & Tablets",
    href: "/marketplace?category=phones_tablets",
    icon: Smartphone,
  },
  {
    label: "Electronics",
    href: "/marketplace?category=electronics_appliances",
    icon: Tv,
  },
  {
    label: "Computers",
    href: "/marketplace?category=computers_office",
    icon: Laptop,
  },
  {
    label: "Home & Garden",
    href: "/marketplace?category=home_garden",
    icon: Sofa,
  },
  {
    label: "Fashion",
    href: "/marketplace?category=fashion",
    icon: Shirt,
  },
  {
    label: "Services",
    href: "/marketplace?category=services",
    icon: Wrench,
  },
]

export default function Categories() {
  return (
    <section className="py-7 md:py-9">
      <Container>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
              Shop by Category
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Find what you're looking for faster.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime-700 transition hover:text-lime-900"
          >
            Browse All
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8">
          {categories.map((category) => {
            const Icon = category.icon

            return (
              <Link
                key={category.href}
                href={category.href}
                className="group flex min-h-24 flex-col items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-4 text-center transition hover:border-lime-400 hover:bg-lime-50 hover:shadow-sm"
              >
                <Icon
                  size={25}
                  strokeWidth={1.8}
                  className="text-[var(--foreground)] transition group-hover:text-lime-700"
                  aria-hidden="true"
                />

                <span className="text-xs font-semibold leading-snug text-[var(--foreground)]">
                  {category.label}
                </span>
              </Link>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
