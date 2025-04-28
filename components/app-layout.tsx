"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"
import { ShoppingBag, Search, Home, Calendar, Plus, Star, LogOut, Heart, Gamepad2 } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { motion, AnimatePresence } from "framer-motion"

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

interface NavItemProps {
  icon: JSX.Element
  label: string
  href: string
  isActive: boolean
}

const NavItem = ({ icon, label, href, isActive }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
        isActive ? "text-[#4cc9f0]" : "text-white/60 hover:text-white"
      }`}
    >
      <div className="text-xl mb-1">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="w-1 h-1 bg-[#4cc9f0] rounded-full mt-1"
        />
      )}
    </Link>
  )
}

export function AppLayout({ children, title, subtitle, userXp = 0, userLevel = 1 }: AppLayoutProps) {
  const pathname = usePathname()

  const navItems = [
    {
      icon: <Home size={22} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <Gamepad2 size={22} />,
      label: "Mini Games",
      href: "/breakthrough-game",
    },
    {
      icon: <Calendar size={22} />,
      label: "Calendar",
      href: "/calendar",
    },
    {
      icon: <Plus size={22} />,
      label: "Habit Creation",
      href: "/habit-creation",
    },
    {
      icon: <Heart size={22} />,
      label: "Fitness",
      href: "/fitness",
    },
    {
      icon: <ShoppingBag size={22} />,
      label: "Shop",
      href: "/shop",
    },
    {
      icon: <Star size={22} />,
      label: "Review",
      href: "/review",
    },
  ]

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#0d1520] via-[#0e1c2e] to-[#0f2440] text-white flex flex-col">
      {/* Animated Background */}
      <ParticleBackground />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#0d1520]/70 pointer-events-none"></div>
      
      {/* Top Navigation Bar - Fixed positioning to ensure it stays at the very top */}
      <div className="fixed top-0 left-0 right-0 bg-[#0a1623]/95 backdrop-blur-md border-b border-[rgba(0,255,198,0.1)] z-50 h-16 flex items-center">
        <div className="container mx-auto flex items-center justify-between h-full px-4">
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
                <NavItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={isActive}
                />
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

      {/* Add padding to the top to compensate for fixed navbar */}
      <div className="pt-16 flex-1 overflow-y-auto">
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