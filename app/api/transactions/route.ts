import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifySession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    // Current user + role
    const [{ role }] = await sql`SELECT role FROM users WHERE id = ${session.userId}`

    // === Time‐window ========================================================
    let startDate: string
    let endDate: string

    if (dateParam) {
      const d = new Date(dateParam)
      startDate = new Date(d.setHours(0, 0, 0, 0)).toISOString()
      endDate = new Date(d.setHours(23, 59, 59, 999)).toISOString()
    } else {
      // default - last 15 days
      const fifteenDaysAgo = new Date()
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
      startDate = fifteenDaysAgo.toISOString()
      endDate = new Date().toISOString()
    }

    // === Queries by role =====================================================
    let rows

    if (role === "admin") {
      // Admin sees everything
      rows = await sql`
        SELECT t.*, i.name  AS item_name,
                     i.sku  AS item_sku,
                     u.name AS user_name
        FROM transactions t
        JOIN items i ON t.item_id = i.id
        JOIN users u ON t.user_id = u.id
        WHERE t.created_at >= ${startDate}
          AND t.created_at <= ${endDate}
        ORDER BY t.created_at DESC
      `
    } else if (role === "seller") {
      // Seller sees only their own
      rows = await sql`
        SELECT t.*, i.name  AS item_name,
                     i.sku  AS item_sku,
                     u.name AS user_name
        FROM transactions t
        JOIN items i ON t.item_id = i.id
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = ${session.userId}
          AND t.created_at >= ${startDate}
          AND t.created_at <= ${endDate}
        ORDER BY t.created_at DESC
      `
    } else if (role === "controller") {
      // Controller sees theirs + all seller transactions
      rows = await sql`
        SELECT t.*, i.name  AS item_name,
                     i.sku  AS item_sku,
                     u.name AS user_name
        FROM transactions t
        JOIN items i ON t.item_id = i.id
        JOIN users u ON t.user_id = u.id
        WHERE (t.user_id = ${session.userId} OR u.role = 'seller')
          AND t.created_at >= ${startDate}
          AND t.created_at <= ${endDate}
        ORDER BY t.created_at DESC
      `
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Cast DECIMAL / NUMERIC strings → numbers
    const formatted = rows.map((r) => ({
      ...r,
      price: Number(r.price),
      total: Number(r.total),
      quantity: Number(r.quantity),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("API /api/transactions error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
