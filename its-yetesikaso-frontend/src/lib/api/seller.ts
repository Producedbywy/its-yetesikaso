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

export type SellerProfile = {
  id: number
  username: string
  email: string
  display_name: string
  phone: string
  location: string
  bio: string
  onboarding_completed: boolean
  listing_count: number
  created_at: string
  updated_at: string
}

// GET SELLER LISTINGS
export async function getMyListings(): Promise<ListingsResponse> {
  return apiClient<ListingsResponse>("/listings/me/")
}

// CREATE LISTING
export async function createListing(
  data: FormData
): Promise<Listing> {
  const response = await apiClient<{
    message: string
    listing: Listing
  }>("/listings/create/", {
    method: "POST",
    body: data,
  })

  return response.listing
}

// GET SELLER PROFILE
export async function getMyProfile(): Promise<SellerProfile> {
  return apiClient<SellerProfile>("/auth/profile/")
}

// UPDATE SELLER PROFILE
export async function updateMyProfile(
  data: Partial<
    Pick<
      SellerProfile,
      "display_name" | "phone" | "location" | "bio" | "onboarding_completed"
    >
  >
): Promise<SellerProfile> {
  return apiClient<SellerProfile>("/auth/profile/", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}