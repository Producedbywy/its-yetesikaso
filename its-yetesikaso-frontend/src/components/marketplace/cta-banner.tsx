import Container from '@/components/layout/container'

export default function CtaBanner() {
  return (
    <section className="py-20">
      <Container>
        <div className="rounded-[40px] bg-lime-400 p-10 md:p-16">
          <div className="max-w-3xl text-gray-900">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900/70">
              Start Selling
            </p>

            <h2 className="mb-6 text-4xl font-bold md:text-6xl">
              Reach buyers across Ghana instantly.
            </h2>

            <p className="mb-8 text-lg text-gray-900/70">
              Post listings, discover opportunities, and connect with trusted buyers and sellers.
            </p>

            <button className="rounded-2xl bg-black px-8 py-4 font-medium text-white transition hover:opacity-90">
              Post Your Listing
            </button>
          </div>
        </div>
      </Container>
    </section>
  )
}