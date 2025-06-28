"use client"

import { useState, useEffect } from "react"
import { sellItem } from "@/app/actions/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart } from "lucide-react"
import { SaleTicket } from "@/components/sale-ticket" // Import SaleTicket
// Import the new formatters
import { formatCurrency, formatNumberWithCommas } from "@/lib/formatters"

interface Item {
  id: number
  name: string
  sku: string
  price: number
  quantity: number
}

interface Transaction {
  id: number
  item_id: number
  user_id: number
  type: "sale" | "restock" | "adjustment"
  quantity: number
  price: number
  total: number
  notes: string
  created_at: string
  item_name: string
  item_sku: string
  user_name: string
}

export default function SellItemPage() {
  const [items, setItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null) // State for last transaction

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const response = await fetch("/api/items")
      const data = await response.json()
      setItems(data.filter((item: Item) => item.quantity > 0))
    } catch (error) {
      console.error("Failed to fetch items:", error)
    }
  }

  async function handleSubmit(formData: FormData) {
    if (!selectedItem) {
      setMessage({ type: "error", text: "Please select an item" })
      return
    }

    setIsLoading(true)
    setMessage(null)
    setLastTransaction(null) // Clear previous transaction

    formData.append("itemId", selectedItem.id.toString())

    const result = await sellItem(formData)

    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result?.success && result.transaction) {
      setMessage({ type: "success", text: result.success })
      setLastTransaction(result.transaction as Transaction) // Set the last transaction
      // Reset form
      setSelectedItem(null)
      setQuantity(1)
      fetchItems() // Refresh items list
      const form = document.getElementById("sell-form") as HTMLFormElement
      form?.reset()
    }

    setIsLoading(false)
  }

  const total = selectedItem ? selectedItem.price * quantity : 0

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sell Items</h1>
        <p className="text-gray-600 mt-2">Process item sales and update inventory</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            New Sale
          </CardTitle>
          <CardDescription>Select an item and quantity to process a sale</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="sell-form" action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item">Select Item</Label>
              <Select
                onValueChange={(value) => {
                  const item = items.find((i) => i.id.toString() === value)
                  setSelectedItem(item || null)
                }}
                value={selectedItem?.id.toString() || ""} // Control select value
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an item to sell" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} - {formatCurrency(item.price)} ({formatNumberWithCommas(item.quantity)} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItem && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium">{selectedItem.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {selectedItem.sku}</p>
                  <p className="text-sm text-gray-600">Available: {formatNumberWithCommas(selectedItem.quantity)}</p>
                  <p className="text-sm text-gray-600">Price: {formatCurrency(selectedItem.price)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max={selectedItem.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea id="notes" name="notes" placeholder="Add any notes about this sale" rows={3} />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </>
            )}

            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !selectedItem}>
              {isLoading ? "Processing Sale..." : "Complete Sale"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {lastTransaction && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Last Sale Receipt</h2>
          <SaleTicket transaction={lastTransaction} />
        </div>
      )}
    </div>
  )
}
