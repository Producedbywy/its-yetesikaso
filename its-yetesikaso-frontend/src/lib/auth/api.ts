const API_URL =
  process.env.NEXT_PUBLIC_API_URL || ""

type ApiResponse = {
  detail?: string
  error?: string
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