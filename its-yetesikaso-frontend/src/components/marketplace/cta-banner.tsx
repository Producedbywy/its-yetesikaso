import Link from "next/link"

import Container from "@/components/layout/container"

export default function CtaBanner() {
  return (
    <section className="py-12 md:py-14">
      <Container>
        <div className="rounded-[32px] bg-gray-900 p-8 md:p-12">
          <div className="max-w-3xl text-white">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">
              Start Selling
            </p>

            <h2 className="mb-5 text-3xl font-bold md:text-5xl">
              Reach buyers across Ghana.
            </h2>

            <p className="mb-8 text-lg text-white/70">
              Create a listing, showcase what you are selling, and connect
              with buyers through Yetesikaso.
            </p>

            <Link
              href="/dashboard/create"
              className="inline-flex rounded-2xl bg-lime-400 px-8 py-4 font-medium text-black transition hover:bg-lime-300"
            >
              Post Your Listing
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}