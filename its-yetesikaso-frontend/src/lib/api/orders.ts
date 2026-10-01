import { apiClient } from "@/lib/api/client"

export type OrderItem = {
  id: number
  listing: number
  listing_title: string
  listing_slug: string
  listing_image: string | null
  seller: number
  seller_username: string
  quantity: number
  unit_price: string
  total_amount: string
  fulfilment_status: string
  dispatched_at: string | null
  completed_at: string | null
  created_at: string
  has_review: boolean
}

export type Order = {
  id: number
  order_reference: string
  total_amount: string
  payment_status: string
  fulfilment_status: string
  created_at: string
  paid_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  expires_at: string | null
  items: OrderItem[]
}

export type OrderResponse = {
  order: Order
}

export type OrdersResponse = {
  orders: Order[]
}

export async function getMyOrders(): Promise<OrdersResponse> {
  return apiClient<OrdersResponse>("/orders/")
}

export async function getOrder(
  orderReference: string
): Promise<OrderResponse> {
  return apiClient<OrderResponse>(
    `/orders/${encodeURIComponent(orderReference)}/`
  )
}

export async function confirmDelivery(
  orderItemId: number
): Promise<{ order_item: OrderItem }> {
  return apiClient<{ order_item: OrderItem }>(
    `/orders/items/${orderItemId}/confirm-delivery/`,
    {
      method: "POST",
    }
  )
}

export type CreateOrderItemReviewResponse = {
  message: string
  review: {
    id: number
    order_item: number
    buyer: number
    buyer_username: string
    seller: number
    seller_username: string
    listing: number
    listing_title: string
    rating: number
    comment: string
    created_at: string
  }
}

export async function createOrderItemReview(
  orderItemId: number,
  rating: number,
  comment: string
): Promise<CreateOrderItemReviewResponse> {
  return apiClient<CreateOrderItemReviewResponse>(
    `/orders/items/${orderItemId}/review/`,
    {
      method: "POST",
      body: JSON.stringify({
        rating,
        comment,
      }),
    }
  )
}
