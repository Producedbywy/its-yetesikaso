import { apiClient } from "@/lib/api/client"

export type CartItem = {
  id: number
  listing: number
  listing_title: string
  listing_slug: string
  listing_image: string | null
  price: string
  quantity: number
  available_quantity: number
  total_amount: string
  seller: number
  seller_username: string
  created_at: string
  updated_at: string
}

export type Cart = {
  id: number
  items: CartItem[]
  total_quantity: number
  total_amount: string
  created_at: string
  updated_at: string
}

export type CartResponse = {
  cart: Cart
}

export async function getMyCart(): Promise<CartResponse> {
  return apiClient<CartResponse>("/cart/")
}

export async function addToCart(
  listingId: number,
  quantity: number
): Promise<CartResponse> {
  return apiClient<CartResponse>("/cart/add/", {
    method: "POST",
    body: JSON.stringify({
      listing_id: listingId,
      quantity,
    }),
  })
}

export async function updateCartItem(
  cartItemId: number,
  quantity: number
): Promise<CartResponse> {
  return apiClient<CartResponse>(
    `/cart/items/${cartItemId}/`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }
  )
}

export async function removeFromCart(
  cartItemId: number
): Promise<CartResponse> {
  return apiClient<CartResponse>(
    `/cart/items/${cartItemId}/remove/`,
    {
      method: "DELETE",
    }
  )
}

export async function clearCart(): Promise<{ message: string }> {
  return apiClient<{ message: string }>("/cart/clear/", {
    method: "DELETE",
  })
}

export type CheckoutResponse = {
  message: string
  order: {
    id: number
    order_reference: string
    total_amount: string
    payment_status: string
    fulfilment_status: string
    expires_at: string
  }
}

export async function checkoutCart(): Promise<CheckoutResponse> {
  return apiClient<CheckoutResponse>("/cart/checkout/", {
    method: "POST",
  })
}
