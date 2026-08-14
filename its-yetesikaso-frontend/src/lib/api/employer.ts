import { apiClient } from "@/lib/api/client"

export type EmployerProfile = {
  id: number
  username: string
  email: string
  role: "employer"
  display_name: string
  phone: string
  location: string
  bio: string
  onboarding_completed: boolean
  job_count: number
  created_at: string
  updated_at: string
}

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
}

export async function getMyEmployerProfile(): Promise<EmployerProfile> {
  return apiClient<EmployerProfile>("/auth/profile/")
}

export async function getMyJobs(): Promise<JobsResponse> {
  return apiClient<JobsResponse>("/jobs/me/")
}

export async function createJob(
  data: Omit<
    Job,
    | "id"
    | "employer"
    | "employer_username"
    | "employer_name"
    | "category_display"
    | "employment_type_display"
    | "workplace_type_display"
    | "salary_display"
    | "status_display"
    | "slug"
    | "created_at"
    | "updated_at"
  >
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

export async function getEmployerJob(
  id: number
): Promise<Job> {
  return apiClient<Job>(`/jobs/${id}/manage/`)
}

export async function updateEmployerJob(
  id: number,
  data: Partial<
    Pick<
      Job,
      | "title"
      | "description"
      | "category"
      | "location"
      | "employment_type"
      | "workplace_type"
      | "salary_min"
      | "salary_max"
      | "requirements"
      | "status"
    >
  >
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

export async function deleteEmployerJob(
  id: number
): Promise<void> {
  await apiClient(`/jobs/${id}/manage/`, {
    method: "DELETE",
  })
}