"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import { DeleteItemButton } from "@/components/delete-item-button"
import type { Item } from "@/lib/db" // Import Item type
// Import the new formatter
import { formatCurrency, formatNumberWithCommas } from "@/lib/formatters"

interface ItemsTableClientProps {
  items: Item[]
  userRole: string
}

export function ItemsTableClient({ items, userRole }: ItemsTableClientProps) {
  return (
    <div className="relative w-full overflow-auto">
      {" "}
      {/* Added responsive wrapper */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </TableCell>
              <TableCell className="font-mono">{item.sku}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{formatCurrency(item.price)}</TableCell>
              <TableCell>{formatNumberWithCommas(item.quantity)}</TableCell>
              <TableCell>
                <Badge variant={item.quantity === 0 ? "destructive" : item.quantity < 10 ? "secondary" : "default"}>
                  {item.quantity === 0 ? "Out of Stock" : item.quantity < 10 ? "Low Stock" : "In Stock"}
                </Badge>
              </TableCell>
              <TableCell className="flex gap-2">
                {hasPermission(userRole, "canEditItems") && (
                  <Link href={`/dashboard/items/${item.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                )}
                {hasPermission(userRole, "canDeleteItems") && (
                  <DeleteItemButton itemId={item.id} itemName={item.name} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
