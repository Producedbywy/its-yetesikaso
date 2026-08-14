"use client"

import { apiClient } from "@/lib/api/client"

export type ApplicationStatus =
  | "submitted"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "accepted"

export type Application = {
  id: number
  job: number
  job_title: string
  applicant: number
  applicant_username: string
  applicant_name: string
  employer_username: string
  cover_note: string
  cv: string | null
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

export type ApplicationsResponse = {
  results: Application[]
  total: number
}

export async function applyToJob(
  jobId: number,
  coverNote: string,
  cv: File | null
): Promise<Application> {
  const formData = new FormData()

  formData.append("cover_note", coverNote)

  if (cv) {
    formData.append("cv", cv)
  }

  const response = await apiClient<{
    message: string
    application: Application
  }>(`/jobs/${jobId}/apply/`, {
    method: "POST",
    body: formData,
  })

  return response.application
}

export async function getMyApplications(): Promise<ApplicationsResponse> {
  return apiClient<ApplicationsResponse>(
    "/applications/me/"
  )
}

export async function getEmployerApplications(): Promise<ApplicationsResponse> {
  return apiClient<ApplicationsResponse>(
    "/applications/employer/"
  )
}

export async function updateApplicationStatus(
  applicationId: number,
  status: ApplicationStatus
): Promise<Application> {
  const response = await apiClient<{
    message: string
    application: Application
  }>(`/applications/${applicationId}/`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
  })

  return response.application
}