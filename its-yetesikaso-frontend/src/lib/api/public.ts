export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || ''

export async function getPublicListings() {
  const res = await fetch(`${API_URL}/listings/`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch listings")
  }

  return res.json()
}