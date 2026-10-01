import type { Metadata } from "next"

import Container from "@/components/layout/container"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Privacy Policy | Yetesikaso",
  description: "Read the Yetesikaso Privacy Policy.",
}

export default function PrivacyPage() {
  return (
    <>
      <main>
        <section className="border-b border-[var(--border)] bg-[var(--card)] py-16">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Legal
              </p>

              <h1 className="text-4xl font-bold tracking-tight">
                Privacy Policy
              </h1>

              <p className="mt-4 text-[var(--muted)]">
                Last updated: October 1, 2026
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <article className="prose max-w-3xl">
              <h2>1. Information we collect</h2>
              <p>
                When you use Yetesikaso, we may collect information you provide
                when creating an account, publishing a listing, communicating
                with other users, placing an order or contacting support.
              </p>

              <h2>2. How we use information</h2>
              <p>
                We use information to provide and operate the marketplace,
                manage accounts and listings, process orders and payments,
                communicate with users, provide support and maintain the
                security of the platform.
              </p>

              <h2>3. Marketplace information</h2>
              <p>
                Information associated with listings and seller profiles may
                be displayed to other users where necessary for the operation
                of the marketplace.
              </p>

              <h2>4. Payments</h2>
              <p>
                Payments made through Yetesikaso may be processed by our
                payment service providers. Payment information is handled
                according to the applicable provider&apos;s systems and
                policies.
              </p>

              <h2>5. Communications</h2>
              <p>
                We may use your contact information to provide account,
                transaction and service-related communications.
              </p>

              <h2>6. Security</h2>
              <p>
                We take reasonable measures to protect information associated
                with the platform. However, no online service can guarantee
                absolute security.
              </p>

              <h2>7. Your choices</h2>
              <p>
                You may review and manage information associated with your
                account through the available account features or contact us
                if you need assistance.
              </p>

              <h2>8. Changes to this policy</h2>
              <p>
                We may update this policy from time to time. Changes will be
                reflected on this page with an updated date.
              </p>
            </article>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
