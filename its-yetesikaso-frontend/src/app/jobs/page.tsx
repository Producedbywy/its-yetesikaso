import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import MobileNav from '@/components/layout/mobile-nav'
import Container from '@/components/layout/container'

const jobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'YawHaus Studio',
    location: 'Accra',
    type: 'Full Time',
    salary: 'GH₵ 8,000'
  },
  {
    id: 2,
    title: 'Graphic Designer',
    company: 'Creative Labs',
    location: 'Kumasi',
    type: 'Remote',
    salary: 'GH₵ 5,500'
  },
  {
    id: 3,
    title: 'Marketing Manager',
    company: 'Seesa Naturals',
    location: 'East Legon',
    type: 'Hybrid',
    salary: 'GH₵ 10,000'
  }
]

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--card)] py-14">
        <Container>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-lime-600">
            Careers
          </p>

          <h1 className="text-4xl font-bold md:text-6xl">
            Discover Jobs
          </h1>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="mb-2 text-sm text-lime-600">
                      {job.company}
                    </p>

                    <h2 className="mb-3 text-2xl font-bold">
                      {job.title}
                    </h2>

                    <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                      <span>•</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  <button className="rounded-2xl bg-lime-400 px-6 py-3 font-medium text-[var(--foreground)] transition hover:bg-lime-300">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Footer />

      <MobileNav />
    </main>
  )
}