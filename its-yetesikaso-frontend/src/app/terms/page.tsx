import type { Metadata } from "next"

import Container from "@/components/layout/container"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Terms of Service | Yetesikaso",
  description: "Read the Yetesikaso Terms of Service.",
}

export default function TermsPage() {
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
                Terms of Service
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
              <h2>1. Using Yetesikaso</h2>
              <p>
                Yetesikaso provides an online marketplace that allows users to
                discover listings, communicate with other users and, where
                available, complete purchases through the platform.
              </p>

              <h2>2. Accounts</h2>
              <p>
                You are responsible for providing accurate information when
                creating an account and for keeping your account credentials
                secure.
              </p>

              <h2>3. Listings</h2>
              <p>
                Sellers are responsible for the accuracy and legality of their
                listings, including descriptions, prices, images and other
                information provided to buyers.
              </p>

              <h2>4. Buyers</h2>
              <p>
                Buyers should review listing information carefully before
                proceeding with a purchase. Yetesikaso does not guarantee the
                condition, quality or suitability of goods or services listed
                by users unless expressly stated by Yetesikaso.
              </p>

              <h2>5. Payments and orders</h2>
              <p>
                Where purchases are completed through Yetesikaso, payment and
                order information will be handled through the platform and its
                payment providers. Order status may change as payment and
                fulfilment progress.
              </p>

              <h2>6. Prohibited activity</h2>
              <p>
                Users must not use Yetesikaso for unlawful activity, fraudulent
                transactions, misleading listings, abuse of other users or
                activity that compromises the security or operation of the
                platform.
              </p>

              <h2>7. Platform availability</h2>
              <p>
                We work to keep Yetesikaso available and functioning properly,
                but we cannot guarantee uninterrupted access at all times.
              </p>

              <h2>8. Changes</h2>
              <p>
                These terms may be updated from time to time. Continued use of
                the platform after changes take effect constitutes acceptance
                of the updated terms where applicable.
              </p>
            </article>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
