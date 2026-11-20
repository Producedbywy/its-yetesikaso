
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import Container from "@/components/layout/container"
import Footer from "@/components/layout/footer"
import Navbar from "@/components/layout/navbar"
import SellerBannerSlider from "@/components/marketplace/seller-banner-slider"
import SellerEnquiryForm from "@/components/marketplace/seller-enquiry-form"

export const metadata: Metadata = {
  title: "Become a Seller | Yetesikaso",
  description:
    "Start selling on Yetesikaso. Apply to become a seller, complete verification and reach customers across Ghana.",
}

const sellingSteps = [
  {
    number: "1",
    title: "Application",
    description:
      "Create your account and tell us about your business, products or services.",
    icon: "application",
  },
  {
    number: "2",
    title: "Verification",
    description:
      "Provide your seller information and Ghana Card details for identity review.",
    icon: "verification",
  },
  {
    number: "3",
    title: "Approval",
    description:
      "Our team reviews your application and confirms your seller status.",
    icon: "approval",
  },
  {
    number: "4",
    title: "Onboarding",
    description:
      "Set up your seller profile and get familiar with your Seller Dashboard.",
    icon: "onboarding",
  },
  {
    number: "5",
    title: "Sales",
    description:
      "Create your listings and make your products or services available to buyers.",
    icon: "sales",
  },
  {
    number: "6",
    title: "Growth",
    description:
      "Manage your listings, connect with customers and grow your business.",
    icon: "growth",
  },
]

const faqs = [
  {
    question: "How do I start selling on Yetesikaso?",
    answer:
      "Create an account, complete your seller application and submit your identity details for review. Once approved, you can access your Seller Dashboard and publish listings.",
  },
  {
    question: "What information is required to become a seller?",
    answer:
      "You will need your seller display name, contact details, location, a short description of your business or selling activity, and your Ghana Card name and number.",
  },
  {
    question: "How does seller verification work?",
    answer:
      "Your application is reviewed using the information you provide. You can check your verification status from your Profile page. If corrections are needed, you can update your information and resubmit.",
  },
  {
    question: "Can I sell before my application is approved?",
    answer:
      "Seller publishing access is subject to approval. Once your account is approved, you can use the Seller Dashboard to create and manage listings.",
  },
]

function StepIcon({ type }: { type: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-11 w-11"
      aria-hidden="true"
    >
      {type === "application" && (
        <>
          <rect x="10" y="7" width="28" height="35" rx="3" />
          <path d="M17 7V4h14v3M17 18h14M17 25h10M17 32h8" />
          <path d="m30 33 8-8 3 3-8 8-5 2z" />
        </>
      )}

      {type === "verification" && (
        <>
          <rect x="5" y="9" width="38" height="30" rx="4" />
          <circle cx="16" cy="22" r="5" />
          <path d="M9 33c1-5 13-5 14 0M28 18h9M28 24h9" />
          <path d="m29 31 3 3 6-7" />
        </>
      )}

      {type === "approval" && (
        <>
          <path d="M24 4 39 10v13c0 10-6 16-15 21C15 39 9 33 9 23V10z" />
          <path d="m16 24 6 6 11-12" />
        </>
      )}

      {type === "onboarding" && (
        <>
          <rect x="6" y="8" width="36" height="27" rx="2" />
          <path d="M3 40h42M18 35v5M30 35v5" />
          <path d="M14 17h20M14 23h12M14 29h16" />
        </>
      )}

      {type === "sales" && (
        <>
          <path d="M10 17h28l-3 25H13z" />
          <path d="M17 19v-7a7 7 0 0 1 14 0v7" />
          <path d="m18 29 5 5 8-9" />
        </>
      )}

      {type === "growth" && (
        <>
          <path d="M7 39V27M17 39V21M27 39V14M37 39V7" />
          <path d="M5 18 17 10l9 5L41 3" />
          <path d="M33 3h8v8" />
        </>
      )}
    </svg>
  )
}

export default function BecomeASellerPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* LARGE BANNER SLIDER */}
        <SellerBannerSlider />

        {/* SELLER INTRODUCTION */}
        <section className="py-20 sm:py-24 lg:py-28">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <p className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-lime-600 dark:text-lime-400">
                  Ghana&apos;s online marketplace
                </p>

                <h1 className="max-w-xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[56px]">
                  Grow your business with Yetesikaso.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
                  Join a growing marketplace connecting sellers with
                  customers across Ghana. Showcase your products and
                  services, manage your listings and discover new
                  opportunities to grow.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/register/seller"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-bold text-[#111827] transition hover:bg-[var(--primary-dark)]"
                  >
                    Become a seller
                  </Link>

                  <Link
                    href="/login/seller"
                    className="text-sm font-semibold underline underline-offset-4 transition hover:text-lime-600"
                  >
                    Already registered? Log in
                  </Link>
                </div>
              </div>

              <div className="relative h-[350px] overflow-hidden rounded-2xl sm:h-[450px] lg:h-[490px]">
                <Image
                  src="/images/hero/marketplace.jpg"
                  alt="Explore products and selling opportunities on Yetesikaso"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* SIX-STEP SELLER PROCESS */}
        <section className="bg-[var(--primary)] py-14 text-[#111827] sm:py-16">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
            <h2 className="text-center font-serif text-xl font-medium uppercase tracking-wide sm:text-2xl">
              Start selling online in just a few easy steps
            </h2>

            <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-6">
              {sellingSteps.map((step) => (
                <div
                  key={step.number}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-700 bg-white text-slate-800 shadow-sm">
                    <StepIcon type={step.icon} />

                    <span className="absolute -left-2 -top-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-500 bg-slate-700 text-lg font-bold text-white">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-8 font-serif text-[23px] font-medium">
                    {step.title}
                  </h3>

                  <p className="mt-5 max-w-[210px] text-sm leading-6">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 sm:py-24 lg:py-28">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-lime-600 dark:text-lime-400">
                  FAQ
                </p>

                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Ask us anything.
                </h2>

                <p className="mt-6 max-w-md text-lg leading-8 text-[var(--muted)]">
                  Have questions about becoming a seller, verification
                  or managing your listings? We&apos;re here to help you
                  get started with confidence.
                </p>

                <Link
                  href="/support"
                  className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--primary)] px-8 text-sm font-bold text-[#111827] transition hover:bg-[var(--primary-dark)]"
                >
                  Contact Support
                </Link>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details
                    key={faq.question}
                    open={index === 0}
                    className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 bg-[var(--background)] px-6 py-6 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                      <span>{faq.question}</span>

                      <span
                        aria-hidden="true"
                        className="text-2xl font-light text-lime-600 transition-transform group-open:rotate-180"
                      >
                        ⌄
                      </span>
                    </summary>

                    <div className="border-t border-[var(--border)] px-6 py-6">
                      <p className="leading-8 text-[var(--muted)]">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>


        {/* SELLER CONTACT SECTION */}
        <section
          id="seller-support"
          className="border-t border-[var(--border)] bg-[var(--card)] py-20 sm:py-24 lg:py-28"
        >
          <Container>
            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <p className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-lime-600 dark:text-lime-400">
                  Get in touch
                </p>

                <h2 className="max-w-lg text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  We&apos;d love to hear from you.
                </h2>

                <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--muted)]">
                  Whether you&apos;re preparing to become a seller,
                  checking your application or looking for marketplace
                  assistance, the Yetesikaso team is here to help.
                </p>
              </div>

              <SellerEnquiryForm />
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
