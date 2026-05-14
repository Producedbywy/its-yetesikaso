export const API_URL = "http://127.0.0.1:8000/api"

export async function getPublicListings() {
  const res = await fetch(`${API_URL}/listings/`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch listings")
  }

  return res.json()
}