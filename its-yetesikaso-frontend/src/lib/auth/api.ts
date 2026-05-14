const API_URL = "http://127.0.0.1:8000/api"

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

  let data = {}

  try {
    data = await res.json()
  } catch {}

  if (!res.ok) {
    throw new Error(
      (data as any)?.detail ||
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
  const res = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  })

  let data = {}

  try {
    data = await res.json()
  } catch {}

  if (!res.ok) {
    throw new Error(
      (data as any)?.error ||
      "Registration failed"
    )
  }

  return data
}