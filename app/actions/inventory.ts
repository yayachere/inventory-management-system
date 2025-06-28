"use server"

import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { verifySession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function addItem(formData: FormData) {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const user = await sql`SELECT role FROM users WHERE id = ${session.userId}`
  if (!user[0] || !hasPermission(user[0].role, "canAddItems")) {
    return { error: "Permission denied" }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const sku = formData.get("sku") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const quantity = Number.parseInt(formData.get("quantity") as string)
  const category = formData.get("category") as string

  try {
    await sql`
      INSERT INTO items (name, description, sku, price, quantity, category, created_by)
      VALUES (${name}, ${description}, ${sku}, ${price}, ${quantity}, ${category}, ${session.userId})
    `
    revalidatePath("/dashboard/items")
    return { success: "Item added successfully" }
  } catch (error: any) {
    console.error("Failed to add item:", error)
    return { error: `Failed to add item: ${error.message || "Unknown error"}` }
  }
}

export async function updateItem(prevState: any, formData: FormData) {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const user = await sql`SELECT role FROM users WHERE id = ${session.userId}`
  if (!user[0] || !hasPermission(user[0].role, "canEditItems")) {
    return { message: "Permission denied" }
  }

  const id = Number.parseInt(formData.get("id") as string)
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const quantity = Number.parseInt(formData.get("quantity") as string)
  const category = formData.get("category") as string

  try {
    await sql`
      UPDATE items 
      SET name = ${name}, description = ${description}, price = ${price}, 
          quantity = ${quantity}, category = ${category}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
    revalidatePath("/dashboard/items")
    return { message: "Item updated successfully" }
  } catch (error: any) {
    console.error("Failed to update item:", error)
    return { message: `Failed to update item: ${error.message || "Unknown error"}` }
  }
}

export async function deleteItem(prevState: any, formData: FormData) {
  // Check auth
  const session = await verifySession()
  if (!session) redirect("/login")

  const [{ role }] = (await sql`SELECT role FROM users WHERE id = ${session.userId}`) as { role: string }[]

  if (!hasPermission(role, "canDeleteItems")) {
    return { message: "Permission denied" }
  }

  // Get itemId from the form
  const rawId = formData.get("itemId")
  const itemId = Number(rawId)

  if (!itemId || Number.isNaN(itemId)) {
    return { message: "Invalid item id" }
  }

  try {
    await sql`DELETE FROM items WHERE id = ${itemId}`
    revalidatePath("/dashboard/items")
    return { message: "Item deleted successfully" }
  } catch (error: any) {
    console.error("Failed to delete item:", error)
    return { message: `Failed to delete item: ${error.message || "Unknown error"}` }
  }
}

export async function sellItem(formData: FormData) {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const user = await sql`SELECT role FROM users WHERE id = ${session.userId}`
  if (!user[0] || !hasPermission(user[0].role, "canSellItems")) {
    return { error: "Permission denied" }
  }

  const itemId = Number.parseInt(formData.get("itemId") as string)
  const quantity = Number.parseInt(formData.get("quantity") as string)
  const notes = formData.get("notes") as string

  try {
    // Get current item details
    const items = await sql`SELECT * FROM items WHERE id = ${itemId}`
    const item = items[0]

    if (!item) {
      return { error: "Item not found" }
    }

    if (item.quantity < quantity) {
      return { error: "Insufficient stock" }
    }

    const total = item.price * quantity

    // Update item quantity
    await sql`
      UPDATE items 
      SET quantity = quantity - ${quantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${itemId}
    `

    // Record transaction
    const [newTransaction] = await sql`
      INSERT INTO transactions (item_id, user_id, type, quantity, price, total, notes)
      VALUES (${itemId}, ${session.userId}, 'sale', ${quantity}, ${item.price}, ${total}, ${notes})
      RETURNING *
    `
    revalidatePath("/dashboard/items")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/transactions") // Revalidate transactions page too
    return {
      success: "Sale recorded successfully",
      transaction: { ...newTransaction, item_name: item.name, item_sku: item.sku, user_name: user[0].name },
    }
  } catch (error: any) {
    console.error("Failed to process sale:", error)
    return { error: `Failed to process sale: ${error.message || "Unknown error"}` }
  }
}
