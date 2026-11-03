
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import Container from "@/components/layout/container"
import Footer from "@/components/layout/footer"
import Navbar from "@/components/layout/navbar"

import yetesikasoLogo from "../../../public/images/Yetesikaso New Logo.png"
import recyclingHero from "../../../public/images/sustainability/recycling-hero.png"
import wasteToValue from "../../../public/images/sustainability/waste-to-value.png"
import collectionPoints from "../../../public/images/sustainability/collection-points.png"

export const metadata: Metadata = {
  title: "Sustainability & Recycling | Yetesikaso",
  description:
    "Discover Yetesikaso's sustainability initiative, recycling materials and planned community drop-off locations in Ghana.",
}

const materials = [
  {
    icon: "♻",
    title: "Plastics",
    description: "Bottles and suitable plastic containers.",
  },
  {
    icon: "▤",
    title: "Paper & Cardboard",
    description: "Paper, cartons and recyclable packaging.",
  },
  {
    icon: "◉",
    title: "Metals",
    description: "Aluminium cans and suitable scrap metals.",
  },
  {
    icon: "▣",
    title: "Electronics",
    description: "Selected electronic items and equipment.",
  },
]

const steps = [
  {
    number: "01",
    title: "Collect",
    description: "Gather and separate your recyclable materials.",
  },
  {
    number: "02",
    title: "Drop Off",
    description: "Bring them to an approved collection point once open.",
  },
  {
    number: "03",
    title: "Recycle",
    description: "Materials can be sorted for onward recycling.",
  },
]

const preparationTips = [
  {
    number: "01",
    title: "Separate your materials",
    description:
      "Keep plastics, paper and metals in separate groups where possible.",
  },
  {
    number: "02",
    title: "Keep items clean and dry",
    description:
      "Empty containers and keep paper away from food waste or liquids.",
  },
  {
    number: "03",
    title: "Check accepted materials",
    description:
      "Confirm what each collection point accepts before visiting.",
  },
]

export default function SustainabilityPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* =========================
            HERO
        ========================= */}
        <section className="relative overflow-hidden bg-[#103b2c] text-white">
          <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />

          <Container>
            <div className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-20 lg:gap-14">
              <div>
                {/* Yetesikaso branding */}
                <div className="mb-7 inline-flex max-w-[280px] rounded-xl bg-white p-3">
                  <Image
                    src={yetesikasoLogo}
                    alt="Yetesikaso Marketplace"
                    className="h-16 w-full object-contain"
                    priority
                  />
                </div>

                <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
                  A Yetesikaso Sustainability Initiative
                </p>

                <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Recycle Today.
                  <span className="mt-2 block text-lime-400">
                    Greener Ghana.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-8 text-emerald-50/85 md:text-lg">
                  We are working to make recycling more accessible
                  by establishing locations where individuals and
                  businesses can bring recyclable materials for
                  responsible handling.
                </p>

                <p className="mt-4 max-w-lg leading-7 text-emerald-50/75">
                  Together, we can encourage better recycling habits,
                  recover useful materials and contribute towards
                  cleaner communities.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="#materials"
                    className="rounded-xl bg-lime-400 px-6 py-3.5 text-sm font-bold text-[#103b2c] transition hover:bg-lime-300"
                  >
                    Explore Recycling
                  </Link>

                  <Link
                    href="#collection-points"
                    className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Collection Points
                  </Link>
                </div>
              </div>

              {/* Hero image */}
              <div className="relative">
                <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-2 shadow-2xl shadow-black/20">
                  <Image
                    src={recyclingHero}
                    alt="Illustration of community participation in recycling in Ghana"
                    className="block h-auto w-full rounded-2xl"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="h-1 w-10 rounded-full bg-lime-400" />
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-50/75">
                    Reduce Waste • Recover Value • Recycle
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* =========================
            MATERIALS
        ========================= */}
        <section
          id="materials"
          className="scroll-mt-28 py-14 md:py-16"
        >
          <Container>
            <div className="mb-9 max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Recycling with Yetesikaso
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What can you recycle?
              </h2>

              <p className="mt-4 leading-7 text-[var(--muted)]">
                We are exploring these material categories as part
                of our recycling initiative. The final list of
                accepted materials will be confirmed before
                collection services begin.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {materials.map((material) => (
                <div
                  key={material.title}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400/15 text-3xl text-emerald-700">
                    {material.icon}
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {material.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {material.description}
                  </p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-12 border-t border-[var(--border)] pt-10">
              <div className="mb-7">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  The Recycling Process
                </p>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  How it will work
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#103b2c] text-sm font-bold text-lime-400">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* =========================
            FROM WASTE TO VALUE
        ========================= */}
        <section className="border-y border-[var(--border)] bg-[var(--card)] py-14 md:py-16">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              {/* Recycling image */}
              <div>
                <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--background)] shadow-sm">
                  <Image
                    src={wasteToValue}
                    alt="Illustration of recyclable materials being sorted for recovery"
                    className="block h-auto w-full"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                <p className="mt-3 text-xs text-[var(--muted)]">
                  Illustrative concept imagery for the planned initiative.
                </p>
              </div>

              {/* Information */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  From Waste to Value
                </p>

                <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  What we throw away can have a second life.
                </h2>

                <p className="mt-5 leading-8 text-[var(--muted)]">
                  Recycling helps recover useful materials that
                  might otherwise end up in landfills or the
                  environment. Plastic, paper, metals and selected
                  electronics can often be processed and used again.
                </p>

                <p className="mt-4 leading-8 text-[var(--muted)]">
                  Through this initiative, Yetesikaso aims to
                  encourage households and businesses to take part
                  in responsible material recovery and support
                  cleaner communities across Ghana.
                </p>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  {[
                    "Reduce Waste",
                    "Recover Resources",
                    "Cleaner Communities",
                  ].map((benefit) => (
                    <div
                      key={benefit}
                      className="rounded-xl border border-emerald-800/15 bg-emerald-700/5 px-3 py-4 text-center"
                    >
                      <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-lime-400" />
                      <p className="text-xs font-bold leading-5 text-emerald-800 sm:text-sm">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preparing materials */}
            <div className="mt-12 rounded-3xl bg-[#103b2c] p-7 text-white sm:p-9">
              <div className="mb-7">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
                  Getting Started
                </p>

                <h3 className="text-2xl font-bold">
                  Prepare your materials for recycling.
                </h3>

                <p className="mt-3 text-sm leading-7 text-emerald-50/80">
                  A few simple steps can make materials easier
                  to sort and handle.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {preparationTips.map((tip) => (
                  <div key={tip.number} className="flex gap-4">
                    <span className="text-sm font-bold text-lime-400">
                      {tip.number}
                    </span>

                    <div>
                      <h4 className="font-bold">
                        {tip.title}
                      </h4>

                      <p className="mt-2 text-sm leading-6 text-emerald-50/75">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-7 text-xs leading-6 text-emerald-50/65">
                Final preparation guidelines will be announced
                before drop-off services begin.
              </p>
            </div>
          </Container>
        </section>

        {/* =========================
            COLLECTION POINTS
        ========================= */}
        <section
          id="collection-points"
          className="scroll-mt-28 bg-[#103b2c] py-14 text-white md:py-16"
        >
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
                  Recycling Drop-off Locations
                </p>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Collection points are coming soon.
                </h2>

                <p className="mt-5 leading-8 text-emerald-50/85">
                  Yetesikaso is currently establishing recycling
                  drop-off locations where people will be able
                  to bring suitable recyclable materials.
                </p>

                <p className="mt-4 leading-8 text-emerald-50/85">
                  Once confirmed, we will publish addresses,
                  opening hours and accepted materials for
                  each collection point.
                </p>

                <div className="mt-6 rounded-xl border border-lime-300/25 bg-white/10 px-5 py-4">
                  <p className="text-sm font-semibold text-lime-300">
                    Current status: Locations being established
                  </p>

                  <p className="mt-2 text-sm leading-6 text-emerald-50/80">
                    No Yetesikaso collection points are currently
                    open. Please wait for official confirmation
                    before bringing materials.
                  </p>
                </div>

                <p className="mt-6 leading-7 text-emerald-50/80">
                  Are you a recycling organisation, business
                  or potential collection partner? We'd
                  welcome your enquiry.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="rounded-xl bg-lime-400 px-6 py-3.5 text-sm font-bold text-[#103b2c] transition hover:bg-lime-300"
                  >
                    Get in Touch
                  </Link>

                  <Link
                    href="/marketplace"
                    className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Back to Marketplace
                  </Link>
                </div>
              </div>

              {/* Collection points image */}
              <div>
                <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-2 shadow-xl shadow-black/20">
                  <Image
                    src={collectionPoints}
                    alt="Concept of a future Yetesikaso recycling collection point"
                    className="block h-auto w-full rounded-2xl"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                <p className="mt-3 text-xs text-emerald-50/65">
                  Concept visual only. Collection points are
                  not yet operational.
                </p>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
