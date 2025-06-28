import type React from "react"
import { redirect } from "next/navigation"
import { verifySession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardNav } from "@/components/dashboard-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Import Sheet components
import { Button } from "@/components/ui/button" // Import Button
import { MenuIcon } from "lucide-react" // Import MenuIcon

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const session = await verifySession()

    if (!session) {
      redirect("/login")
    }

    const users = await sql`
      SELECT id, email, name, role FROM users WHERE id = ${session.userId}
    `

    const user = users[0]

    if (!user) {
      redirect("/login")
    }

    return (
      <div className="flex h-screen bg-gray-100">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <DashboardNav user={user} />
        </div>

        <main className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
            <h1 className="text-xl font-bold text-gray-800">Inventory System</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <DashboardNav user={user} />
              </SheetContent>
            </Sheet>
          </header>
          {children}
        </main>
      </div>
    )
  } catch (error) {
    console.error("Dashboard layout error:", error)
    redirect("/login")
  }
}
