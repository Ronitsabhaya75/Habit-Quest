"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

interface NavbarProps {
  activeSection?: string
}

export default function Navbar({ activeSection = "dashboard" }: NavbarProps) {
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Current level (could be fetched from user context in real implementation)
  const currentLevel = 1
  
  const handleNavigation = (path: string) => {
    router.push(`/${path}`)
  }
  
  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 left-0 w-full bg-[#0F2027]/85 backdrop-blur-md shadow-md z-40 h-[70px] flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center text-2xl font-bold text-[#E0F7FA] cursor-pointer hover:animate-logoAnimation" onClick={() => router.push('/dashboard')}>
          HabitQuest
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <ul className="flex gap-6">
            {[
              { path: "dashboard", label: "Dashboard", icon: "👾" },
              { path: "breakthrough-game", label: "Mini Games", icon: "🎮" },
              { path: "track", label: "Calendar", icon: "📅" },
              { path: "new-habit", label: "Habit Creation", icon: "✨" },
              { path: "fitnessAssessment", label: "Fitness", icon: "🏋️" },
              { path: "shop", label: "Shop", icon: "🛒" },
              { path: "review", label: "Review", icon: "📊" },
            ].map((item) => (
              <li
                key={item.path}
                className={`flex flex-col items-center px-3 py-2 rounded-md cursor-pointer transition-all relative ${
                  activeSection === item.path
                    ? "text-[#E0F7FA]"
                    : "text-[#B8F0F9] hover:text-[#E0F7FA] hover:-translate-y-1"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
                {activeSection === item.path && (
                  <div className="absolute bottom-0 left-1/2 w-4/5 h-0.5 bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] -translate-x-1/2"></div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search (Desktop only) */}
          <div className="hidden md:flex items-center bg-white/10 rounded-full px-4 py-2 border border-[#E0F7FA]/10 focus-within:bg-white/15 focus-within:border-[#40E0D0]/30 focus-within:shadow-[0_0_15px_rgba(64,224,208,0.1)] transition-all">
            <Search className="text-[#B8F0F9] mr-2 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none text-[#E0F7FA] text-sm w-32 outline-none placeholder:text-[#E0F7FA]/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Level Badge */}
          <div className="bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] px-4 py-2 rounded-full font-semibold shadow-[0_8px_15px_rgba(64,224,208,0.25)] text-white hover:-translate-y-1 hover:shadow-[0_12px_20px_rgba(64,224,208,0.3)] transition-all">
            Level {currentLevel}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-[#E0F7FA] text-2xl" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-[70px] left-0 w-full bg-[#0F2027]/95 backdrop-blur-md z-30 shadow-md animate-fadeIn">
          <ul className="flex flex-col w-full">
            {[
              { path: "dashboard", label: "Dashboard", icon: "👾" },
              { path: "breakthrough-game", label: "Mini Games", icon: "🎮" },
              { path: "track", label: "Calendar", icon: "📅" },
              { path: "new-habit", label: "Habit Creation", icon: "✨" },
              { path: "fitnessAssessment", label: "Fitness", icon: "🏋️" },
              { path: "shop", label: "Shop", icon: "🛒" },
              { path: "review", label: "Review", icon: "📊" },
            ].map((item) => (
              <li
                key={item.path}
                className={`flex flex-row items-center gap-4 px-6 py-3 cursor-pointer ${
                  activeSection === item.path
                    ? "bg-[#40E0D0]/15 border-l-4 border-[#40E0D0]"
                    : "border-l-4 border-transparent"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[#E0F7FA]">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
} 