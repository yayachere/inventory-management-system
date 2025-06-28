"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { hasPermission } from "@/lib/permissions"
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut, Plus } from "lucide-react"

interface User {
  id: number
  email: string
  name: string
  role: "admin" | "seller" | "controller"
}

interface DashboardNavProps {
  user: User
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: "canViewDashboard" as const,
    },
    {
      href: "/dashboard/items",
      label: "Items",
      icon: Package,
      permission: "canViewDashboard" as const,
    },
    {
      href: "/dashboard/items/add",
      label: "Add Item",
      icon: Plus,
      permission: "canAddItems" as const,
    },
    {
      href: "/dashboard/sell",
      label: "Sell Items",
      icon: ShoppingCart,
      permission: "canSellItems" as const,
    },
    {
      href: "/dashboard/transactions",
      label: "Transactions",
      icon: BarChart3,
      permission: "canViewAllTransactions" as const,
    },
    {
      href: "/dashboard/reports", // New link
      label: "Sales Report", // New label
      icon: BarChart3, // Reusing icon, consider a different one if available
      permission: "canViewReports" as const, // New permission
    },
    {
      href: "/dashboard/users",
      label: "Users",
      icon: Users,
      permission: "canManageUsers" as const,
    },
  ]

  const filteredNavItems = navItems.filter((item) => hasPermission(user.role, item.permission))

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">Inventory System</h1>
        <p className="text-sm text-gray-600 mt-1">
          {user.name} ({user.role})
        </p>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 mt-1 text-sm rounded-lg transition-colors ${
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4">
        <form action={logout}>
          <Button variant="outline" className="w-full bg-transparent">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  )
}
