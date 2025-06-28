import { sql } from "@/lib/db"
import { verifySession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ItemEditForm } from "@/components/item-edit-form"

export default async function EditItemPage({ params }: { params: { id: string } }) {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const userResult = await sql`SELECT role FROM users WHERE id = ${session.userId}`
  const userRole = userResult[0]?.role

  if (!userRole || !hasPermission(userRole, "canEditItems")) {
    redirect("/dashboard/items") // Redirect if no permission
  }

  const itemId = Number.parseInt(params.id)
  if (isNaN(itemId)) {
    redirect("/dashboard/items") // Redirect if ID is not a number
  }

  const items = await sql`SELECT * FROM items WHERE id = ${itemId}`
  const item = items[0]

  if (!item) {
    redirect("/dashboard/items") // Redirect if item not found
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/dashboard/items" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Items
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Item: {item.name}</h1>
        <p className="text-gray-600 mt-2">Update the details for this inventory item</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Modify the item information below</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemEditForm item={item} />
        </CardContent>
      </Card>
    </div>
  )
}
