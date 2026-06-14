import { NextResponse } from "next/server"
import { getAllJobs } from "@/lib/actions/jobs"

export async function GET() {
  try {
    const jobs = await getAllJobs()
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("API /jobs error:", error)
    return NextResponse.json({ error: "Failed to load jobs" }, { status: 500 })
  }
}
