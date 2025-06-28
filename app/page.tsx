import { redirect } from "next/navigation"
import { verifySession } from "@/lib/auth"

export default async function HomePage() {
  try {
    const session = await verifySession()

    if (session) {
      redirect("/dashboard")
    } else {
      redirect("/login")
    }
  } catch (error) {
    console.error("Home page error:", error)
    redirect("/login")
  }
}
