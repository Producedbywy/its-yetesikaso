"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { loginUser, registerUser } from "./api"
import { setTokens, clearTokens } from "./tokens"

type LoginResponse = {
  access?: string
  refresh?: string
  [key: string]: unknown
}

export function useAuth() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(
    username: string,
    password: string
  ) {
    try {
      setLoading(true)
      setError(null)

      const data = await loginUser(
        username,
        password
      ) as LoginResponse

      if (!data.access || !data.refresh) {
        throw new Error(
          "Login response is missing authentication tokens"
        )
      }

      setTokens(data.access, data.refresh)

      router.push("/dashboard")

      return data
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed"

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function register(
    username: string,
    email: string,
    password: string,
    role: "buyer" | "seller"
  ) {
    try {
      setLoading(true)
      setError(null)

      return await registerUser(
        username,
        email,
        password,
        role
      )
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed"

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    clearTokens()
    router.push("/login")
  }

  return {
    login,
    register,
    logout,
    loading,
    error,
  }
}
