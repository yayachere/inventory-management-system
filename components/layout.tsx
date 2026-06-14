"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Home, Settings, LogOut, User, BookOpen, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import Footer from "@/components/footer"
import { checkSession } from "@/lib/session-client"

interface AuthUser {
  email: string
  role: string
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sessionLoading, setSessionLoading] = useState(false)

  useEffect(() => {
    const loadSession = async () => {
      if (pathname.startsWith("/admin")) {
        setSessionLoading(true)
        try {
          const userData = await checkSession()
          setUser(userData)
        } catch (error) {
          console.error("Session loading error:", error)
          setUser(null)
        } finally {
          setSessionLoading(false)
        }
      }
    }
    loadSession()
  }, [pathname])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      if (response.ok) {
        setUser(null)
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">JobsEthiopia</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                href="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Jobs</span>
              </Link>

              <Link
                href="/tips"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/tips")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Tips</span>
              </Link>

              <ThemeToggle />

              {sessionLoading ? (
                <div className="w-8 h-8 animate-pulse bg-muted rounded"></div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/change-password" className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Change Password</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-destructive">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </nav>
          </div>
        </div>
      </header>

      <main className="bg-background flex-1">{children}</main>

      <Footer />
    </div>
  )
}
