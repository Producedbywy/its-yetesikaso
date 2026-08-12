"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"

interface MobileStickySearchProps {
  value: string
  onChange: (value: string) => void
}

export default function MobileStickySearch({
  value,
  onChange,
}: MobileStickySearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)

  function openSearch() {
    setQuery(value)
    setOpen(true)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    onChange(query)
    setOpen(false)
  }

  return (
    <>
      {/* Sticky collapsed bar */}
      <div className="fixed top-14 left-0 right-0 z-40 px-4 md:hidden">
        {!open && (
          <button
            type="button"
            onClick={openSearch}
            className="flex w-full items-center gap-3 rounded-full border bg-white px-4 py-2 text-[var(--muted)] shadow-md"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">
              {value || "Search marketplace..."}
            </span>
          </button>
        )}
      </div>

      {/* Expanded search overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white p-4 md:hidden">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-semibold">Search</span>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close search"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings..."
              className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              autoFocus
            />

            <button
              type="submit"
              className="rounded-xl bg-black px-4 text-white"
            >
              Go
            </button>
          </form>

          <div className="mt-6 text-sm text-[var(--muted)]">
            Search for phones, cars, property, fashion and more.
          </div>
        </div>
      )}
    </>
  )
}