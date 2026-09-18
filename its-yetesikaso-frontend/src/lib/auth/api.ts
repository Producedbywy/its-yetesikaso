const API_URL =
  process.env.NEXT_PUBLIC_API_URL || ""

type ApiResponse = {
  detail?: string
  error?: string
  message?: string
  [key: string]: unknown
}

export async function loginUser(
  username: string,
  password: string
) {
  const res = await fetch(`${API_URL}/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })

  let data: ApiResponse = {}

  try {
    data = await res.json()
  } catch {
    // Keep the default empty response if the server returns no JSON.
  }

  if (!res.ok) {
    throw new Error(
      data.detail ||
        data.error ||
        "Invalid login credentials"
    )
  }

  return data
}

export async function registerUser(
  username: string,
  email: string,
  password: string
) {
  const res = await fetch(
    `${API_URL}/auth/register/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    }
  )

  let data: ApiResponse = {}

  try {
    data = await res.json()
  } catch {
    // Keep the default empty response if the server returns no JSON.
  }

  if (!res.ok) {
    throw new Error(
      data.error ||
        data.detail ||
        "Registration failed"
    )
  }

  return data
}

export async function requestPasswordReset(
  email: string
) {
  const res = await fetch(
    `${API_URL}/auth/password-reset/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    }
  )

  let data: ApiResponse = {}

  try {
    data = await res.json()
  } catch {
    // Keep the default empty response if the server returns no JSON.
  }

  if (!res.ok) {
    throw new Error(
      data.error ||
        data.detail ||
        "Unable to request password reset"
    )
  }

  return data
}

export async function confirmPasswordReset(
  uid: string,
  token: string,
  password: string
) {
  const res = await fetch(
    `${API_URL}/auth/password-reset/confirm/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid,
        token,
        password,
      }),
    }
  )

  let data: ApiResponse = {}

  try {
    data = await res.json()
  } catch {
    // Keep the default empty response if the server returns no JSON.
  }

  if (!res.ok) {
    throw new Error(
      data.error ||
        data.detail ||
        "Unable to reset password"
    )
  }

  return data
}