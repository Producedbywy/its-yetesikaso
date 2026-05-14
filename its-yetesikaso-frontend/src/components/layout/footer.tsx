import Container from './container'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white py-14">
      <Container>
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-2xl font-bold">
              Its Yetesikaso
            </h3>

            <p className="text-[var(--muted)]">
              Choose • Verify • Pay
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">
              Marketplace
            </h4>

            <div className="space-y-3 text-[var(--muted)]">
              <Link href="/">Electronics</Link>
              <br />
              <Link href="/">Vehicles</Link>
              <br />
              <Link href="/">Property</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">
              Company
            </h4>

            <div className="space-y-3 text-[var(--muted)]">
              <Link href="/">About</Link>
              <br />
              <Link href="/">Contact</Link>
              <br />
              <Link href="/">Support</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">
              Legal
            </h4>

            <div className="space-y-3 text-[var(--muted)]">
              <Link href="/">Privacy</Link>
              <br />
              <Link href="/">Terms</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
          © 2026 Its Yetesikaso. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}