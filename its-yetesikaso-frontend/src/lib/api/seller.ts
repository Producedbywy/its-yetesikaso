import { apiClient } from "@/lib/api/client"

import type { Listing } from "@/types/listing"

export type AccountRole = "user" | "seller" | "employer"

export type SellerProfile = {
  id: number
  username: string
  email: string
  role: AccountRole
  display_name: string
  phone: string
  location: string
  bio: string
  onboarding_completed: boolean
  listing_count: number
  created_at: string
  updated_at: string
}

export type PublicSellerProfile = {
  id: number
  username: string
  display_name: string
  location: string
  bio: string
  listing_count: number
  average_rating: number
  review_count: number
  created_at: string
}

export type SellerReview = {
  id: number
  buyer_username: string
  listing: number
  listing_title: string
  rating: number
  comment: string
  created_at: string
  verified_purchase: boolean
}

export type PublicSellerResponse = {
  seller: PublicSellerProfile
  listings: Listing[]
  reviews: SellerReview[]
}

export type ListingsResponse = {
  results: Listing[]
  total?: number
  page?: number
  page_size?: number
  has_next?: boolean
  has_prev?: boolean
}

// GET PUBLIC SELLER PROFILE
//
// This endpoint is public and must also work during
// Next.js server rendering, so it intentionally does
// not use apiClient() because apiClient() reads localStorage.
export async function getPublicSellerProfile(
  username: string
): Promise<PublicSellerResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured")
  }

  const encodedUsername = encodeURIComponent(username)

  const response = await fetch(
    `${API_URL}/sellers/${encodedUsername}/`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.error ||
        "Failed to load seller profile"
    )
  }

  return data
}

// GET MY LISTINGS
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

// UPDATE LISTING
export async function updateListing(
  id: number,
  data: FormData
): Promise<Listing> {
  const response = await apiClient<{
    message: string
    listing: Listing
  }>(`/listings/${id}/`, {
    method: "PATCH",
    body: data,
  })

  return response.listing
}

// DELETE LISTING
export async function deleteListing(
  id: number
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(
    `/listings/${id}/`,
    {
      method: "DELETE",
    }
  )
}

// GET MY FAVOURITES
export async function getMyFavourites(): Promise<ListingsResponse> {
  return apiClient<ListingsResponse>("/favourites/")
}

// ADD LISTING TO FAVOURITES
export async function favouriteListing(
  listingId: number
): Promise<{ message: string; favourited: boolean }> {
  return apiClient<{
    message: string
    favourited: boolean
  }>(`/listings/${listingId}/favourite/`, {
    method: "POST",
  })
}

// REMOVE LISTING FROM FAVOURITES
export async function unfavouriteListing(
  listingId: number
): Promise<{ message: string; favourited: boolean }> {
  return apiClient<{
    message: string
    favourited: boolean
  }>(`/listings/${listingId}/favourite/`, {
    method: "DELETE",
  })
}

// GET MY PROFILE
export async function getMyProfile(): Promise<SellerProfile> {
  return apiClient<SellerProfile>("/auth/profile/")
}

// UPDATE MY PROFILE
export async function updateMyProfile(
  data: Partial<
    Pick<
      SellerProfile,
      | "display_name"
      | "phone"
      | "location"
      | "bio"
      | "onboarding_completed"
    >
  >
): Promise<SellerProfile> {
  return apiClient<SellerProfile>("/auth/profile/", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

// UPGRADE ACCOUNT
export async function upgradeAccount(
  role: "seller" | "employer"
): Promise<SellerProfile> {
  const response = await apiClient<{
    message: string
    profile: SellerProfile
  }>("/auth/profile/upgrade/", {
    method: "POST",
    body: JSON.stringify({ role }),
  })

  return response.profile
}