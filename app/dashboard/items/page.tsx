import Link from "next/link"
import { sql } from "@/lib/db"
import { verifySession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package } from "lucide-react"
import { ItemsTableClient } from "@/components/items-table-client"
import type { Item } from "@/lib/db" // Import Item type

export default async function ItemsPage() {
  const session = await verifySession()
  const userResult = await sql`SELECT role FROM users WHERE id = ${session?.userId}`
  const userRole = userResult[0]?.role

  const items: Item[] = await sql`
    SELECT i.*, u.name as created_by_name
    FROM items i
    LEFT JOIN users u ON i.created_by = u.id
    ORDER BY i.created_at DESC
  `

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600 mt-2">Manage your inventory items</p>
        </div>
        {hasPermission(userRole, "canAddItems") && (
          <Link href="/dashboard/items/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Inventory Items
          </CardTitle>
          <CardDescription>All items in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemsTableClient items={items} userRole={userRole} />
        </CardContent>
      </Card>
    </div>
  )
}
