"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import sql from "@/lib/db"
import { verifyPassword } from "@/lib/password"

export interface LoginState {
  error?: string
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    // Check if user exists
    const users = await sql`
      SELECT id, email, password_hash 
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return { error: "Invalid email or password" }
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return { error: "Invalid email or password" }
    }

    // Create session
    const cookieStore = cookies()
    cookieStore.set(
      "session",
      JSON.stringify({
        userId: user.id,
        email: user.email,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )

    redirect("/admin")
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An error occurred during login" }
  }
}

export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete("session")
  redirect("/login")
}

export async function changePassword(prevState: { error?: string; success?: boolean }, formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  try {
    // Get current user session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return { error: "Not authenticated" }
    }

    const session = JSON.parse(sessionCookie.value)

    // Get user from database
    const users = await sql`
      SELECT id, email, password_hash 
      FROM users 
      WHERE id = ${session.userId}
    `

    if (users.length === 0) {
      return { error: "User not found" }
    }

    const user = users[0]

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password_hash)
    if (!isValidPassword) {
      return { error: "Current password is incorrect" }
    }

    // Hash new password
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password in database
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `

    return { success: true }
  } catch (error) {
    console.error("Change password error:", error)
    return { error: "An error occurred while changing password" }
  }
}
