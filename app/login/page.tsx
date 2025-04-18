"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Home, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Generate background elements
  const generateStars = (count: number) => {
    const stars = []
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 3 + 1
      const top = Math.random() * 100
      const left = Math.random() * 100
      const opacity = Math.random() * 0.7 + 0.3
      const duration = Math.random() * 10 + 5
      const delay = Math.random() * 10
      const glow = Math.random() > 0.8 ? 3 : 1

      stars.push({
        id: i,
        size,
        top,
        left,
        opacity,
        duration,
        delay,
        glow,
      })
    }
    return stars
  }

  const generatePlanets = (count: number) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-800",
      "bg-gradient-to-br from-orange-500 to-red-800",
      "bg-gradient-to-br from-purple-500 to-purple-900",
      "bg-gradient-to-br from-teal-400 to-teal-700",
    ]

    const planets = []
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 30 + 20
      const top = Math.random() * 80 + 10
      const left = Math.random() * 80 + 10
      const color = colors[Math.floor(Math.random() * colors.length)]
      const glow = Math.random() * 10 + 5
      const duration = Math.random() * 30 + 20
      const delay = Math.random() * 10

      planets.push({
        id: i,
        size,
        top,
        left,
        color,
        glow,
        duration,
        delay,
      })
    }
    return planets
  }

  const stars = generateStars(100)
  const planets = generatePlanets(3)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Simulate login API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, let's just redirect to dashboard
      // In a real app, you would validate credentials with your backend
      router.push("/dashboard")
    } catch (error) {
      setError("Failed to login. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background with stars and planets */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] z-0">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,95,137,0.5)_0%,transparent_40%),radial-gradient(circle_at_80%_70%,rgba(60,100,190,0.5)_0%,transparent_40%)]"></div>

        {/* Stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              boxShadow: `0 0 ${star.glow}px #B8FFF9`,
            }}
          />
        ))}

        {/* Planets */}
        {planets.map((planet) => (
          <div
            key={planet.id}
            className={`absolute rounded-full animate-float ${planet.color}`}
            style={{
              width: `${planet.size}px`,
              height: `${planet.size}px`,
              top: `${planet.top}%`,
              left: `${planet.left}%`,
              boxShadow: `0 0 ${planet.glow}px rgba(0, 255, 198, 0.5)`,
              animationDuration: `${planet.duration}s`,
              animationDelay: `${planet.delay}s`,
            }}
          >
            <div className="absolute inset-0 rounded-full shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.5),inset_5px_5px_10px_rgba(255,255,255,0.3)]"></div>
          </div>
        ))}

        {/* Rocket */}
        <div
          className="absolute w-[30px] h-[50px] animate-float"
          style={{
            top: "30%",
            left: "20%",
            animationDuration: "15s",
          }}
        >
          <div className="text-4xl">🚀</div>
        </div>
      </div>

      {/* Back to home button */}
      <Link
        href="/"
        className="absolute top-8 left-8 px-4 py-2 rounded-full bg-[rgba(21,38,66,0.8)] border border-[rgba(0,255,198,0.3)] text-[#B8FFF9] flex items-center gap-2 backdrop-blur-md transition-all duration-300 hover:bg-[rgba(21,38,66,0.9)] hover:-translate-y-1 hover:shadow-lg z-50"
      >
        <Home className="h-4 w-4" /> Back to Home
      </Link>

      {/* Login form */}
      <motion.div
        className="z-10 w-full max-w-md px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-[rgba(21,38,66,0.8)] backdrop-blur-md border-[rgba(0,255,198,0.3)] shadow-xl relative overflow-hidden">
          {/* Card shimmer effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform skew-x-[-25deg] animate-shimmer"></div>
          </div>

          <CardContent className="p-10">
            <h2 className="text-3xl font-bold text-center text-[#B8FFF9] mb-1 drop-shadow-[0_0_10px_rgba(0,255,245,0.5)]">
              Welcome Back
            </h2>
            <p className="text-[#B8FFF9] text-center opacity-80 mb-8">Continue your cosmic journey</p>

            {error && (
              <div className="p-3 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div
                  className={`absolute right-4 top-3 transition-colors duration-300 ${
                    emailFocused ? "text-[#00FFF5]" : "text-[#B8FFF9]"
                  }`}
                >
                  <Mail className="h-5 w-5" />
                </div>
                <div
                  className={`absolute left-4 -top-3 px-2 text-sm transition-all duration-300 z-10 ${
                    emailFocused || email ? "text-[#00FFF5] bg-[rgba(21,38,66,0.8)]" : "text-[#B8FFF9] bg-transparent"
                  } ${emailFocused || email ? "opacity-100" : "opacity-80"} ${
                    emailFocused || email ? "translate-y-0" : "translate-y-6"
                  }`}
                >
                  Email
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`pl-4 pr-12 py-3 bg-white/5 border ${
                    emailFocused ? "border-[#00FFF5]" : "border-[rgba(0,255,198,0.3)]"
                  } rounded-lg text-[#B8FFF9] transition-all duration-300 focus:shadow-[0_0_8px_rgba(0,255,198,0.6)] focus:outline-none`}
                  required
                />
              </div>

              <div className="relative">
                <div
                  className={`absolute right-4 top-3 transition-colors duration-300 ${
                    passwordFocused ? "text-[#00FFF5]" : "text-[#B8FFF9]"
                  }`}
                >
                  <Lock className="h-5 w-5" />
                </div>
                <div
                  className={`absolute left-4 -top-3 px-2 text-sm transition-all duration-300 z-10 ${
                    passwordFocused || password
                      ? "text-[#00FFF5] bg-[rgba(21,38,66,0.8)]"
                      : "text-[#B8FFF9] bg-transparent"
                  } ${passwordFocused || password ? "opacity-100" : "opacity-80"} ${
                    passwordFocused || password ? "translate-y-0" : "translate-y-6"
                  }`}
                >
                  Password
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`pl-4 pr-12 py-3 bg-white/5 border ${
                    passwordFocused ? "border-[#00FFF5]" : "border-[rgba(0,255,198,0.3)]"
                  } rounded-lg text-[#B8FFF9] transition-all duration-300 focus:shadow-[0_0_8px_rgba(0,255,198,0.6)] focus:outline-none`}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#00FFC6] to-[#4A90E2] text-[#152642] font-semibold rounded-lg relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,255,198,0.4)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10">{loading ? "Logging in..." : "Login"}</span>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-white/20 via-white/40 to-white/20 animate-pulse-glow"></div>
                </div>
              </Button>

              {loading && (
                <div className="w-full h-1 bg-[rgba(0,255,198,0.2)] rounded overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00FFC6] to-[#4A90E2] animate-progress"></div>
                </div>
              )}

              <p className="text-center text-[#B8FFF9] text-sm mt-6">
                New to the cosmos?{" "}
                <Link href="/register" className="text-[#00FFF5] hover:underline font-medium">
                  Create Account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
