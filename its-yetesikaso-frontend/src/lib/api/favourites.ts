import { apiClient } from "@/lib/api/client"
import type { Listing } from "@/types/listing"

export type FavouritesResponse = {
  results: Listing[]
  total: number
}

export async function getMyFavourites(): Promise<FavouritesResponse> {
  return apiClient<FavouritesResponse>("/favourites/")
}

export async function favouriteListing(
  listingId: number
): Promise<{ message: string; favourited: boolean }> {
  return apiClient<{ message: string; favourited: boolean }>(
    `/listings/${listingId}/favourite/`,
    {
      method: "POST",
    }
  )
}

export async function unfavouriteListing(
  listingId: number
): Promise<{ message: string; favourited: boolean }> {
  return apiClient<{ message: string; favourited: boolean }>(
    `/listings/${listingId}/favourite/`,
    {
      method: "DELETE",
    }
  )
}