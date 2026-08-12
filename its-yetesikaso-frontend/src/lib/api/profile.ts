import { apiClient } from "@/lib/api/client"

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

export async function getMyProfile(): Promise<SellerProfile> {
  return apiClient<SellerProfile>("/auth/profile/")
}

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