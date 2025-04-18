"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  LayoutDashboard,
  GamepadIcon,
  Calendar,
  Plus,
  Dumbbell,
  ShoppingBag,
  BarChart4,
  Search,
  MessageCircle,
  LogOut,
  Menu,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/mini-games", label: "Mini Games", icon: GamepadIcon },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/habit-creation", label: "Habit Creation", icon: Plus },
    { path: "/fitness", label: "Fitness", icon: Dumbbell },
    { path: "/shop", label: "Shop", icon: ShoppingBag },
    { path: "/review", label: "Review", icon: BarChart4 },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="flex h-screen w-screen bg-[#0d1520] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r border-[#2a3343] bg-[#111827]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-white">HabitQuest</h1>
        </div>
        <div className="mt-6">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                  pathname === item.path
                    ? "bg-[#4cc9f0] text-black font-medium"
                    : "text-gray-300 hover:bg-[#2a3343] hover:text-white"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 border-t border-[#2a3343] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#4cc9f0] flex items-center justify-center text-black font-bold">
                {user?.username?.charAt(0) || "U"}
              </div>
              <div className="text-white">Level {user?.level || 1}</div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[#2a3343] flex items-center justify-between px-4 bg-[#111827]">
          {/* Mobile Menu */}
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-[#111827] border-r border-[#2a3343]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4">
                    <h1 className="text-xl font-bold text-white">HabitQuest</h1>
                  </div>
                  <div className="mt-6 flex-1">
                    <nav className="space-y-1 px-2">
                      {navItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => handleNavigation(item.path)}
                          className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                            pathname === item.path
                              ? "bg-[#4cc9f0] text-black font-medium"
                              : "text-gray-300 hover:bg-[#2a3343] hover:text-white"
                          }`}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                  <div className="border-t border-[#2a3343] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#4cc9f0] flex items-center justify-center text-black font-bold">
                          {user?.username?.charAt(0) || "U"}
                        </div>
                        <div className="text-white">Level {user?.level || 1}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={logout}>
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo for mobile */}
          <div className="md:hidden">
            <h1 className="text-xl font-bold text-white">HabitQuest</h1>
          </div>

          {/* Search bar */}
          <div className="hidden md:block flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search..." className="pl-8 bg-[#2a3343] border-[#3a4353] text-white w-full" />
            </div>
          </div>

          {/* Right side of navbar */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" className="rounded-full bg-[#2a3343] border-[#3a4353] text-white">
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button className="rounded-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">{user?.xp || 0} XP</Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-[#0d1520]">{children}</main>
      </div>
    </div>
  )
}
