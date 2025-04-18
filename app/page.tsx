"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Sun, Moon, Rocket, Trophy, BarChart2, Users } from "lucide-react"

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const router = useRouter()
  const parallaxRef = useRef<HTMLDivElement>(null)

  // Generate stars for the starfield
  const generateStars = (count: number) => {
    const stars = []
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 3 + 1
      const x = Math.random() * 100
      const y = Math.random() * 100
      const opacity = Math.random() * 0.5 + 0.3
      const delay = Math.random() * 5
      const duration = Math.random() * 3 + 2
      const twinkle = Math.random() > 0.7

      stars.push({
        id: i,
        size,
        x,
        y,
        opacity,
        delay,
        duration,
        twinkle,
      })
    }
    return stars
  }

  // Memoize stars for better performance
  const stars = useMemo(() => generateStars(100), [])

  // User count animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prevCount) => {
        if (prevCount < 10000) {
          return prevCount + Math.floor(Math.random() * 500)
        } else {
          clearInterval(interval)
          return 10000
        }
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Scroll handler for parallax effect
  useEffect(() => {
    let lastScrollTime = 0
    const scrollThreshold = 16 // ~60fps

    const handleScroll = () => {
      const now = performance.now()
      if (now - lastScrollTime >= scrollThreshold) {
        setScrollY(window.scrollY)
        lastScrollTime = now
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with stars */}
      <div
        className={`fixed inset-0 w-full h-full transition-colors duration-800 ${
          darkMode
            ? "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]"
            : "bg-gradient-to-br from-[#1a2980] to-[#26d0ce]"
        }`}
      >
        {/* Starfield */}
        <div className={`absolute inset-0 transition-opacity duration-800 ${darkMode ? "opacity-100" : "opacity-50"}`}>
          {stars.map((star) => (
            <div
              key={star.id}
              className={`absolute rounded-full bg-white ${star.twinkle ? "animate-twinkle" : "animate-glow"}`}
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                top: `${star.y}%`,
                left: `${star.x}%`,
                opacity: star.opacity,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
                boxShadow: `0 0 ${star.size}px rgba(255, 255, 255, 0.8)`,
              }}
            />
          ))}
        </div>

        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 transition-colors duration-800 ${
            darkMode
              ? "bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,204,0.15)_0%,transparent_70%),radial-gradient(circle_at_80%_70%,rgba(255,215,0,0.1)_0%,transparent_60%)]"
              : "bg-[radial-gradient(circle_at_30%_50%,rgba(114,137,218,0.15)_0%,transparent_70%),radial-gradient(circle_at_70%_70%,rgba(90,128,244,0.1)_0%,transparent_60%)]"
          }`}
        />

        {/* Parallax elements */}
        <div ref={parallaxRef} className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
          {/* Large stars */}
          <div className="absolute top-[5%] left-[7%] w-[30px] h-[30px] rounded-full bg-white/90 animate-blink-slow shadow-[0_0_20px_rgba(255,255,255,0.5),0_0_30px_rgba(255,255,255,0.3)]">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">★</span>
          </div>
          <div className="absolute top-[12%] left-[25%] w-[20px] h-[20px] rounded-full bg-white/90 animate-glow shadow-[0_0_20px_rgba(255,255,255,0.5),0_0_30px_rgba(255,255,255,0.3)]">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">★</span>
          </div>
          <div className="absolute top-[8%] right-[15%] w-[25px] h-[25px] rounded-full bg-white/90 animate-blink shadow-[0_0_20px_rgba(255,255,255,0.5),0_0_30px_rgba(255,255,255,0.3)]">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl">★</span>
          </div>
        </div>

        {/* Planet */}
        <div
          className="absolute top-[20%] right-[25%] w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#ff4757] to-[#ff6b81] shadow-[0_0_20px_rgba(255,255,255,0.3),inset_5px_-5px_15px_rgba(0,0,0,0.4)] z-10"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        >
          <div className="absolute w-[110%] h-[20px] bg-white/10 rounded-full top-1/2 left-[-5%] -translate-y-1/2 rotate-[30deg] shadow-[0_0_10px_rgba(255,255,255,0.2)] opacity-70"></div>

          {/* Moon */}
          <div className="absolute w-[15px] h-[15px] rounded-full bg-gradient-to-br from-[#ddd] to-white shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-orbit"></div>
        </div>

        {/* Rocket */}
        <div className="absolute top-[30%] left-[15%] z-20" style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
          <div className="text-4xl animate-rocket-movement filter drop-shadow-[0_0_10px_rgba(255,165,0,0.7)]">🚀</div>
        </div>

        {/* Achievement badge */}
        <div
          className="absolute top-[15%] right-[15%] w-[60px] h-[60px] rounded-full bg-[radial-gradient(circle,rgba(0,255,204,0.2)_0%,rgba(0,255,204,0)_70%)] border-2 border-[rgba(0,255,204,0.3)] shadow-[0_0_15px_rgba(0,255,204,0.4),0_0_30px_rgba(0,255,204,0.2)] z-10 animate-pulse-glow"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
            🏆
          </div>
        </div>

        {/* Progress circle */}
        <div
          className="absolute bottom-[20%] right-[10%] w-[80px] h-[80px] flex items-center justify-center z-20"
          style={{ transform: `translateY(${scrollY * 0.02}px)` }}
        >
          <svg className="w-[80px] h-[80px] -rotate-90">
            <defs>
              <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ffcc" />
                <stop offset="50%" stopColor="#ffd700" />
                <stop offset="100%" stopColor="#00ffcc" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(0, 255, 204, 0.2)" strokeWidth="3" />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="url(#circleGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset="70"
              className="animate-rotate-circle filter drop-shadow-[0_0_5px_rgba(0,255,204,0.5)]"
            />
          </svg>
          <div className="absolute text-base font-bold text-[#00ffcc] drop-shadow-[0_0_5px_rgba(0,255,204,0.8)]">
            75%
          </div>
        </div>

        {/* XP Orbs */}
        <div
          className="absolute top-[65%] left-[15%] w-[15px] h-[15px] rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.8)_30%,rgba(255,215,0,0)_70%)] shadow-[0_0_10px_rgba(255,215,0,0.5)] animate-float opacity-70 z-10"
          style={{ transform: `translateY(${scrollY * 0.02}px)` }}
        >
          <div className="absolute inset-0 rounded-full border border-[rgba(255,215,0,0.3)] animate-pulse-glow filter blur-[1px]"></div>
        </div>
        <div
          className="absolute top-[30%] right-[35%] w-[15px] h-[15px] rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.8)_30%,rgba(255,215,0,0)_70%)] shadow-[0_0_10px_rgba(255,215,0,0.5)] animate-float-delay opacity-70 z-10"
          style={{ transform: `translateY(${scrollY * 0.02}px)` }}
        >
          <div className="absolute inset-0 rounded-full border border-[rgba(255,215,0,0.3)] animate-pulse-glow filter blur-[1px]"></div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`relative min-h-screen p-8 z-10 transition-colors duration-800 ${darkMode ? "text-[#e0e0e0]" : "text-gray-800"}`}
      >
        {/* Navigation */}
        <div className="absolute top-4 right-4 flex gap-4 z-50">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${
              darkMode
                ? "bg-black shadow-[0_0_10px_rgba(0,255,204,0.5),inset_0_0_5px_rgba(0,255,204,0.5)]"
                : "bg-white shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
            } hover:scale-110 hover:translate-y-[-2px] ${
              darkMode
                ? "hover:shadow-[0_0_20px_rgba(0,255,204,0.8),inset_0_0_10px_rgba(0,255,204,0.8)]"
                : "hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
            }`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="text-[#00ffcc] h-5 w-5" /> : <Moon className="text-gray-800 h-5 w-5" />}
          </button>

          {/* Home button */}
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg flex items-center font-semibold transition-all duration-300 ${
              darkMode
                ? "bg-[rgba(0,255,204,0.2)] text-[#00ffcc] border border-[rgba(0,255,204,0.5)] shadow-[0_0_10px_rgba(0,255,204,0.3)]"
                : "bg-[#4cc9f0] text-white shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
            } hover:translate-y-[-2px] ${
              darkMode
                ? "hover:bg-[rgba(0,255,204,0.3)] hover:shadow-[0_0_15px_rgba(0,255,204,0.5)]"
                : "hover:bg-[#3db8df] hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
            }`}
          >
            <span className="mr-1">🏠</span> Home
          </Link>

          {/* Login button */}
          <Link
            href="/login"
            className={`px-4 py-2 rounded-lg flex items-center font-semibold transition-all duration-300 ${
              darkMode
                ? "bg-[rgba(0,255,204,0.2)] text-[#00ffcc] border border-[rgba(0,255,204,0.5)] shadow-[0_0_10px_rgba(0,255,204,0.3)]"
                : "bg-[#4cc9f0] text-white shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
            } hover:translate-y-[-2px] ${
              darkMode
                ? "hover:bg-[rgba(0,255,204,0.3)] hover:shadow-[0_0_15px_rgba(0,255,204,0.5)]"
                : "hover:bg-[#3db8df] hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
            }`}
          >
            <span className="mr-1">🔑</span> Login
          </Link>
        </div>

        {/* Hero section */}
        <motion.div
          className="text-center py-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1
            className={`text-5xl font-bold mb-6 leading-tight transition-all duration-800 ${
              darkMode
                ? "text-white drop-shadow-[0_0_10px_rgba(0,255,204,0.5),0_0_20px_rgba(0,255,204,0.3)]"
                : "text-gray-800 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
            }`}
          >
            Level Up <span className="text-[#00ffcc] animate-neon-flicker">Your Life</span>
          </h1>
          <p
            className={`text-xl mb-8 opacity-90 leading-relaxed transition-colors duration-800 ${
              darkMode ? "text-[#d0d0d0]" : "text-gray-700"
            }`}
          >
            Transform your daily habits into an epic journey of self-improvement. Track progress, earn rewards, and
            breakthrough your limitations!
          </p>
          <Link
            href="/register"
            className={`inline-flex items-center px-8 py-4 rounded-full text-lg font-bold animate-cta-pulse transition-all duration-300 ${
              darkMode
                ? "bg-[#00ffcc] text-black shadow-[0_0_15px_#00ffcc,0_0_30px_rgba(0,255,204,0.5)]"
                : "bg-[#4cc9f0] text-white shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
            } hover:scale-105 hover:translate-y-[-3px] ${
              darkMode
                ? "hover:shadow-[0_6px_15px_rgba(0,0,0,0.25),0_0_20px_rgba(0,255,204,0.6)]"
                : "hover:shadow-[0_6px_15px_rgba(0,0,0,0.25)]"
            } overflow-hidden relative`}
          >
            <span className="relative z-10">Begin Your Journey</span>
            <Rocket className="ml-2 h-5 w-5 animate-icon-glow" />
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-full"></div>
          </Link>
          <p
            className={`text-sm mt-2 opacity-80 italic transition-colors duration-800 ${
              darkMode ? "text-[#b0b0b0]" : "text-gray-600"
            }`}
          >
            Start building habits today and level up your life!
          </p>
        </motion.div>

        {/* Stats section */}
        <motion.div
          className={`max-w-2xl mx-auto mb-16 rounded-xl p-8 backdrop-blur-md border transition-all duration-300 ${
            darkMode
              ? "bg-[rgba(17,24,39,0.3)] border-[rgba(0,255,204,0.2)] shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              : "bg-white/10 border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
          } hover:translate-y-[-5px] ${
            darkMode
              ? "hover:shadow-[0_15px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(0,255,204,0.3)]"
              : "hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)]"
          } text-center z-10`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <h3
            className={`text-2xl font-bold mb-4 transition-all duration-800 ${
              darkMode ? "text-white drop-shadow-[0_0_10px_rgba(0,255,204,0.5)]" : "text-gray-800"
            }`}
          >
            Join Our Community of Achievers
          </h3>
          <div
            className={`text-4xl font-bold my-4 relative transition-all duration-800 ${
              darkMode
                ? "text-[#ffd700] drop-shadow-[0_0_10px_rgba(255,215,0,0.8),0_0_20px_rgba(255,215,0,0.4)]"
                : "text-[#4cc9f0]"
            }`}
          >
            {userCount.toLocaleString()}+
          </div>
          <p className={`opacity-90 transition-colors duration-800 ${darkMode ? "text-[#d0d0d0]" : "text-gray-700"}`}>
            users already leveling up daily!
          </p>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-gray-500/20 rounded-full overflow-hidden my-6 relative">
            <div className="w-3/4 h-full bg-gradient-to-r from-[#00ffcc] via-[#ffd700] to-[#00ffcc] rounded-full animate-glow-bar shadow-[0_0_10px_rgba(0,255,204,0.5)]"></div>
          </div>

          <p className={`opacity-90 transition-colors duration-800 ${darkMode ? "text-[#d0d0d0]" : "text-gray-700"}`}>
            Daily active users growing{" "}
            <span className={darkMode ? "text-[#00ffcc] font-bold" : "text-[#4cc9f0] font-bold"}>15%</span> month over
            month
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Feature 1 */}
          <Card
            className={`transition-all duration-300 transform-gpu perspective-1000 ${
              darkMode ? "bg-[rgba(17,24,39,0.25)] border-[rgba(0,255,204,0.2)]" : "bg-white/10 border-white/20"
            } backdrop-blur-md overflow-hidden hover:translate-y-[-10px] hover:scale-[1.02] hover:rotate-x-5 hover:-rotate-y-5 ${
              darkMode
                ? "hover:shadow-[0_15px_30px_rgba(0,0,0,0.3),0_0_15px_rgba(0,255,204,0.5)]"
                : "hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
            }`}
          >
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4 transition-transform duration-500 hover:scale-[1.3] hover:rotate-5 filter drop-shadow-[0_0_3px_rgba(0,255,204,0.3)] hover:animate-icon-glow">
                🎮
              </div>
              <h3
                className={`text-xl font-bold my-4 transition-colors duration-800 ${
                  darkMode ? "text-[#00ffcc]" : "text-gray-800"
                }`}
              >
                Breakthrough Game
              </h3>
              <p
                className={`opacity-90 leading-relaxed transition-colors duration-800 ${
                  darkMode ? "text-[#d0d0d0]" : "text-gray-700"
                }`}
              >
                Turn your habit-building journey into an engaging game. Complete challenges, earn points, and unlock
                achievements.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card
            className={`transition-all duration-300 transform-gpu perspective-1000 ${
              darkMode ? "bg-[rgba(17,24,39,0.25)] border-[rgba(0,255,204,0.2)]" : "bg-white/10 border-white/20"
            } backdrop-blur-md overflow-hidden hover:translate-y-[-10px] hover:scale-[1.02] hover:rotate-x-5 hover:-rotate-y-5 ${
              darkMode
                ? "hover:shadow-[0_15px_30px_rgba(0,0,0,0.3),0_0_15px_rgba(0,255,204,0.5)]"
                : "hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
            }`}
          >
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4 transition-transform duration-500 hover:scale-[1.3] hover:rotate-5 filter drop-shadow-[0_0_3px_rgba(0,255,204,0.3)] hover:animate-icon-glow">
                <BarChart2 className="mx-auto h-10 w-10" />
              </div>
              <h3
                className={`text-xl font-bold my-4 transition-colors duration-800 ${
                  darkMode ? "text-[#00ffcc]" : "text-gray-800"
                }`}
              >
                Track Progress
              </h3>
              <p
                className={`opacity-90 leading-relaxed transition-colors duration-800 ${
                  darkMode ? "text-[#d0d0d0]" : "text-gray-700"
                }`}
              >
                Monitor your habits with beautiful visualizations and detailed statistics to stay motivated.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card
            className={`transition-all duration-300 transform-gpu perspective-1000 ${
              darkMode ? "bg-[rgba(17,24,39,0.25)] border-[rgba(0,255,204,0.2)]" : "bg-white/10 border-white/20"
            } backdrop-blur-md overflow-hidden hover:translate-y-[-10px] hover:scale-[1.02] hover:rotate-x-5 hover:-rotate-y-5 ${
              darkMode
                ? "hover:shadow-[0_15px_30px_rgba(0,0,0,0.3),0_0_15px_rgba(0,255,204,0.5)]"
                : "hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
            }`}
          >
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4 transition-transform duration-500 hover:scale-[1.3] hover:rotate-5 filter drop-shadow-[0_0_3px_rgba(0,255,204,0.3)] hover:animate-icon-glow">
                <Trophy className="mx-auto h-10 w-10" />
              </div>
              <h3
                className={`text-xl font-bold my-4 transition-colors duration-800 ${
                  darkMode ? "text-[#00ffcc]" : "text-gray-800"
                }`}
              >
                Earn Rewards
              </h3>
              <p
                className={`opacity-90 leading-relaxed transition-colors duration-800 ${
                  darkMode ? "text-[#d0d0d0]" : "text-gray-700"
                }`}
              >
                Level up and unlock real achievements as you build better habits and transform your life.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card
            className={`transition-all duration-300 transform-gpu perspective-1000 ${
              darkMode ? "bg-[rgba(17,24,39,0.25)] border-[rgba(0,255,204,0.2)]" : "bg-white/10 border-white/20"
            } backdrop-blur-md overflow-hidden hover:translate-y-[-10px] hover:scale-[1.02] hover:rotate-x-5 hover:-rotate-y-5 ${
              darkMode
                ? "hover:shadow-[0_15px_30px_rgba(0,0,0,0.3),0_0_15px_rgba(0,255,204,0.5)]"
                : "hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
            }`}
          >
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4 transition-transform duration-500 hover:scale-[1.3] hover:rotate-5 filter drop-shadow-[0_0_3px_rgba(0,255,204,0.3)] hover:animate-icon-glow">
                <Users className="mx-auto h-10 w-10" />
              </div>
              <h3
                className={`text-xl font-bold my-4 transition-colors duration-800 ${
                  darkMode ? "text-[#00ffcc]" : "text-gray-800"
                }`}
              >
                Community
              </h3>
              <p
                className={`opacity-90 leading-relaxed transition-colors duration-800 ${
                  darkMode ? "text-[#d0d0d0]" : "text-gray-700"
                }`}
              >
                Join a supportive community of people on their own transformation journeys. Share tips and celebrate
                wins!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
