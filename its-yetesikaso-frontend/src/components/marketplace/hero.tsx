import Button from '../../components/shared/button'
import Container from '../../components/layout/container'

export default function Hero() {
  return (
    <section className="py-20 text-gray-900 dark:text-white md:py-28">
      <Container>
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-lime-600">
            Choose • Verify • Pay
          </p>

          <h1 className="mb-6 text-5xl font-bold leading-tight text-[var(--foreground)] md:text-7xl">
            Find trusted listings across Ghana.
          </h1>

          <p className="mb-10 text-lg text-[var(--muted)] md:text-xl">
            Buy, sell, discover jobs, and connect locally with confidence.
          </p>

          <div className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg md:grid-cols-4">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="rounded-2xl border border-[var(--border)] px-4 py-4 outline-none"
            />

            <select className="rounded-2xl border border-[var(--border)] px-4 py-4 outline-none">
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Vehicles</option>
              <option>Property</option>
            </select>

            <select className="rounded-2xl border border-[var(--border)] px-4 py-4 outline-none">
              <option>All Locations</option>
              <option>Accra</option>
              <option>Kumasi</option>
              <option>Tamale</option>
            </select>

            <Button className="h-full">Search</Button>
          </div>
        </div>
      </Container>
    </section>
  )
}