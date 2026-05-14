"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

type Filters = {
  category: string;
  price: string;
  sort: string;
};

export default function MobileFilterModal() {
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    category: "all",
    price: "any",
    sort: "newest",
  });

  const applyFilters = () => {
    console.log("Applied filters:", filters);

    // Later: send to API or update URL params
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Button (sticky floating) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 md:hidden bg-black text-white p-3 rounded-full shadow-lg"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white md:hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button onClick={() => setOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-6 overflow-y-auto">
            {/* Category */}
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full mt-2 border rounded-xl p-3"
              >
                <option value="all">All</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="branding">Branding</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="text-sm font-medium">Price Range</label>
              <select
                value={filters.price}
                onChange={(e) =>
                  setFilters({ ...filters, price: e.target.value })
                }
                className="w-full mt-2 border rounded-xl p-3"
              >
                <option value="any">Any</option>
                <option value="low">Low</option>
                <option value="mid">Mid</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters({ ...filters, sort: e.target.value })
                }
                className="w-full mt-2 border rounded-xl p-3"
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="low">Lowest Price</option>
              </select>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t">
            <button
              onClick={applyFilters}
              className="w-full bg-black text-white py-3 rounded-xl"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}