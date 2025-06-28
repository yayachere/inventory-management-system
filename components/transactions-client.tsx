"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Printer } from "lucide-react"
import { SaleTicket } from "@/components/sale-ticket" // Import SaleTicket
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Import the new formatters
import { formatCurrency, formatNumberWithCommas } from "@/lib/formatters"

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

interface TransactionsClientProps {
  initialTransactions: Transaction[]
  userId: number
}

function TCell(props: React.HTMLAttributes<HTMLTableCellElement>) {
  return <td className="px-4 py-2 border-b whitespace-nowrap" {...props} />
}

export function TransactionsClient({ initialTransactions, userId }: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTransactionForPrint, setSelectedTransactionForPrint] = useState<Transaction | null>(null)
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)

  const fetchTransactions = useCallback(
    async (date?: Date) => {
      setIsLoading(true)
      setError(null)
      try {
        let url = `/api/transactions?userId=${userId}`
        if (date) {
          url += `&date=${format(date, "yyyy-MM-dd")}`
        }
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch transactions")
        }
        const data: Transaction[] = await response.json()
        setTransactions(data)
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.")
        setTransactions([])
      } finally {
        setIsLoading(false)
      }
    },
    [userId],
  )

  useEffect(() => {
    fetchTransactions(selectedDate)
  }, [selectedDate, fetchTransactions])

  const handlePrintClick = (transaction: Transaction) => {
    setSelectedTransactionForPrint(transaction)
    setIsPrintDialogOpen(true)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
        <p className="text-gray-600 mt-2">View your daily inventory activities.</p>
      </div>

      <div className="mb-6">
        <Label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-2">
          Select a specific day:
        </Label>
        <DatePicker date={selectedDate} setDate={setSelectedDate} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {selectedDate ? `Transactions for ${format(selectedDate, "PPP")}` : "Transactions from the last 15 days"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading transactions...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : transactions.length === 0 ? (
            <p className="text-center text-gray-500">No transactions found for this period.</p>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/50">
                      <TCell>{format(new Date(t.created_at), "MMM dd, yyyy HH:mm")}</TCell>
                      <TCell>
                        <div className="font-medium">{t.item_name}</div>
                        <div className="text-xs text-gray-500">SKU: {t.item_sku}</div>
                      </TCell>
                      <TCell>
                        <Badge
                          variant={t.type === "sale" ? "destructive" : t.type === "restock" ? "default" : "secondary"}
                        >
                          {t.type[0].toUpperCase() + t.type.slice(1)}
                        </Badge>
                      </TCell>
                      <TCell className="text-right">{formatNumberWithCommas(t.quantity)}</TCell>
                      <TCell className="text-right">{formatCurrency(t.price)}</TCell>
                      <TCell className="text-right">{formatCurrency(t.total)}</TCell>
                      <TCell className="max-w-[200px] truncate">{t.notes || "-"}</TCell>
                      <TCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => handlePrintClick(t)}>
                          <Printer className="w-4 h-4" />
                        </Button>
                      </TCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Dialog */}
      {selectedTransactionForPrint && (
        <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Print Receipt</DialogTitle>
            </DialogHeader>
            <SaleTicket transaction={selectedTransactionForPrint} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
