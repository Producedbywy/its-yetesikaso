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