import { apiClient } from "@/lib/api/client"

export type BlockStatus = {
  blocked: boolean
}

export type BlockResponse = {
  blocked: boolean
  message: string
}

export async function getBlockStatus(userId: number) {
  return apiClient<BlockStatus>(`/users/${userId}/block/`)
}

export async function blockUser(userId: number) {
  return apiClient<BlockResponse>(`/users/${userId}/block/`, {
    method: "POST",
  })
}

export async function unblockUser(userId: number) {
  return apiClient<BlockResponse>(`/users/${userId}/block/`, {
    method: "DELETE",
  })
}