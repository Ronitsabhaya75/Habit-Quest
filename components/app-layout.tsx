"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"
import { ShoppingBag, Search, Home, Calendar, Plus, Activity, Star, LogOut } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

// Animated background particle component
const ParticleBackground = () => {
  return (
    <div className="particle-container absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full bg-[#00FFF5]/10"
          style={{
            width: `${Math.random() * 20 + 5}px`,
            height: `${Math.random() * 20 + 5}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 20 + 10}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  )
}

interface AppLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  userXp?: number
  userLevel?: number
}

export function AppLayout({ children, title, subtitle, userXp = 0, userLevel = 1 }: AppLayoutProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { href: "/mini-games", label: "Mini Games", icon: <div className="w-5 h-5 flex items-center justify-center">🎮</div> },
    { href: "/calendar", label: "Calendar", icon: <Calendar className="w-5 h-5" /> },
    { href: "/habit-creation", label: "Habit Creation", icon: <Plus className="w-5 h-5" /> },
    { href: "/fitness", label: "Fitness", icon: <Activity className="w-5 h-5" /> },
    { href: "/shop", label: "Shop", icon: <ShoppingBag className="w-5 h-5" /> },
    { href: "/review", label: "Review", icon: <Star className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#0d1520] via-[#0e1c2e] to-[#0f2440] text-white flex flex-col">
      {/* Animated Background */}
      <ParticleBackground />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#0d1520]/70 pointer-events-none"></div>
      
      {/* Top Navigation Bar */}
      <div className="relative bg-[#0a1623]/95 backdrop-blur-md border-b border-[rgba(0,255,198,0.1)] z-10">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          {/* Logo */}
          <div className="text-2xl font-bold text-white">
            <Link href="/dashboard" className="flex items-center transition-all duration-300 hover:text-[#00FFF5]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] mr-1">Habit</span>Quest
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-2 items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex flex-col items-center px-3 ${isActive ? 'text-[#00FFF5]' : 'text-gray-400 hover:text-[#B8FFF9]'} transition-all duration-300`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                  <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-[#00FFF5]' : 'bg-transparent'} mt-1`}></div>
                </Link>
              )
            })}
          </div>

          {/* Mobile Nav Toggle */}
          <div className="md:hidden">
            <button className="text-white hover:text-[#00FFF5] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          {/* Search and Level */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search..."
                className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] w-40 h-8 rounded-full px-10 focus:ring-2 focus:ring-[#00FFF5]/30 transition-all"
              />
              <Search className="h-4 w-4 absolute left-3 top-2 text-gray-400" />
            </div>
            <div className="flex items-center bg-[#00FFF5] text-[#0a1623] font-medium rounded-full px-4 py-1">
              Level {userLevel}
            </div>
            {userXp > 0 && (
              <div className="flex items-center text-[#00FFF5] font-medium rounded-full px-4 py-1 bg-[rgba(0,255,245,0.1)] border border-[rgba(0,255,245,0.2)]">
                {userXp} XP
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Page Title */}
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#00FFF5] drop-shadow-[0_0_10px_rgba(0,255,245,0.3)]">
              {title}
            </h1>
            {subtitle && <p className="text-[#B8FFF9] opacity-80 text-lg">{subtitle}</p>}
          </div>
          
          {/* Page Content */}
          {children}
        </div>
      </div>
      
      {/* Logout Button - Fixed at bottom right */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button className="bg-[rgba(0,166,255,0.2)] text-[#B8FFF9] border border-[rgba(0,166,255,0.3)] hover:bg-[rgba(0,166,255,0.3)] flex items-center space-x-2 rounded-md px-4 py-2 hover:shadow-[0_0_15px_rgba(0,166,255,0.3)] transform hover:scale-105 transition-all duration-300">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(5px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        
        .particle {
          animation: float linear infinite;
          opacity: 0.5;
        }
        
        .bg-gradient-radial {
          background-image: radial-gradient(circle, var(--tw-gradient-stops));
        }
        
        .font-heading {
          font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
      `}</style>
    </div>
  )
} 