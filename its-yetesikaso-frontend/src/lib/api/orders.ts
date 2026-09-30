import { apiClient } from "@/lib/api/client"

export type OrderItem = {
  id: number
  listing: number
  listing_title: string
  seller: number
  seller_username: string
  quantity: number
  unit_price: string
  total_amount: string
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
  expires_at: string
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
