"use client"

import { useRouter } from "next/navigation"
import SharedBackground from "./shared-background"

interface SharedLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function SharedLayout({
  children,
  showSidebar = true,
}: SharedLayoutProps) {
  const router = useRouter()

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/breakthrough-game", label: "Mini Games" },
    { path: "/track", label: "Calendar Tracker" },
    { path: "/new-habit", label: "Habit Creation" },
    { path: "/fitnessAssessment", label: "Fitness Assessment" },
    { path: "/shop", label: "Shop" },
    { path: "/review", label: "Review" },
  ]

  return (
    <SharedBackground>
      <div className="flex min-h-screen">
        {showSidebar && (
          <div className="w-[250px] md:block hidden px-6 py-8 bg-[rgba(11,26,44,0.9)] backdrop-blur-md border-r border-[rgba(0,255,198,0.3)] fixed left-0 top-0 h-screen z-50 overflow-y-auto">
            <h2 className="text-[#00FFF5] text-2xl font-bold mb-8 drop-shadow-[0_0_10px_rgba(0,255,245,0.5)]">
              HabitQuest
            </h2>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => router.push(item.path)}
                    className="w-full text-left px-4 py-3 rounded-lg text-[#B8FFF9] hover:bg-[rgba(0,255,198,0.1)] hover:translate-x-1 transition-all duration-200 flex items-center gap-2"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6 border-t border-[rgba(255,255,255,0.1)] mt-10">
              <button 
                onClick={() => router.push("/login")}
                className="w-full text-left px-4 py-3 rounded-lg text-[#B8FFF9] hover:bg-[rgba(0,255,198,0.1)] hover:translate-x-1 transition-all duration-200 flex items-center gap-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Mobile menu button - only shows on small screens */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            className="p-2 rounded-full bg-[rgba(11,26,44,0.8)] border border-[rgba(0,255,198,0.3)]"
            onClick={() => {
              // Mobile sidebar toggle would go here in a full implementation
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#B8FFF9]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className={`${showSidebar ? 'md:ml-[250px]' : ''} w-full min-h-screen`}>
          {children}
        </div>
      </div>
    </SharedBackground>
  )
} 