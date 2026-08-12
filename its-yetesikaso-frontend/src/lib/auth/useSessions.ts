"use client"

import { useState } from "react"
import { getAccessToken, clearTokens } from "./tokens"

export function useSession() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAccessToken())

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