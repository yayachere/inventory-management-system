import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { verifySession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { SalesReportClient } from "@/components/sales-report-client"

interface SalesReportEntry {
  user_id: number
  user_name: string
  user_email: string
  total_sales: number
}

export default async function SalesReportPage() {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const userResult = await sql`SELECT id, role FROM users WHERE id = ${session.userId}`
  const currentUser = userResult[0]

  if (!currentUser || !hasPermission(currentUser.role, "canViewReports")) {
    redirect("/dashboard") // Redirect if no permission
  }

  // Fetch initial data for today
  const today = new Date()
  const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  let initialReportData: SalesReportEntry[]

  if (currentUser.role === "admin") {
    initialReportData = await sql`
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
    initialReportData = await sql`
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
    initialReportData = await sql`
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
    // Should not happen due to permission check above, but as a fallback
    initialReportData = []
  }

  // Cast total_sales to number for initial data
  const formattedInitialReportData = initialReportData.map((row) => ({
    ...row,
    total_sales: Number(row.total_sales),
  }))

  return (
    <SalesReportClient
      initialReportData={formattedInitialReportData}
      userId={currentUser.id}
      userRole={currentUser.role}
    />
  )
}
