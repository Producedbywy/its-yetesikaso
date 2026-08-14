import Link from "next/link"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import MobileNav from "@/components/layout/mobile-nav"
import Container from "@/components/layout/container"
import { getPublicJob } from "@/lib/api/public"
import ApplyToJob from "@/components/jobs/ApplyToJob"

type JobPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function JobDetailPage({
  params,
}: JobPageProps) {
  const { id } = await params

  let job

  try {
    job = await getPublicJob(Number(id))
  } catch {
    return (
      <main className="min-h-screen bg-[var(--background)] pb-20">
        <Navbar />

        <Container>
          <div className="py-16 text-center">
            <h1 className="text-3xl font-bold">
              Job not found
            </h1>

            <p className="mt-3 text-[var(--muted)]">
              This job may no longer be available.
            </p>

            <Link
              href="/jobs"
              className="mt-6 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-black hover:bg-lime-300"
            >
              Back to Jobs
            </Link>
          </div>
        </Container>

        <Footer />
        <MobileNav />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-20">
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--card)] py-10 md:py-14">
        <Container>
          <Link
            href="/jobs"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ← Back to Jobs
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700 dark:bg-lime-950 dark:text-lime-300">
                {job.category_display}
              </span>

              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                {job.workplace_type_display}
              </span>

              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                {job.employment_type_display}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-bold md:text-5xl">
              {job.title}
            </h1>

            <p className="mt-3 text-lg font-medium text-lime-600">
              {job.employer_name}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
              <span>{job.location}</span>
              <span>•</span>
              <span>{job.employment_type_display}</span>
              <span>•</span>
              <span>{job.workplace_type_display}</span>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* MAIN CONTENT */}
            <div className="space-y-8">
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
                <h2 className="text-2xl font-bold">
                  Job description
                </h2>

                <p className="mt-4 whitespace-pre-wrap leading-7 text-[var(--muted)]">
                  {job.description}
                </p>
              </section>

              {job.requirements && (
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
                  <h2 className="text-2xl font-bold">
                    Requirements
                  </h2>

                  <p className="mt-4 whitespace-pre-wrap leading-7 text-[var(--muted)]">
                    {job.requirements}
                  </p>
                </section>
              )}
            </div>

            {/* SIDEBAR */}
            <aside className="h-fit space-y-5 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-bold">
                  Salary
                </h2>

                <p className="mt-2 text-xl font-semibold text-lime-600">
                  {job.salary_display}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-bold">
                  Job details
                </h2>

                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="text-[var(--muted)]">
                      Location
                    </p>

                    <p className="mt-1 font-medium">
                      {job.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-[var(--muted)]">
                      Employment
                    </p>

                    <p className="mt-1 font-medium">
                      {job.employment_type_display}
                    </p>
                  </div>

                  <div>
                    <p className="text-[var(--muted)]">
                      Workplace
                    </p>

                    <p className="mt-1 font-medium">
                      {job.workplace_type_display}
                    </p>
                  </div>

                  <div>
                    <p className="text-[var(--muted)]">
                      Posted
                    </p>

                    <p className="mt-1 font-medium">
                      {new Date(
                        job.created_at
                      ).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <ApplyToJob jobId={job.id} />
            </aside>
          </div>
        </Container>
      </section>

      <Footer />
      <MobileNav />
    </main>
  )
}