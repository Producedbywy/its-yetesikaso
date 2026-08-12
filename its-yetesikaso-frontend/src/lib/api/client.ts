const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api"

import { getAccessToken, clearTokens } from "../auth/tokens"

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken()

  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
    },
  })

  if (res.status === 401) {
    clearTokens()
    window.location.href = "/login"
    throw new Error("Session expired")
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(
      data?.detail ||
        data?.error ||
        "API Error"
    )
  }

  return data
}