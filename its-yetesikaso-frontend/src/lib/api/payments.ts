import { apiClient } from "@/lib/api/client"

export type InitializePaymentResponse = {
  message: string
  payment: {
    reference: string
    amount: string
    currency: string
    status: string
    authorization_url: string
    access_code: string
  }
}

export async function initializePayment(
  orderReference: string
): Promise<InitializePaymentResponse> {
  return apiClient<InitializePaymentResponse>("/payments/initialize/", {
    method: "POST",
    body: JSON.stringify({
      order_reference: orderReference,
    }),
  })
}

export type VerifyPaymentResponse = {
  message: string
  payment: {
    reference: string
    amount: string
    currency: string
    status: string
  }
  order: {
    order_reference: string
    payment_status: string
    fulfilment_status: string
  }
}

export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResponse> {
  return apiClient<VerifyPaymentResponse>("/payments/verify/", {
    method: "POST",
    body: JSON.stringify({
      reference,
    }),
  })
}
