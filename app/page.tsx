"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { motion } from "framer-motion"
import { CheckCircle, Star, Trophy, Calendar, GamepadIcon as GameController, Dumbbell } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { login, register, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [error, setError] = useState("")

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!loginData.email || !loginData.password) {
      setError("Please fill in all fields")
      return
    }

    try {
      const result = await login(loginData.email, loginData.password)

      if (!result.success) {
        setError(result.message || "Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred")
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const result = await register(registerData.username, registerData.email, registerData.password)

      if (!result.success) {
        setError(result.message || "Registration failed")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred")
    }
  }

  const features = [
    {
      title: "Track Daily Habits",
      description: "Build consistency with daily habit tracking and streaks",
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Earn XP & Level Up",
      description: "Gain experience points and level up as you complete tasks",
      icon: Star,
      color: "bg-yellow-500",
    },
    {
      title: "Compete on Leaderboards",
      description: "Compare your progress with friends and other users",
      icon: Trophy,
      color: "bg-purple-500",
    },
    {
      title: "Play Mini-Games",
      description: "Have fun while earning extra XP with interactive mini-games",
      icon: GameController,
      color: "bg-red-500",
    },
    {
      title: "Calendar Integration",
      description: "Plan your habits and tasks with the built-in calendar",
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Fitness Tracking",
      description: "Track your workouts and fitness goals",
      icon: Dumbbell,
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0d1520] relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 150 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            initial={{ opacity: Math.random() * 0.5 + 0.3 }}
            animate={{
              opacity: [Math.random() * 0.5 + 0.3, Math.random() * 0.8 + 0.2, Math.random() * 0.5 + 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>

      {/* Animated planets */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-purple-700 to-indigo-900 opacity-20 blur-xl"
        animate={{
          x: [50, -50, 50],
          y: [20, -20, 20],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          top: "15%",
          left: "10%",
        }}
      />

      <motion.div
        className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 opacity-20 blur-xl"
        animate={{
          x: [-30, 30, -30],
          y: [-40, 40, -40],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          bottom: "20%",
          right: "15%",
        }}
      />

      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#4cc9f0] to-[#4361ee] flex items-center justify-center mb-4"
          >
            <span className="text-3xl font-bold text-white">HQ</span>
          </motion.div>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            HabitQuest
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Transform your habits into an epic adventure. Track, level up, and conquer your goals.
          </motion.p>
        </header>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-[#1a2332] p-1">
                <TabsTrigger value="overview" className="px-6 py-2">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="login" className="px-6 py-2">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="px-6 py-2">
                  Register
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="bg-[#1a2332]/90 border-[#2a3343] h-full">
                      <CardHeader className="pb-2">
                        <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-12 text-center"
              >
                <Button
                  className="bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] hover:opacity-90 text-white font-medium px-8 py-3 text-lg rounded-lg shadow-lg"
                  onClick={() => setActiveTab("register")}
                >
                  Get Started Now
                </Button>
              </motion.div>
            </TabsContent>

            <TabsContent value="login">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md mx-auto"
              >
                <Card className="bg-[#1a2332]/90 border-[#2a3343] backdrop-blur-md shadow-xl">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl text-center text-white">Welcome Back</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                      Login to continue your habit journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500 text-white p-3 rounded-md mb-4 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className="bg-[#2a3343] border-[#3a4353] text-white h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-white">
                            Password
                          </Label>
                          <a href="#" className="text-sm text-[#4cc9f0] hover:underline">
                            Forgot password?
                          </a>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="bg-[#2a3343] border-[#3a4353] text-white h-11"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] hover:opacity-90 text-white font-medium"
                        disabled={loading}
                      >
                        {loading ? "Logging in..." : "Login"}
                      </Button>
                      <div className="text-center text-gray-400 text-sm">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("register")}
                          className="text-[#4cc9f0] hover:underline"
                        >
                          Register
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="register">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md mx-auto"
              >
                <Card className="bg-[#1a2332]/90 border-[#2a3343] backdrop-blur-md shadow-xl">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl text-center text-white">Create Account</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                      Start your habit journey today
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500 text-white p-3 rounded-md mb-4 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-white">
                          Username
                        </Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Choose a username"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                          className="bg-[#2a3343] border-[#3a4353] text-white h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-white">
                          Email
                        </Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="bg-[#2a3343] border-[#3a4353] text-white h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-white">
                          Password
                        </Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className="bg-[#2a3343] border-[#3a4353] text-white h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-white">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          className="bg-[#2a3343] border-[#3a4353] text-white h-11"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] hover:opacity-90 text-white font-medium"
                        disabled={loading}
                      >
                        {loading ? "Registering..." : "Create Account"}
                      </Button>
                      <div className="text-center text-gray-400 text-sm">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("login")}
                          className="text-[#4cc9f0] hover:underline"
                        >
                          Login
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
