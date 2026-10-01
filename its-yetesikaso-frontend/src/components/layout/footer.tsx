import Image from "next/image"
import Link from "next/link"

import Container from "./container"

const marketplaceLinks = [
  { label: "Browse Listings", href: "/marketplace" },
  { label: "Electronics", href: "/marketplace?category=electronics" },
  { label: "Vehicles", href: "/marketplace?category=vehicles" },
  { label: "Property", href: "/marketplace?category=property" },
  { label: "Furniture", href: "/marketplace?category=furniture" },
  { label: "Other", href: "/marketplace?category=other" },
  { label: "Saved Listings", href: "/saved" },
]

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Support", href: "/support" },
]

const accountLinks = [
  { label: "My Profile", href: "/profile" },
  { label: "My Orders", href: "/orders" },
  { label: "Messages", href: "/messages" },
  { label: "Post a Listing", href: "/dashboard/create" },
]

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]">
      <Container>
        <div className="grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="Yetesikaso home"
            >
              <Image
                src="/images/Yetesikaso New Logo.png"
                alt="Yetesikaso"
                width={200}
                height={66}
                className="h-auto w-[190px] object-contain"
              />
            </Link>

            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              A trusted marketplace for buying and selling goods and services
              in Ghana.
            </p>

            <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
              Choose • Verify • Pay
            </p>
          </div>

          <FooterColumn title="Marketplace" links={marketplaceLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Your Account" links={accountLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--border)] py-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Yetesikaso. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/privacy"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Help & Support
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
        {title}
      </h3>

      <nav className="space-y-3" aria-label={title}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
