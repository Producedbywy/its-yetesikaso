"use client"

import { useEffect, useState } from "react"
import { listings as mockListings } from "@/data/listings"
import { Listing } from '@/lib/marketplace/types'

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  // filters
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [location, setLocation] = useState("all")

  useEffect(() => {
    // TEMP: mock backend simulation
    setTimeout(() => {
      setListings(mockListings)
      setLoading(false)
    }, 400)
  }, [])

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === "all" || item.category === category

    const matchesLocation =
      location === "all" || item.location === location

    return matchesSearch && matchesCategory && matchesLocation
  })

  return {
    listings: filteredListings,
    loading,
    search,
    setSearch,
    category,
    setCategory,
    location,
    setLocation,
  }
}