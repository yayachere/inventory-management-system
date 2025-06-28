import { verifySession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react"
import { hasPermission } from "@/lib/permissions" // Import hasPermission
// Import the new formatters
import { formatCurrency, formatNumberWithCommas } from "@/lib/formatters"

export default async function DashboardPage() {
  const session = await verifySession()

  // Fetch user role for permission check
  const userResult = await sql`SELECT id, role FROM users WHERE id = ${session?.userId}`
  const user = userResult[0]

  // Get dashboard statistics
  const [itemCount] = await sql`SELECT COUNT(*) as count FROM items`
  const [lowStockCount] = await sql`SELECT COUNT(*) as count FROM items WHERE quantity < 10`

  let todaySalesQuery
  if (user?.role === "admin") {
    todaySalesQuery = sql`
      SELECT COUNT(*) as count, COALESCE(SUM(t.total), 0) as total
      FROM transactions t
      WHERE t.type = 'sale' AND DATE(t.created_at) = CURRENT_DATE
    `
  } else if (user?.role === "seller") {
    todaySalesQuery = sql`
      SELECT COUNT(*) as count, COALESCE(SUM(t.total), 0) as total
      FROM transactions t
      WHERE t.type = 'sale' AND DATE(t.created_at) = CURRENT_DATE AND t.user_id = ${user.id}
    `
  } else if (user?.role === "controller") {
    todaySalesQuery = sql`
      SELECT COUNT(*) as count, COALESCE(SUM(t.total), 0) as total
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.type = 'sale' AND DATE(t.created_at) = CURRENT_DATE AND (t.user_id = ${user.id} OR u.role = 'seller')
    `
  } else {
    // Fallback for unexpected roles or if user is not found (though layout should redirect)
    todaySalesQuery = sql`
      SELECT COUNT(*) as count, COALESCE(SUM(t.total), 0) as total
      FROM transactions t
      WHERE t.type = 'sale' AND DATE(t.created_at) = CURRENT_DATE AND t.user_id = ${user?.id || 0}
    `
  }

  const [todaySales] = await todaySalesQuery

  // Fetch user count only if the current user has permission to manage users
  let userCount = { count: 0 }
  if (user?.role && hasPermission(user.role, "canManageUsers")) {
    const [countResult] = await sql`SELECT COUNT(*) as count FROM users`
    userCount = countResult
  }

  const stats = [
    {
      title: "Total Items",
      value: formatNumberWithCommas(itemCount.count),
      description: "Items in inventory",
      icon: Package,
      color: "text-blue-600",
      permission: "canViewDashboard" as const, // Everyone can see this
    },
    {
      title: "Low Stock Items",
      value: formatNumberWithCommas(lowStockCount.count),
      description: "Items with quantity < 10",
      icon: TrendingUp,
      color: "text-red-600",
      permission: "canViewDashboard" as const, // Everyone can see this
    },
    {
      title: "Today's Sales",
      value: formatCurrency(todaySales.total),
      description: `${todaySales.count} transactions`,
      icon: ShoppingCart,
      color: "text-green-600",
      permission: "canViewDashboard" as const, // Everyone can see this
    },
    {
      title: "Total Users",
      value: formatNumberWithCommas(userCount.count),
      description: "Registered users",
      icon: Users,
      color: "text-purple-600",
      permission: "canManageUsers" as const, // Only admins can see this
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your inventory management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          // Conditionally render card based on user's role and card's permission
          if (user?.role && !hasPermission(user.role, stat.permission)) {
            return null // Don't render if user doesn't have permission
          }

          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest inventory transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {user && <RecentTransactions currentUser={user} />} {/* Pass user to RecentTransactions */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <LowStockItems />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface CurrentUser {
  id: number
  role: string
}

async function RecentTransactions({ currentUser }: { currentUser: CurrentUser }) {
  let transactionsQuery
  if (currentUser.role === "admin") {
    transactionsQuery = sql`
      SELECT t.*, i.name as item_name, u.name as user_name
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `
  } else if (currentUser.role === "seller") {
    transactionsQuery = sql`
      SELECT t.*, i.name as item_name, u.name as user_name
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ${currentUser.id}
      ORDER BY t.created_at DESC
      LIMIT 5
    `
  } else if (currentUser.role === "controller") {
    transactionsQuery = sql`
      SELECT t.*, i.name as item_name, u.name as user_name
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ${currentUser.id} OR u.role = 'seller'
      ORDER BY t.created_at DESC
      LIMIT 5
    `
  } else {
    // Default for other roles or if no role is found (should be redirected by layout)
    transactionsQuery = sql`
      SELECT t.*, i.name as item_name, u.name as user_name
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ${currentUser.id} -- Fallback to own transactions
      ORDER BY t.created_at DESC
      LIMIT 5
    `
  }

  const transactions = await transactionsQuery

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div>
            <p className="font-medium">{transaction.item_name}</p>
            <p className="text-sm text-gray-600">
              {transaction.type} by {transaction.user_name}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {transaction.type === "sale" ? "-" : "+"}
              {formatNumberWithCommas(transaction.quantity)}
            </p>
            <p className="text-sm text-gray-600">{formatCurrency(Number(transaction.total))}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

async function LowStockItems() {
  const items = await sql`
    SELECT name, quantity, sku
    FROM items
    WHERE quantity < 10
    ORDER BY quantity ASC
    LIMIT 5
  `

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.sku} className="flex items-center justify-between">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-600">SKU: {item.sku}</p>
          </div>
          <div className="text-right">
            <p className={`font-medium ${item.quantity === 0 ? "text-red-600" : "text-orange-600"}`}>
              {formatNumberWithCommas(item.quantity)} left
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
