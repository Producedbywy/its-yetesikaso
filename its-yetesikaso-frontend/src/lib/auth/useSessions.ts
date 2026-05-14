"use client"

import { useEffect, useState } from "react"
import { getAccessToken, clearTokens } from "./tokens"

export function useSession() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    setIsLoggedIn(!!token)
  }, [])

  function logout() {
    clearTokens()
    setIsLoggedIn(false)
  }

  function refreshSession() {
    const token = getAccessToken()
    setIsLoggedIn(!!token)
  }

  return {
    isLoggedIn,
    logout,
    refreshSession,
  }
}