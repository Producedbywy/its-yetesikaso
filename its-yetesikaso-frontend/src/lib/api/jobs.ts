import { apiClient } from "@/lib/api/client"

export type Job = {
  id: number
  employer: number
  employer_username: string
  employer_name: string
  title: string
  description: string
  category: string
  category_display: string
  location: string
  employment_type: string
  employment_type_display: string
  workplace_type: string
  workplace_type_display: string
  salary_min: string | null
  salary_max: string | null
  salary_display: string
  requirements: string
  status: string
  status_display: string
  slug: string
  created_at: string
  updated_at: string
}

export type JobsResponse = {
  results: Job[]
  total: number
  page: number
  page_size: number
  has_next: boolean
  has_prev: boolean
}

export type JobFilters = {
  search?: string
  category?: string
  location?: string
  employment_type?: string
  workplace_type?: string
  page?: number
  page_size?: number
}

function buildQueryString(
  filters: JobFilters = {}
): string {
  const params = new URLSearchParams()

  if (filters.search) {
    params.set("search", filters.search)
  }

  if (
    filters.category &&
    filters.category !== "all"
  ) {
    params.set("category", filters.category)
  }

  if (
    filters.location &&
    filters.location !== "all"
  ) {
    params.set("location", filters.location)
  }

  if (
    filters.employment_type &&
    filters.employment_type !== "all"
  ) {
    params.set(
      "employment_type",
      filters.employment_type
    )
  }

  if (
    filters.workplace_type &&
    filters.workplace_type !== "all"
  ) {
    params.set(
      "workplace_type",
      filters.workplace_type
    )
  }

  if (filters.page) {
    params.set("page", String(filters.page))
  }

  if (filters.page_size) {
    params.set(
      "page_size",
      String(filters.page_size)
    )
  }

  const query = params.toString()

  return query ? `?${query}` : ""
}

export async function getJobs(
  filters: JobFilters = {}
): Promise<JobsResponse> {
  const query = buildQueryString(filters)

  return apiClient<JobsResponse>(
    `/jobs/${query}`
  )
}

export async function getJob(
  id: number
): Promise<Job> {
  return apiClient<Job>(
    `/jobs/${id}/`
  )
}

export async function getMyJobs(): Promise<{
  results: Job[]
  total: number
}> {
  return apiClient<{
    results: Job[]
    total: number
  }>("/jobs/me/")
}

export async function createJob(
  data: {
    title: string
    description: string
    category: string
    location: string
    employment_type: string
    workplace_type: string
    salary_min?: string | null
    salary_max?: string | null
    requirements?: string
    status?: string
  }
): Promise<Job> {
  const response = await apiClient<{
    message: string
    job: Job
  }>("/jobs/create/", {
    method: "POST",
    body: JSON.stringify(data),
  })

  return response.job
}

export async function updateJob(
  id: number,
  data: Partial<{
    title: string
    description: string
    category: string
    location: string
    employment_type: string
    workplace_type: string
    salary_min: string | null
    salary_max: string | null
    requirements: string
    status: string
  }>
): Promise<Job> {
  const response = await apiClient<{
    message: string
    job: Job
  }>(`/jobs/${id}/manage/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })

  return response.job
}

export async function deleteJob(
  id: number
): Promise<void> {
  await apiClient<{
    message: string
  }>(`/jobs/${id}/manage/`, {
    method: "DELETE",
  })
}