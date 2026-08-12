export type Seller = {
  id: number
  username: string
  email: string
  display_name: string
  phone: string
  location: string
  bio: string
  onboarding_completed: boolean
  listing_count: number
  created_at: string
  updated_at: string
}

export type Listing = {
  id: number
  owner: number
  title: string
  description: string
  price: number
  category: string
  location: string
  image: string | null
  slug: string
  created_at: string
  seller: Seller | null
}