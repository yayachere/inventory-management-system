"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

// Import the new formatter
import { formatCurrency } from "@/lib/formatters"

interface SalesReportEntry {
  user_id: number
  user_name: string
  user_email: string
  total_sales: number
}

interface SalesReportClientProps {
  initialReportData: SalesReportEntry[]
  userId: number
  userRole: string
}

export function SalesReportClient({ initialReportData, userId, userRole }: SalesReportClientProps) {
  const [reportData, setReportData] = useState<SalesReportEntry[]>(initialReportData)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()) // Default to today
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(
    async (date?: Date) => {
      setIsLoading(true)
      setError(null)
      try {
        let url = `/api/reports/sales?userId=${userId}`
        if (date) {
          url += `&date=${format(date, "yyyy-MM-dd")}`
        }
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch sales report")
        }
        const data: SalesReportEntry[] = await response.json()
        setReportData(data)
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.")
        setReportData([])
      } finally {
        setIsLoading(false)
      }
    },
    [userId],
  )

  useEffect(() => {
    fetchReport(selectedDate)
  }, [selectedDate, fetchReport])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
        <p className="text-gray-600 mt-2">View sales performance by user for a selected day.</p>
      </div>

      <div className="mb-6">
        <Label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-2">
          Select a date:
        </Label>
        <DatePicker date={selectedDate} setDate={setSelectedDate} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Sales Summary</CardTitle>
          <CardDescription>
            {selectedDate ? `Sales for ${format(selectedDate, "PPP")}` : "Sales for today"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading report...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : reportData.length === 0 ? (
            <p className="text-center text-gray-500">No sales data found for this date.</p>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left">User Name</th>
                    <th className="px-4 py-2 text-left">User Email</th>
                    <th className="px-4 py-2 text-right">Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((entry) => (
                    <tr key={entry.user_id} className="hover:bg-muted/50">
                      <td className="px-4 py-2 border-b whitespace-nowrap">{entry.user_name}</td>
                      <td className="px-4 py-2 border-b whitespace-nowrap">{entry.user_email}</td>
                      <td className="px-4 py-2 border-b whitespace-nowrap text-right">
                        {formatCurrency(entry.total_sales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
