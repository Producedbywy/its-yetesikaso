
import type { Metadata } from "next"

import Container from "@/components/layout/container"
import Footer from "@/components/layout/footer"
import Navbar from "@/components/layout/navbar"

export const metadata: Metadata = {
  title: "About Us | Yetesikaso",
  description:
    "Yetesikaso is a digital marketplace that specializes in the trading of new and used Home and Office Products.",
}

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="border-b border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-4xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                About Yetesikaso
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                About Us
              </h1>

              <p className="mt-8 text-lg leading-9 text-[var(--muted)]">
                Yetesikaso is a digital marketplace that specializes
                in the trading of new and used Home and Office
                Products. We offer a convenient platform to showcase
                and trade a diverse range of high-quality items.
                From furniture to electronics and more, our
                marketplace connects you with eager buyers, ensuring
                seamless transactions and maximum exposure for your
                products.
              </p>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
