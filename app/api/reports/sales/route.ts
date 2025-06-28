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

    const userResult = await sql`SELECT id, role FROM users WHERE id = ${session.userId}`
    const currentUser = userResult[0]

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 403 })
    }

    let startDate: string
    let endDate: string

    if (dateParam) {
      const d = new Date(dateParam)
      startDate = new Date(d.setHours(0, 0, 0, 0)).toISOString()
      endDate = new Date(d.setHours(23, 59, 59, 999)).toISOString()
    } else {
      // Default to today's sales if no date is provided
      const today = new Date()
      startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString()
    }

    let reportData

    if (currentUser.role === "admin") {
      // Admin sees all users' sales
      reportData = await sql`
        SELECT u.id AS user_id,
               u.name AS user_name,
               u.email AS user_email,
               COALESCE(SUM(t.total), 0) AS total_sales
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'sale'
                                AND t.created_at >= ${startDate} AND t.created_at <= ${endDate}
        GROUP BY u.id, u.name, u.email
        ORDER BY u.name ASC
      `
    } else if (currentUser.role === "controller") {
      // Controller sees their own sales and all sellers' sales
      reportData = await sql`
        SELECT u.id AS user_id,
               u.name AS user_name,
               u.email AS user_email,
               COALESCE(SUM(t.total), 0) AS total_sales
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'sale'
                                AND t.created_at >= ${startDate} AND t.created_at <= ${endDate}
        WHERE u.id = ${currentUser.id} OR u.role = 'seller'
        GROUP BY u.id, u.name, u.email
        ORDER BY u.name ASC
      `
    } else if (currentUser.role === "seller") {
      // Seller sees only their own sales
      reportData = await sql`
        SELECT u.id AS user_id,
               u.name AS user_name,
               u.email AS user_email,
               COALESCE(SUM(t.total), 0) AS total_sales
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'sale'
                                AND t.created_at >= ${startDate} AND t.created_at <= ${endDate}
        WHERE u.id = ${currentUser.id}
        GROUP BY u.id, u.name, u.email
        ORDER BY u.name ASC
      `
    } else {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Cast total_sales to number
    const formattedReportData = reportData.map((row) => ({
      ...row,
      total_sales: Number(row.total_sales),
    }))

    return NextResponse.json(formattedReportData)
  } catch (error) {
    console.error("API /api/reports/sales error:", error)
    return NextResponse.json({ error: "Failed to fetch sales report" }, { status: 500 })
  }
}
