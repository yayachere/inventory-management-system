"use client"

export async function checkSession() {
  try {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.log("Session check failed:", error)
    return null
  }
}
