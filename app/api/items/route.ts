import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * GET /api/items
 * Returns all items that have at least 1 unit in stock.
 * Casts DECIMAL/NUMERIC price strings to numbers so the client can safely call toFixed().
 */
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, sku, price, quantity, category
      FROM items
      WHERE quantity > 0
      ORDER BY name ASC
    `

    const items = rows.map((row) => ({
      ...row,
      price: Number(row.price), // DECIMAL → number
      quantity: Number(row.quantity), // ensure quantity is number as well
    }))

    return NextResponse.json(items)
  } catch (error) {
    console.error("GET /api/items error:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}
