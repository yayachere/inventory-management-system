"use client"

import { format } from "date-fns"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Import the new formatters
import { formatCurrency, formatNumberWithCommas } from "@/lib/formatters"

interface SaleTicketProps {
  transaction: {
    id: number
    item_name: string
    item_sku: string
    quantity: number
    price: number
    total: number
    created_at: string
    user_name: string
    notes?: string
  }
}

export function SaleTicket({ transaction }: SaleTicketProps) {
  const price = Number(transaction.price)
  const total = Number(transaction.total)

  const handlePrint = () => {
    const printContent = document.getElementById("print-ticket-content")
    if (printContent) {
      const originalContents = document.body.innerHTML
      const printArea = printContent.innerHTML

      document.body.innerHTML = printArea
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload() // Reload to restore original page content and scripts
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Sales Receipt</CardTitle>
      </CardHeader>
      <CardContent>
        <div id="print-ticket-content" className="p-4 border border-dashed border-gray-300 rounded-md">
          <div className="text-sm mb-4">
            <p>
              <strong>Transaction ID:</strong> {transaction.id}
            </p>
            <p>
              <strong>Date:</strong> {format(new Date(transaction.created_at), "MMM dd, yyyy HH:mm:ss")}
            </p>
            <p>
              <strong>Sold By:</strong> {transaction.user_name}
            </p>
          </div>

          <div className="border-t border-b border-gray-300 py-2 mb-4">
            <div className="flex justify-between font-semibold">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>
                {transaction.item_name} ({transaction.item_sku})
              </span>
              <span>{formatNumberWithCommas(transaction.quantity)}</span>
              <span>{formatCurrency(price)}</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="text-right text-lg font-bold mb-4">Total: {formatCurrency(total)}</div>

          {transaction.notes && (
            <div className="text-sm text-gray-600 border-t border-gray-200 pt-2">
              <p>
                <strong>Notes:</strong> {transaction.notes}
              </p>
            </div>
          )}

          <div className="text-center text-xs mt-4">
            <p>Thank you for your purchase!</p>
          </div>
        </div>
        <Button onClick={handlePrint} className="w-full mt-4">
          <Printer className="w-4 h-4 mr-2" />
          Print Receipt
        </Button>
      </CardContent>
    </Card>
  )
}
