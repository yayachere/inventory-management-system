import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { verifySession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { TransactionsClient } from "@/components/transactions-client"
import type { Transaction } from "@/lib/db" // Assuming Transaction type is in lib/db

export default async function TransactionsPage() {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const userResult = await sql`SELECT role FROM users WHERE id = ${session.userId}`
  const userRole = userResult[0]?.role

  // Only allow users with 'canViewAllTransactions' permission to view this page
  // This permission now acts as a gate to the page, and the API route handles the specific data filtering.
  if (!userRole || !hasPermission(userRole, "canViewAllTransactions")) {
    redirect("/dashboard") // Redirect if no permission
  }

  // The initial transactions fetched here will be for the current user,
  // but the client-side fetch in TransactionsClient will apply the full role-based logic.
  // For consistency, let's fetch based on the same logic as the API for initial load.
  let initialTransactionsQuery
  const userId = session.userId

  if (userRole === "admin") {
    initialTransactionsQuery = sql`
      SELECT t.*, i.name as item_name, i.sku as item_sku, u.name as user_name
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 15 -- Default to last 15 transactions for initial load
    `
  } else if (userRole === "seller") {
    initialTransactionsQuery = sql`
      SELECT t.*, i.name as item_name, i.sku as item_sku, u.name as user_name
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ${userId}
      ORDER BY t.created_at DESC
      LIMIT 15
    `
  } else if (userRole === "controller") {
    initialTransactionsQuery = sql`
      SELECT t.*, i.name as item_name, i.sku as item_sku, u.name as user_name
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ${userId} OR u.role = 'seller'
      ORDER BY t.created_at DESC
      LIMIT 15
    `
  } else {
    // Fallback for unexpected roles, or if permission check failed earlier
    redirect("/dashboard")
  }

  const initialTransactions: Transaction[] = await initialTransactionsQuery

  // Cast numeric values to numbers for initial data
  const formattedInitialTransactions = initialTransactions.map((t) => ({
    ...t,
    price: Number(t.price),
    total: Number(t.total),
    quantity: Number(t.quantity),
  }))

  return <TransactionsClient initialTransactions={formattedInitialTransactions} userId={session.userId} />
}
