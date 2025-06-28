"use server"

import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { createSession, deleteSession, verifyPassword, hashPassword } from "@/lib/auth"

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const users = await sql`
      SELECT id, email, password_hash, name, role, is_active
      FROM users 
      WHERE email = ${email}
    `

    const user = users[0]
    if (!user) {
      return { error: "Invalid email or password" }
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return { error: "Invalid email or password" }
    }

    if (!user.is_active) {
      return { error: "Your account is not active. Please contact the administrator." }
    }

    await createSession(user.id)
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Login failed. Please try again." }
  }

  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as string

  if (!email || !password || !name || !role) {
    return { error: "All fields are required" }
  }

  try {
    const hashedPassword = await hashPassword(password)

    await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email}, ${hashedPassword}, ${name}, ${role})
    `

    return { success: "User created successfully" }
  } catch (error) {
    return { error: "Registration failed. Email might already exist." }
  }
}
