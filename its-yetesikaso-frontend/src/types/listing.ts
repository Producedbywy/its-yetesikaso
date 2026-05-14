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
}