"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-600">Something went wrong!</CardTitle>
          <CardDescription className="text-center">An error occurred while loading the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
            <p>
              <strong>Error:</strong> {error.message}
            </p>
            {error.digest && (
              <p>
                <strong>Digest:</strong> {error.digest}
              </p>
            )}
          </div>
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
          <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
