import Container from '@/components/layout/container'

const stats = [
  {
    number: '25K+',
    label: 'Active Users'
  },
  {
    number: '8K+',
    label: 'Verified Listings'
  },
  {
    number: '1.2K+',
    label: 'Jobs Posted'
  },
  {
    number: '98%',
    label: 'Successful Transactions'
  }
]

export default function Stats() {
  return (
    <section className="bg-black py-20 text-white">
      <Container>
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <h3 className="mb-3 text-5xl font-bold text-lime-400">
                {stat.number}
              </h3>

              <p className="text-lg text-gray-300">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}