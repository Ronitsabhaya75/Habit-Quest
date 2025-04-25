"use client"

import React, { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                HabitQuest
              </Link>
              <div className="ml-8 hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-gray-300 hover:text-white">
                  Dashboard
                </Link>
                <Link href="/calendar" className="text-gray-300 hover:text-white">
                  Calendar
                </Link>
                {/* <Link href="/recurring-tasks" className="text-gray-300 hover:text-white">
                  Tasks
                </Link> */}
                <Link href="/breakthrough-game" className="text-gray-300 hover:text-white">
                  Games
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/user-profile')}
                className="p-2 rounded-full bg-[#1a2332]/50 hover:bg-[#1a2332]"
              >
                <span className="sr-only">Profile</span>
                <div className="h-8 w-8 rounded-full bg-[#4cc9f0] flex items-center justify-center text-white font-medium">
                  U
                </div>
              </button>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mt-12 text-center text-gray-500 text-sm py-6">
          <p>© {new Date().getFullYear()} HabitQuest. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default MainLayout;
