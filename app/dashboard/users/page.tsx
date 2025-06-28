import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { verifySession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersTableClient } from "@/components/users-table-client"
import type { User } from "@/lib/db" // Assuming User type is in lib/db

export default async function UsersPage() {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const userResult = await sql`SELECT role FROM users WHERE id = ${session.userId}`
  const currentUserRole = userResult[0]?.role

  if (!currentUserRole || !hasPermission(currentUserRole, "canManageUsers")) {
    redirect("/dashboard") // Redirect if no permission
  }

  const users: User[] = await sql`
    SELECT id, email, name, role, is_active, created_at, updated_at -- Select is_active
    FROM users
    ORDER BY created_at DESC
  `

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage user accounts and permissions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>All registered users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTableClient users={users} currentUserRole={currentUserRole} />
        </CardContent>
      </Card>
    </div>
  )
}
