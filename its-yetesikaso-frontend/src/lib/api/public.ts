export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || ""

export async function getPublicListings() {
  const res = await fetch(`${API_URL}/listings/`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch listings")
  }

  return res.json()
}

export async function getPublicJob(
  id: number
) {
  const res = await fetch(
    `${API_URL}/jobs/${id}/`,
    {
      cache: "no-store",
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch job")
  }

  return res.json()
}