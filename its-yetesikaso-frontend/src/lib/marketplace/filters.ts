import { Listing } from "./types"


export type Filters = {
  search: string
  category: string
  location: string
}

export function filterListings(listings: Listing[], filters: Filters) {
  return listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(filters.search.toLowerCase())

    const matchesCategory =
      filters.category === "all" ||
      listing.category.toLowerCase() === filters.category

    const matchesLocation =
      filters.location === "all" ||
      listing.location.toLowerCase() === filters.location

    return matchesSearch && matchesCategory && matchesLocation
  })
}

export function sortListings(listings: Listing[], sort: string) {
  const sorted = [...listings]

  switch (sort) {
    case "low":
      return sorted.sort((a, b) => a.price - b.price)

    case "high":
      return sorted.sort((a, b) => b.price - a.price)

    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      )
  }
}