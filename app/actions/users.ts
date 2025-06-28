"use server"

import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { verifySession, hashPassword } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function addUser(prevState: any, formData: FormData) {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const userResult = await sql`SELECT role FROM users WHERE id = ${session.userId}`
  const currentUserRole = userResult[0]?.role

  if (!currentUserRole || !hasPermission(currentUserRole, "canManageUsers")) {
    return { message: "Permission denied" }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string

  if (!name || !email || !password || !role) {
    return { message: "All fields are required." }
  }

  try {
    const hashedPassword = await hashPassword(password)
    await sql`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, TRUE) -- New users are active by default
    `
    revalidatePath("/dashboard/users")
    return { message: "User added successfully!" }
  } catch (error: any) {
    console.error("Failed to add user:", error)
    if (error.message.includes("duplicate key value violates unique constraint")) {
      return { message: "User with this email already exists." }
    }
    return { message: `Failed to add user: ${error.message || "Unknown error"}` }
  }
}

export async function updateUser(prevState: any, formData: FormData) {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const userResult = await sql`SELECT role FROM users WHERE id = ${session.userId}`
  const currentUserRole = userResult[0]?.role

  if (!currentUserRole || !hasPermission(currentUserRole, "canManageUsers")) {
    return { message: "Permission denied" }
  }

  const id = Number(formData.get("id"))
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as string
  const password = formData.get("password") as string // Optional: for password reset

  if (!id || !name || !email || !role) {
    return { message: "All fields are required." }
  }

  try {
    if (password) {
      const hashedPassword = await hashPassword(password)
      await sql`
        UPDATE users
        SET name = ${name}, email = ${email}, role = ${role}, password_hash = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `
    } else {
      await sql`
        UPDATE users
        SET name = ${name}, email = ${email}, role = ${role}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `
    }
    revalidatePath("/dashboard/users")
    return { message: "User updated successfully!" }
  } catch (error: any) {
    console.error("Failed to update user:", error)
    if (error.message.includes("duplicate key value violates unique constraint")) {
      return { message: "User with this email already exists." }
    }
    return { message: `Failed to update user: ${error.message || "Unknown error"}` }
  }
}

export async function deleteUser(prevState: any, formData: FormData) {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const userResult = await sql`SELECT role FROM users WHERE id = ${session.userId}`
  const currentUserRole = userResult[0]?.role

  if (!currentUserRole || !hasPermission(currentUserRole, "canManageUsers")) {
    return { message: "Permission denied" }
  }

  const id = Number(formData.get("id"))
  if (isNaN(id)) {
    return { message: "Invalid user ID." }
  }

  try {
    await sql`DELETE FROM users WHERE id = ${id}`
    revalidatePath("/dashboard/users")
    return { message: "User deleted successfully!" }
  } catch (error: any) {
    console.error("Failed to delete user:", error)
    return { message: `Failed to delete user: ${error.message || "Unknown error"}` }
  }
}

export async function toggleUserStatus(prevState: any, formData: FormData) {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const userResult = await sql`SELECT role FROM users WHERE id = ${session.userId}`
  const currentUserRole = userResult[0]?.role

  if (!currentUserRole || !hasPermission(currentUserRole, "canManageUsers")) {
    return { message: "Permission denied" }
  }

  const id = Number(formData.get("id"))
  const currentStatus = formData.get("currentStatus") === "true" // Convert string to boolean

  if (isNaN(id)) {
    return { message: "Invalid user ID." }
  }

  try {
    await sql`
      UPDATE users
      SET is_active = ${!currentStatus}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
    revalidatePath("/dashboard/users")
    return { message: `User status toggled successfully for ID ${id}.` }
  } catch (error: any) {
    console.error("Failed to toggle user status:", error)
    return { message: `Failed to toggle user status: ${error.message || "Unknown error"}` }
  }
}
