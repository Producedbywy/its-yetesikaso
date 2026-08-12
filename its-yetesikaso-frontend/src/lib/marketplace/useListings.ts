"use client"

import { useEffect, useRef, useState } from "react"
import type { Listing } from "@/types/listing"

export type Filters = {
  search: string
  category: string
  location: string
  sort: string
}

type ListingsResponse = {
  results?: Listing[]
  total?: number
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"

export function useListings(
  filters: Filters,
  page: number = 1
) {
  const [data, setData] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requestId = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    const currentRequestId = ++requestId.current

    async function fetchListings() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()

        if (filters.search.trim()) {
          params.set("search", filters.search.trim())
        }

        if (
          filters.category &&
          filters.category !== "all"
        ) {
          params.set("category", filters.category)
        }

        if (
          filters.location &&
          filters.location !== "all"
        ) {
          params.set("location", filters.location)
        }

        if (filters.sort) {
          params.set("sort", filters.sort)
        }

        params.set("page", String(page))
        params.set("page_size", "12")

        const res = await fetch(
          `${API_URL}/listings/?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        )

        if (!res.ok) {
          throw new Error("Failed to fetch listings")
        }

        const json: ListingsResponse = await res.json()

        if (
          controller.signal.aborted ||
          currentRequestId !== requestId.current
        ) {
          return
        }

        setData(json.results || [])
        setTotal(json.total || 0)
      } catch (err: unknown) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return
        }

        if (controller.signal.aborted) {
          return
        }

        const message =
          err instanceof Error
            ? err.message
            : "Error loading listings"

        setError(message)
        setData([])
        setTotal(0)
      } finally {
        if (
          !controller.signal.aborted &&
          currentRequestId === requestId.current
        ) {
          setLoading(false)
        }
      }
    }

    const delay = filters.search.trim() ? 300 : 0

    const timeout = window.setTimeout(
      fetchListings,
      delay
    )

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [
    filters.search,
    filters.category,
    filters.location,
    filters.sort,
    page,
  ])

  return {
    data,
    total,
    loading,
    error,
  }
}
