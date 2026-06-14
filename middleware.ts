import { type NextRequest, NextResponse } from "next/server"

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Only protect admin routes
  if (path.startsWith("/admin")) {
    const sessionCookie = req.cookies.get("session")

    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
  }

  // Redirect logged-in users away from login page
  if (path === "/login") {
    const sessionCookie = req.cookies.get("session")

    if (sessionCookie?.value) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
}
