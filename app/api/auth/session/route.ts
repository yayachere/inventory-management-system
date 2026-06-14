import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      email: session.email,
      role: session.role,
    })
  } catch (error) {
    return NextResponse.json({ error: "Session error" }, { status: 500 })
  }
}
