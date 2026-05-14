import { useEffect, useState } from "react"
import type { Listing } from "@/types/listing"

export type Filters = {
  search: string
  category: string
  location: string
  sort: string
}

export function useListings(
  filters: Filters,
  page: number = 1
) {
  const [data, setData] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()

        // SEARCH
        if (filters.search) {
          params.set("search", filters.search)
        }

        // CATEGORY
        if (filters.category && filters.category !== "all") {
          params.set("category", filters.category)
        }

        // LOCATION
        if (filters.location && filters.location !== "all") {
          params.set("location", filters.location)
        }

        // SORT (MATCH BACKEND)
        if (filters.sort) {
          params.set("sort", filters.sort)
        }

        // PAGINATION
        params.set("page", String(page))
        params.set("page_size", "12")

        const res = await fetch(
          `http://127.0.0.1:8000/api/listings/?${params.toString()}`
        )

        if (!res.ok) {
          throw new Error("Failed to fetch listings")
        }

        const json = await res.json()

        setData(json.results || [])
        setTotal(json.total || 0)
      } catch (err: any) {
        setError(err?.message || "Error loading listings")
        setData([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [filters, page])

  return {
    data,
    total,
    loading,
    error,
  }
}