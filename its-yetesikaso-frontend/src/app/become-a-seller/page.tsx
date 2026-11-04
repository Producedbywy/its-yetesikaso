import type { Metadata } from "next"
import Link from "next/link"

import Container from "@/components/layout/container"
import Footer from "@/components/layout/footer"
import Navbar from "@/components/layout/navbar"

export const metadata: Metadata = {
  title: "Become a Seller | Yetesikaso",
  description:
    "Join Yetesikaso as a seller. Create an account, complete your seller application and reach customers across Ghana.",
}

const sellingSteps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Register for a Yetesikaso account using your username, email address and password. If you already have an account, simply log in.",
  },
  {
    number: "02",
    title: "Open your profile",
    description:
      "Once logged in, visit your Profile page. Select the Become a Seller option to begin your seller application.",
  },
  {
    number: "03",
    title: "Complete your application",
    description:
      "Provide your seller display name, contact details, location and a short description of what you intend to sell. You will also be asked for your Ghana Card name and number for verification.",
  },
  {
    number: "04",
    title: "Submit for review",
    description:
      "Submit your application for review. Your account will show a pending verification status while your application is being reviewed.",
  },
  {
    number: "05",
    title: "Access your seller tools",
    description:
      "Once your seller account is approved, you can access the Seller Dashboard and begin creating marketplace listings.",
  },
  {
    number: "06",
    title: "Create your listings",
    description:
      "Add your products or services with a clear title, description, price, category, location and relevant images. Keep your listing information accurate and up to date.",
  },
]

const listingDetails = [
  "A clear and descriptive title",
  "An accurate description of the product or service",
  "Your price and applicable pricing period",
  "The correct marketplace category",
  "Your location",
  "Clear images of the item, where applicable",
]

const faqs = [
  {
    question: "Do I need an account before becoming a seller?",
    answer:
      "Yes. You first create a standard Yetesikaso account. After logging in, open your Profile page and select Become a Seller.",
  },
  {
    question: "What information is needed for the application?",
    answer:
      "You will be asked for your seller display name, phone number, location, a short bio, your name as shown on your Ghana Card and your Ghana Card number.",
  },
  {
    question: "Can I create listings while my application is pending?",
    answer:
      "You can prepare listing information, but seller publishing access is subject to your account being approved. Your Seller Dashboard becomes available after approval.",
  },
  {
    question: "What happens if my application is rejected?",
    answer:
      "Your profile will show the verification status and the reason provided. You can review the information, make the necessary corrections and resubmit your application.",
  },
  {
    question: "What can I sell on Yetesikaso?",
    answer:
      "Yetesikaso supports a range of products and services, including property and land, vehicles, electronics, fashion, home and garden items, business equipment, food and agriculture, education and professional services.",
  },
]

export default function BecomeASellerPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <section className="border-b border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Sell on Yetesikaso
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Reach more customers. Start selling with Yetesikaso.
              </h1>

              <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
                Whether you sell products, offer services or run a business,
                Yetesikaso gives you a place to showcase what you offer and
                connect with potential customers across Ghana.
              </p>

              <p className="mt-4 leading-7 text-[var(--muted)]">
                Getting started is straightforward. Create an account,
                complete your seller application and, once approved, start
                publishing your listings.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white"
                >
                  Create an Account
                </Link>

                <Link
                  href="/login"
                  className="rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-semibold"
                >
                  Already Registered? Log In
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* BENEFITS */}
        <section className="py-16 sm:py-20">
          <Container>
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Why sell on Yetesikaso?
              </h2>

              <p className="mt-4 leading-7 text-[var(--muted)]">
                Bring your products and services to a marketplace where
                customers can discover listings, review information and
                communicate with sellers.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] p-6">
                <h3 className="text-lg font-semibold">
                  Showcase what you offer
                </h3>

                <p className="mt-3 leading-7 text-[var(--muted)]">
                  Create listings for your products or services and provide
                  customers with the information they need.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] p-6">
                <h3 className="text-lg font-semibold">
                  Connect with customers
                </h3>

                <p className="mt-3 leading-7 text-[var(--muted)]">
                  Give potential buyers a way to discover your listings and
                  communicate with you through the marketplace.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] p-6">
                <h3 className="text-lg font-semibold">
                  Manage your listings
                </h3>

                <p className="mt-3 leading-7 text-[var(--muted)]">
                  Use your Seller Dashboard to manage your marketplace
                  activity and keep your listings up to date.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* SELLER JOURNEY */}
        <section className="border-y border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <Container>
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Getting started
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How to become a seller
              </h2>

              <p className="mt-4 leading-7 text-[var(--muted)]">
                Follow these steps to apply, complete verification and start
                listing on Yetesikaso.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {sellingSteps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 sm:p-7"
                >
                  <p className="text-sm font-bold tracking-wider text-[var(--muted)]">
                    STEP {step.number}
                  </p>

                  <h3 className="mt-3 text-xl font-semibold">
                    {step.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[var(--muted)]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* LISTING GUIDANCE */}
        <section className="py-16 sm:py-20">
          <Container>
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Creating a listing
                </p>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  Make your listings clear and informative.
                </h2>

                <p className="mt-4 leading-7 text-[var(--muted)]">
                  When creating a listing, provide accurate information so
                  potential customers can understand exactly what you are
                  offering.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
                <h3 className="text-lg font-semibold">
                  Include the following:
                </h3>

                <ul className="mt-5 space-y-4">
                  {listingDetails.map((detail) => (
                    <li key={detail} className="flex gap-3">
                      <span
                        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-100 text-xs font-bold text-lime-800"
                        aria-hidden="true"
                      >
                        ✓
                      </span>

                      <span className="leading-6 text-[var(--muted)]">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 border-t border-[var(--border)] pt-5 text-sm leading-6 text-[var(--muted)]">
                  Services do not require a quantity entry. For products,
                  enter the number of units available.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* VERIFICATION */}
        <section className="border-y border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Seller verification
              </h2>

              <p className="mt-4 leading-7 text-[var(--muted)]">
                Seller applications include identity details for verification.
                Make sure the name and Ghana Card information you provide are
                accurate and match your identification.
              </p>

              <p className="mt-4 leading-7 text-[var(--muted)]">
                You can check your application status from your Profile page.
                If further information or corrections are needed, review the
                feedback shown there before resubmitting.
              </p>
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20">
          <Container>
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Seller help
              </p>

              <h2 className="text-3xl font-bold tracking-tight">
                Frequently asked questions
              </h2>
            </div>

            <div className="mt-8 max-w-3xl divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {faqs.map((faq) => (
                <div key={faq.question} className="py-6">
                  <h3 className="text-lg font-semibold">
                    {faq.question}
                  </h3>

                  <p className="mt-3 leading-7 text-[var(--muted)]">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CLOSING CTA */}
        <section className="border-t border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Ready to start selling?
                </h2>

                <p className="mt-2 leading-7 text-[var(--muted)]">
                  Create your account and take the first step towards
                  becoming a Yetesikaso seller.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Create an Account
                </Link>

                <Link
                  href="/profile"
                  className="rounded-lg border border-[var(--border)] px-5 py-3 text-sm font-semibold"
                >
                  Go to My Profile
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}