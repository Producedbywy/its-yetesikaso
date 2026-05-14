"use client";

import ListingCard from "./ListingCard";
import ListingSkeleton from "./ListingSkeleton";

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  image: string;
  seller: string;
};

export default function ListingGrid({
  listings,
  loading,
}: {
  listings: Listing[];
  loading: boolean;
}) {
  return (
    <div className="px-4 pt-24 pb-28">
      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <ListingSkeleton key={i} />
            ))
          : listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
      </div>
    </div>
  );
}