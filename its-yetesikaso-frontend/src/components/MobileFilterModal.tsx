"use client"

import { useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"

type Filters = {
  search: string
  category: string
  location: string
  minPrice: string
  maxPrice: string
  sort: string
}

interface MobileFilterModalProps {
  filters: Filters
  onApply: (filters: Partial<Filters>) => void
}

export default function MobileFilterModal({
  filters,
  onApply,
}: MobileFilterModalProps) {
  const [open, setOpen] = useState(false)

  const [localFilters, setLocalFilters] = useState({
    category: filters.category,
    location: filters.location,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
  })

  function handleOpen() {
    setLocalFilters({
      category: filters.category,
      location: filters.location,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
    })

    setOpen(true)
  }

  function applyFilters() {
    onApply(localFilters)
    setOpen(false)
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 z-40 rounded-full bg-black p-3 text-white shadow-lg lg:hidden"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Filters</h2>

            <button onClick={() => setOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 overflow-y-auto p-4">

            {/* Category */}
            <div>
              <label className="text-sm font-medium">
                Category
              </label>

              <select
                value={localFilters.category}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    category: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="all">All Categories</option>
                <option value="property_land">Property & Land</option>
                <option value="vehicles">Vehicles</option>
                <option value="phones_tablets">Phones & Tablets</option>
                <option value="computers_office">Computers & Office</option>
                <option value="electronics_appliances">
                  Electronics & Appliances
                </option>
                <option value="home_garden">Home & Garden</option>
                <option value="fashion">Fashion</option>
                <option value="baby_kids">Baby & Kids</option>
                <option value="health_beauty">Health & Beauty</option>
                <option value="sports_fitness">Sports & Fitness</option>
                <option value="business_industrial">
                  Business & Industrial
                </option>
                <option value="education">Education</option>
                <option value="food_agriculture">Food & Agriculture</option>
                <option value="services">Services</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium">
                Location
              </label>

              <select
                value={localFilters.location}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    location: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="all">All Locations</option>
                <option value="accra">Accra</option>
                <option value="kumasi">Kumasi</option>
                <option value="tamale">Tamale</option>
              </select>
            </div>

            {/* PRICE RANGE */}
            <div>
              <label className="text-sm font-semibold">
                Price Range (GH₵)
              </label>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="mobile-min-price"
                    className="mb-1 block text-xs text-gray-600"
                  >
                    Minimum
                  </label>

                  <input
                    id="mobile-min-price"
                    type="number"
                    min="0"
                    value={localFilters.minPrice}
                    onChange={(event) =>
                      setLocalFilters({
                        ...localFilters,
                        minPrice: event.target.value,
                      })
                    }
                    placeholder="From"
                    className="w-full rounded-xl border p-3 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobile-max-price"
                    className="mb-1 block text-xs text-gray-600"
                  >
                    Maximum
                  </label>

                  <input
                    id="mobile-max-price"
                    type="number"
                    min="0"
                    value={localFilters.maxPrice}
                    onChange={(event) =>
                      setLocalFilters({
                        ...localFilters,
                        maxPrice: event.target.value,
                      })
                    }
                    placeholder="To"
                    className="w-full rounded-xl border p-3 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium">
                Sort By
              </label>

              <select
                value={localFilters.sort}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    sort: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="newest">Newest First</option>
                <option value="low">Lowest Price</option>
                <option value="high">Highest Price</option>
              </select>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="border-t p-4">
            <button
              onClick={applyFilters}
              className="w-full rounded-xl bg-black py-3 text-white"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  )
}