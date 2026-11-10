
import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  PackageCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"

export const metadata: Metadata = {
  title: "Fafameso Plus | Yetesikaso",
  description:
    "Discover Fafameso Plus, a convenient way to buy eligible listings online through Yetesikaso with Paystack payments and coordinated delivery.",
}

const buyerSteps = [
  {
    number: "01",
    title: "Find a Fafameso Plus listing",
    description:
      "Look for the Fafameso Plus badge on participating listings in the marketplace.",
    icon: ShoppingBag,
  },
  {
    number: "02",
    title: "Buy securely online",
    description:
      "Choose your quantity and complete payment through the online Paystack checkout.",
    icon: CreditCard,
  },
  {
    number: "03",
    title: "Delivery is coordinated",
    description:
      "Following successful payment, Yetesikaso coordinates the delivery arrangements for your order.",
    icon: Truck,
  },
]

export default function FafamesoPlusPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      {/* HERO */}
      <section className="bg-[#F58220] py-16 text-[#073A78] sm:py-24">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full border border-[#073A78]/25 bg-white/20 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em]">
              A better way to shop on Yetesikaso
            </span>

            <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-6xl">
              Fafameso Plus
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed sm:text-xl">
              Discover products, buy online and let Yetesikaso
              coordinate delivery.
            </p>

            <p className="mx-auto mt-4 max-w-2xl leading-relaxed">
              Fafameso Plus makes shopping more convenient by
              bringing online payment and coordinated delivery
              together for approved marketplace listings.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/marketplace"
                style={{ color: "#ffffff" }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#073A78] px-7 py-3.5 font-bold text-white transition hover:bg-[#0b509e] sm:w-auto"
              >
                Explore Marketplace
                <ArrowRight size={18} />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#073A78] px-7 py-3.5 font-bold transition hover:bg-[#073A78] hover:text-white sm:w-auto"
              >
                How It Works
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* INTRODUCTION */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-[#F58220]">
                  Introducing Fafameso Plus
                </span>

                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  More convenience when buying and selling
                </h2>

                <p className="mt-5 leading-8 text-[var(--muted)]">
                  Yetesikaso connects buyers and sellers across
                  Ghana. With Fafameso Plus, selected listings
                  also support direct online purchasing.
                </p>

                <p className="mt-4 leading-8 text-[var(--muted)]">
                  Instead of arranging payment separately with
                  the seller, buyers can complete checkout
                  through Yetesikaso, with delivery coordination
                  following successful payment.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <CreditCard className="mt-1 shrink-0 text-[#F58220]" size={26} />
                  <div>
                    <h3 className="font-bold">
                      Online checkout
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Pay for eligible listings through the
                      integrated Paystack payment service.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <PackageCheck className="mt-1 shrink-0 text-[#F58220]" size={26} />
                  <div>
                    <h3 className="font-bold">
                      Coordinated orders
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Your purchase is recorded in your
                      Yetesikaso account.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <Truck className="mt-1 shrink-0 text-[#F58220]" size={26} />
                  <div>
                    <h3 className="font-bold">
                      Delivery coordination
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Yetesikaso coordinates delivery arrangements
                      for completed Fafameso Plus purchases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* BUYER STEPS */}
      <section
        id="how-it-works"
        className="scroll-mt-44 bg-[#073A78] py-16 text-white sm:py-20"
      >
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-[#ffb36b]">
                Simple and convenient
              </span>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                How Fafameso Plus works
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
                From finding a product to placing your order,
                the process is designed to be straightforward.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {buyerSteps.map((step) => {
                const Icon = step.icon

                return (
                  <div
                    key={step.number}
                    className="rounded-2xl border border-white/15 bg-white/10 p-7"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F58220] text-[#073A78]">
                        <Icon size={25} />
                      </div>

                      <span className="text-3xl font-extrabold text-white/30">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="mt-7 text-xl font-bold">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-blue-100">
                      {step.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* SELLERS */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-7 sm:p-12 md:grid-cols-2">
            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F58220] text-[#073A78]">
                <Store size={28} />
              </div>

              <span className="text-sm font-bold uppercase tracking-widest text-[#F58220]">
                For sellers
              </span>

              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                Sell with Fafameso Plus
              </h2>

              <p className="mt-5 leading-8 text-[var(--muted)]">
                Sellers can request Fafameso Plus for their
                listings. Once approved by Yetesikaso, eligible
                products can be purchased directly through
                the platform.
              </p>

              <Link
                href="/become-a-seller"
                style={{ color: "#ffffff" }}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#073A78] px-6 py-3.5 font-bold text-white transition hover:bg-[#0b509e]"
              >
                Become a Seller
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 rounded-xl bg-[var(--background)] p-5">
                <BadgeCheck className="shrink-0 text-[#F58220]" size={25} />
                <div>
                  <p className="font-semibold">
                    Request Fafameso Plus
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Submit your listing for consideration.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl bg-[var(--background)] p-5">
                <BadgeCheck className="shrink-0 text-[#F58220]" size={25} />
                <div>
                  <p className="font-semibold">
                    Approval by Yetesikaso
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Only approved listings receive access
                    to Fafameso Plus online checkout.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl bg-[var(--background)] p-5">
                <BadgeCheck className="shrink-0 text-[#F58220]" size={25} />
                <div>
                  <p className="font-semibold">
                    Reach buyers ready to purchase
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Buyers can place orders directly without
                    arranging separate payment with you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#F58220] py-14 text-center text-[#073A78]">
        <Container>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Discover Fafameso Plus
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7">
            Explore the marketplace and look for listings
            carrying the Fafameso Plus badge.
          </p>

          <Link
            href="/marketplace"
            style={{ color: "#ffffff" }}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#073A78] px-7 py-3.5 font-bold text-white transition hover:bg-[#0b509e]"
          >
            Browse Marketplace
            <ArrowRight size={18} />
          </Link>
        </Container>
      </section>

      <Footer />
    </main>
  )
}
