import { apiClient } from "@/lib/api/client"
import type { Listing } from "@/types/listing"

export type ListingsResponse = {
  results: Listing[]
  total?: number
  page?: number
  page_size?: number
  has_next?: boolean
  has_prev?: boolean
}

// GET SELLER LISTINGS
export async function getMyListings(): Promise<ListingsResponse> {
  return apiClient("/listings/me/")
}

// CREATE LISTING
export async function createListing(
  data: Partial<Listing>
): Promise<Listing> {
  return apiClient("/listings/create/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}