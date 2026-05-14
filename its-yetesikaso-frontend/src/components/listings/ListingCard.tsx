"use client";

import { Heart, Share2 } from "lucide-react";
import { useState } from "react";

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  image: string;
  seller: string;
};

export default function ListingCard({ listing }: { listing: Listing }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      {/* Image */}
      <div className="relative">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-40 object-cover"
        />

        {/* Save button */}
        <button
          onClick={() => setSaved(!saved)}
          className="absolute top-2 right-2 bg-white/90 p-2 rounded-full"
        >
          <Heart
            className={`w-4 h-4 ${
              saved ? "fill-red-500 text-red-500" : "text-[var(--muted)]"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">
          {listing.title}
        </h3>

        <p className="text-xs text-[var(--muted)] mt-1">
          by {listing.seller}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-sm">
            ${listing.price}
          </span>

          <button className="text-xs bg-black text-white px-3 py-1 rounded-lg">
            View
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 text-gray-400">
          <span className="text-xs">{listing.category}</span>

          <button>
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}