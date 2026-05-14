"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { loginUser, registerUser } from "./api"
import { setTokens, clearTokens } from "./tokens"

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

      const data: any = await loginUser(
        username,
        password
      )

      setTokens(data.access, data.refresh)

      router.push("/dashboard")

      return data
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function register(
    username: string,
    email: string,
    password: string
  ) {
    try {
      setLoading(true)
      setError(null)

      return await registerUser(
        username,
        email,
        password
      )
    } catch (err: any) {
      setError(err.message)
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