"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

export default function MobileStickySearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    // TEMP: replace with router push or API call later
    console.log("Searching for:", query);

    setOpen(false);
  };

  return (
    <>
      {/* Sticky collapsed bar */}
      <div className="fixed top-14 left-0 right-0 z-40 md:hidden px-4">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center gap-3 bg-white shadow-md border rounded-full px-4 py-2 text-[var(--muted)]"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search marketplace...</span>
          </button>
        )}
      </div>

      {/* Expanded search overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white md:hidden p-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-lg">Search</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search input */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings, services, creators..."
              className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              autoFocus
            />
            <button
              type="submit"
              className="bg-black text-white px-4 rounded-xl"
            >
              Go
            </button>
          </form>

          {/* Suggestions (future upgrade zone) */}
          <div className="mt-6 text-sm text-[var(--muted)]">
            Try: “logo design”, “web dev”, “branding”
          </div>
        </div>
      )}
    </>
  );
}