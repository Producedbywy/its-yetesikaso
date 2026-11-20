const API_URL = process.env.NEXT_PUBLIC_API_URL

export type BuyerRegistrationDetails = {
  first_name: string
  email: string
  password: string
  phone: string
  terms_accepted: boolean
  website?: string
}

type MessageResponse = {
  message: string
}

type StartResponse = MessageResponse & {
  phone: string
}

type PhoneVerificationResponse = MessageResponse & {
  phone_verified: boolean
}

type EmailVerificationResponse = MessageResponse & {
  account_activated: boolean
}

function getErrorMessage(data: unknown): string {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return "Unable to process your request."
  }

  const errors = data as Record<string, unknown>

  for (const key of ["error", "detail", "message"]) {
    if (typeof errors[key] === "string") {
      return errors[key]
    }
  }

  for (const [field, value] of Object.entries(errors)) {
    if (
      Array.isArray(value) &&
      typeof value[0] === "string"
    ) {
      return `${field.replace(/_/g, " ")}: ${value[0]}`
    }

    if (typeof value === "string") {
      return `${field.replace(/_/g, " ")}: ${value}`
    }
  }

  return "Unable to process your request."
}

async function buyerRegistrationRequest<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "The registration service is not configured."
    )
  }

  const response = await fetch(
    `${API_URL.replace(/\/+$/, "")}/auth/buyer-registration/${endpoint}/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  )

  const data: unknown = await response
    .json()
    .catch(() => ({}))

  if (!response.ok) {
    throw new Error(getErrorMessage(data))
  }

  return data as T
}

export function startBuyerRegistration(
  details: BuyerRegistrationDetails
) {
  return buyerRegistrationRequest<StartResponse>(
    "start",
    details
  )
}

export function verifyBuyerPhone(
  email: string,
  code: string
) {
  return buyerRegistrationRequest<PhoneVerificationResponse>(
    "verify-phone",
    { email, code }
  )
}

export function resendBuyerCode(
  email: string
) {
  return buyerRegistrationRequest<MessageResponse>(
    "resend-code",
    { email }
  )
}

export function sendBuyerConfirmationEmail(
  email: string
) {
  return buyerRegistrationRequest<MessageResponse>(
    "send-email",
    { email }
  )
}

export function confirmBuyerEmail(
  token: string
) {
  return buyerRegistrationRequest<EmailVerificationResponse>(
    "confirm-email",
    { token }
  )
}
