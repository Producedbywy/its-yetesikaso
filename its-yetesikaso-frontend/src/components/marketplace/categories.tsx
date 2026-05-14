import Container from '@/components/layout/container'
import {
  Smartphone,
  Car,
  Home,
  Briefcase,
  Shirt,
  Wrench
} from 'lucide-react'

const categories = [
  {
    title: 'Electronics',
    icon: Smartphone,
    count: '1,240 Listings'
  },
  {
    title: 'Vehicles',
    icon: Car,
    count: '860 Listings'
  },
  {
    title: 'Property',
    icon: Home,
    count: '430 Listings'
  },
  {
    title: 'Jobs',
    icon: Briefcase,
    count: '120 Jobs'
  },
  {
    title: 'Fashion',
    icon: Shirt,
    count: '620 Listings'
  },
  {
    title: 'Services',
    icon: Wrench,
    count: '300 Providers'
  }
]

export default function Categories() {
  return (
    <section className="py-20">
      <Container>
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-lime-600">
            Explore
          </p>

          <h2 className="text-4xl font-bold md:text-5xl">
            Browse Categories
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon

            return (
              <div
                key={category.title}
                className="group cursor-pointer rounded-3xl border border-[var(--border)] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-lime-300 hover:shadow-xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-100 text-lime-700 transition group-hover:scale-110">
                  <Icon size={30} />
                </div>

                <h3 className="mb-2 text-2xl font-bold">
                  {category.title}
                </h3>

                <p className="text-[var(--muted)]">
                  {category.count}
                </p>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}