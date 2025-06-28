import { neon } from "@neondatabase/serverless"

// Handle accidental *-pooler* connection strings (TCP) by converting them
const raw = process.env.NEON_NEON_DATABASE_URL // Use NEON_DATABASE_URL directly
const connectionString = raw?.replace("-pooler", "") // neon HTTP driver needs the regular host

if (!connectionString) {
  throw new Error(
    "⛔ Missing database connection string. Add NEON_DATABASE_URL (or DATABASE_URL) to your environment variables.",
  )
}

export const sql = neon(connectionString)

export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  role: "admin" | "seller" | "controller"
  is_active: boolean // Added is_active
  created_at: string
  updated_at: string
}

export interface Item {
  id: number
  name: string
  description: string
  sku: string
  price: number
  quantity: number
  category: string
  created_by: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  item_id: number
  user_id: number
  type: "sale" | "restock" | "adjustment"
  quantity: number
  price: number
  total: number
  notes: string
  created_at: string
  // Added for joins in transactions page
  item_name?: string
  item_sku?: string
  user_name?: string
}
