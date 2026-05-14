import { apiClient } from "./client"

export type ListingsParams = {
  search?: string
  category?: string
  location?: string
  sort?: string
  page?: number
  page_size?: number
}

export async function fetchListings(params: ListingsParams) {
  const query = new URLSearchParams()

  if (params.search) query.set("search", params.search)
  if (params.category && params.category !== "all")
    query.set("category", params.category)

  if (params.location && params.location !== "all")
    query.set("location", params.location)

  if (params.sort) query.set("sort", params.sort)
  if (params.page) query.set("page", String(params.page))
  if (params.page_size) query.set("page_size", String(params.page_size))

  return apiClient(`/listings/?${query.toString()}`)
}