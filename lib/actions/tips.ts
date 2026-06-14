"use server"

import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export interface Tip {
  id: string
  title: string
  content: string
  category: string
  author: string
  tags: string[]
  difficulty_level: string
  estimated_read_time: number
  is_featured: boolean
  status: string
  views_count: number
  likes_count: number
  created_at: string
  updated_at: string
}

export interface CreateTipData {
  title: string
  content: string
  category: string
  author: string
  tags: string[]
  difficulty_level: string
  estimated_read_time: number
  is_featured: boolean
  status: string
}

export interface UpdateTipData extends CreateTipData {
  id: string
}

// Get all tips
export async function getAllTips(): Promise<Tip[]> {
  try {
    const tips = await sql`
      SELECT * FROM tips 
      ORDER BY created_at DESC
    `
    return tips as Tip[]
  } catch (error) {
    console.error("Error fetching tips:", error)
    throw new Error("Failed to fetch tips")
  }
}

// Get tip by ID
export async function getTipById(id: string): Promise<Tip | null> {
  try {
    const tips = await sql`
      SELECT * FROM tips 
      WHERE id = ${id}
    `

    if (tips.length === 0) {
      return null
    }

    // Increment view count
    await sql`
      UPDATE tips 
      SET views_count = views_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    return tips[0] as Tip
  } catch (error) {
    console.error("Error fetching tip:", error)
    throw new Error("Failed to fetch tip")
  }
}

// Create new tip
export async function createTip(data: CreateTipData) {
  try {
    const result = await sql`
      INSERT INTO tips (
        title, content, category, author, tags, 
        difficulty_level, estimated_read_time, is_featured, status
      )
      VALUES (
        ${data.title}, ${data.content}, ${data.category}, ${data.author}, 
        ${data.tags}, ${data.difficulty_level}, ${data.estimated_read_time}, 
        ${data.is_featured}, ${data.status}
      )
      RETURNING id
    `

    revalidatePath("/admin/tips")
    revalidatePath("/tips")

    return { success: true, id: result[0].id }
  } catch (error) {
    console.error("Error creating tip:", error)
    return { success: false, error: "Failed to create tip" }
  }
}

// Update tip
export async function updateTip(data: UpdateTipData) {
  try {
    await sql`
      UPDATE tips 
      SET 
        title = ${data.title},
        content = ${data.content},
        category = ${data.category},
        author = ${data.author},
        tags = ${data.tags},
        difficulty_level = ${data.difficulty_level},
        estimated_read_time = ${data.estimated_read_time},
        is_featured = ${data.is_featured},
        status = ${data.status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${data.id}
    `

    revalidatePath("/admin/tips")
    revalidatePath("/tips")

    return { success: true }
  } catch (error) {
    console.error("Error updating tip:", error)
    return { success: false, error: "Failed to update tip" }
  }
}

// Delete tip
export async function deleteTip(id: string) {
  try {
    await sql`
      DELETE FROM tips 
      WHERE id = ${id}
    `

    revalidatePath("/admin/tips")
    revalidatePath("/tips")

    return { success: true }
  } catch (error) {
    console.error("Error deleting tip:", error)
    return { success: false, error: "Failed to delete tip" }
  }
}

// Get tips by category
export async function getTipsByCategory(category: string): Promise<Tip[]> {
  try {
    const tips = await sql`
      SELECT * FROM tips 
      WHERE category = ${category} AND status = 'published'
      ORDER BY created_at DESC
    `
    return tips as Tip[]
  } catch (error) {
    console.error("Error fetching tips by category:", error)
    throw new Error("Failed to fetch tips")
  }
}

// Get featured tips
export async function getFeaturedTips(): Promise<Tip[]> {
  try {
    const tips = await sql`
      SELECT * FROM tips 
      WHERE is_featured = true AND status = 'published'
      ORDER BY created_at DESC
      LIMIT 5
    `
    return tips as Tip[]
  } catch (error) {
    console.error("Error fetching featured tips:", error)
    throw new Error("Failed to fetch featured tips")
  }
}

// Search tips
export async function searchTips(query: string): Promise<Tip[]> {
  try {
    const tips = await sql`
      SELECT * FROM tips 
      WHERE (
        title ILIKE ${"%" + query + "%"} OR 
        content ILIKE ${"%" + query + "%"} OR 
        category ILIKE ${"%" + query + "%"} OR
        ${query} = ANY(tags)
      ) AND status = 'published'
      ORDER BY created_at DESC
    `
    return tips as Tip[]
  } catch (error) {
    console.error("Error searching tips:", error)
    throw new Error("Failed to search tips")
  }
}
