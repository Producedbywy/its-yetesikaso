import { apiClient } from "@/lib/api/client"

export type Transaction = {
  id: number
  buyer: number
  buyer_username: string
  seller: number
  seller_username: string
  listing: number
  listing_title: string
  quantity: number
  unit_price: string
  total_amount: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  created_at: string
  completed_at: string | null
}

export type TransactionsResponse = {
  transactions: Transaction[]
}

export async function getMyTransactions(): Promise<TransactionsResponse> {
  return apiClient<TransactionsResponse>("/transactions/")
}

export type CreateTransactionResponse = {
  message: string
  transaction: {
    id: number
    buyer: number
    seller: number
    listing: number
    quantity: number
    unit_price: string
    total_amount: string
    status: "pending" | "confirmed" | "completed" | "cancelled"
    created_at: string
    completed_at: string | null
  }
}

export type TransactionResponse = {
  transaction: Transaction
}

export async function createTransaction(
  listingId: number,
  quantity: number
): Promise<CreateTransactionResponse> {
  return apiClient<CreateTransactionResponse>(
    "/transactions/create/",
    {
      method: "POST",
      body: JSON.stringify({
        listing_id: listingId,
        quantity,
      }),
    }
  )
}

export async function getTransaction(
  transactionId: number
): Promise<TransactionResponse> {
  return apiClient<TransactionResponse>(
    `/transactions/${transactionId}/`
  )
}

export async function confirmTransaction(
  transactionId: number
): Promise<TransactionResponse> {
  return apiClient<TransactionResponse>(
    `/transactions/${transactionId}/confirm/`,
    {
      method: "POST",
    }
  )
}

export async function completeTransaction(
  transactionId: number
): Promise<TransactionResponse> {
  return apiClient<TransactionResponse>(
    `/transactions/${transactionId}/complete/`,
    {
      method: "POST",
    }
  )
}

export async function cancelTransaction(
  transactionId: number
): Promise<TransactionResponse> {
  return apiClient<TransactionResponse>(
    `/transactions/${transactionId}/cancel/`,
    {
      method: "POST",
    }
  )
}

export type CreateReviewResponse = {
  message: string
  review: {
    id: number
    transaction: number
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

export async function createReview(
  transactionId: number,
  rating: number,
  comment: string
): Promise<CreateReviewResponse> {
  return apiClient<CreateReviewResponse>(
    `/transactions/${transactionId}/review/`,
    {
      method: "POST",
      body: JSON.stringify({
        rating,
        comment,
      }),
    }
  )
}