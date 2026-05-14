import type { Listing } from "@/types/listing"

export const listings: Listing[] = [
  {
    id: 1,
    owner: 1,
    title: "iPhone 14 Pro Max",
    slug: "iphone-14-pro-max",
    price: 12000,
    location: "Accra",
    category: "Phones",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    description: "Clean iPhone 14 Pro Max in excellent condition.",
    created_at: "2 hours ago",
  },
  {
    id: 2,
    owner: 1,
    title: "Toyota Corolla 2018",
    slug: "toyota-corolla-2018",
    price: 85000,
    location: "Kumasi",
    category: "Vehicles",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8",
    description: "Well maintained vehicle with low mileage.",
    created_at: "1 day ago",
  },
  {
    id: 3,
    owner: 1,
    title: "2 Bedroom Apartment",
    slug: "2-bedroom-apartment",
    price: 2500,
    location: "East Legon",
    category: "Property",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    description: "Modern apartment available immediately.",
    created_at: "3 days ago",
  },
]