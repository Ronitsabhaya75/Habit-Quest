"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "../components/ui/card"
import { 
  Sun, Moon, Rocket, Trophy, BarChart2, Users, 
  Award, Zap
} from "lucide-react"

// Define proper types
type StarProps = {
  id: number;
  size: number;
  x: number;
  y: number;
  opacity: number;
  delay: number;
  duration: number;
  twinkle: boolean;
}

type ParticleProps = {
  id: number;
  size: number;
  x: number;
  y: number;
  opacity: number;
}

type LeaderboardUser = {
  id: number;
  name: string;
  avatar: string;
  level: number;
  xp: number;
}

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(true)
  const [userCount, setUserCount] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Statics positioning instead of dynamic parallax
  const [scrolled, setScrolled] = useState(false)
  
  // Generate stars for the starfield (reduced count)
  const generateStars = (count: number): StarProps[] => {
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

  // Generate fewer particle
  const generateParticles = (count: number): ParticleProps[] => {
    const particles = []
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2 + 0.5
      const x = Math.random() * 100
      const y = Math.random() * 100
      const opacity = Math.random() * 0.3 + 0.1

      particles.push({
        id: i,
        size,
        x,
        y,
        opacity
      })
    }
    return particles
  }

  // Memoize static elements to prevent recalculations
  const stars = useMemo(() => generateStars(50), []) // Reduced count
  const particles = useMemo(() => generateParticles(15), []) // Reduced count
  
  // Leaderboard data - memoized
  const leaderboard = useMemo<LeaderboardUser[]>(() => [
    { id: 1, name: "CosmicAchiver", avatar: "🚀", level: 42, xp: 15240 },
    { id: 2, name: "HabitMaster", avatar: "🧙‍♂️", level: 38, xp: 12890 },
    { id: 3, name: "StarGazer", avatar: "🔭", level: 35, xp: 11450 },
    { id: 4, name: "NovaSurfer", avatar: "🏄‍♀️", level: 33, xp: 10120 },
  ], [])

  // Use requestAnimationFrame for smooth counting
  useEffect(() => {
    if (!isLoaded) return;
    
    let start = 0;
    const target = 10000;
    const duration = 2000; // ms
    let animationFrame: number;
    
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setUserCount(Math.floor(progress * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    
    animationFrame = requestAnimationFrame(step);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [isLoaded]);

  // Simple scroll detection with passive listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    setIsLoaded(true);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Button click handler for onboarding
  const handleStartJourney = () => {
    setShowOnboarding(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background - using CSS transitions for smoothness */}
      <div
        className={`fixed inset-0 w-full h-full transition-colors duration-800 ${
          darkMode
            ? "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]"
            : "bg-gradient-to-br from-[#1a2980] to-[#26d0ce]"
        }`}
      >
        {/* Starfield - reduced elements */}
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

        {/* Floating particles - reduced count */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-[#00ffcc] animate-float"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                top: `${particle.y}%`,
                left: `${particle.x}%`,
                opacity: particle.opacity,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient overlay - static positioning */}
        <div
          className={`absolute inset-0 transition-colors duration-800 ${
            darkMode
              ? "bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,204,0.15)_0%,transparent_70%),radial-gradient(circle_at_80%_70%,rgba(255,215,0,0.1)_0%,transparent_60%)]"
              : "bg-[radial-gradient(circle_at_30%_50%,rgba(114,137,218,0.15)_0%,transparent_70%),radial-gradient(circle_at_70%_70%,rgba(90,128,244,0.1)_0%,transparent_60%)]"
          }`}
        />

        {/* Key visual elements - static positioning */}
        <div className="absolute top-[5%] left-[7%] w-[30px] h-[30px] rounded-full bg-white/90 shadow-lg">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">★</span>
        </div>
        
        {/* Planet */}
        <div
          className={`absolute top-[20%] right-[25%] w-[80px] h-[80px] rounded-full 
          bg-gradient-to-br from-[#ff4757] to-[#ff6b81] 
          shadow-[0_0_20px_rgba(255,255,255,0.3),inset_5px_-5px_15px_rgba(0,0,0,0.4)] z-10
          transition-transform duration-700 ease-out ${scrolled ? 'translate-y-6' : ''}`}
        >
          <div className="absolute w-[110%] h-[20px] bg-white/10 rounded-full top-1/2 left-[-5%] -translate-y-1/2 rotate-[30deg] shadow-[0_0_10px_rgba(255,255,255,0.2)] opacity-70"></div>

          {/* Moon */}
          <div 
            className="absolute w-[20px] h-[20px] rounded-full bg-gradient-to-br from-[#ddd] to-white shadow-lg" 
            style={{ 
              animation: "orbit 8s linear infinite",
            }}
          ></div>
        </div>

        {/* Rocket - simplified */}
        <div 
          className={`absolute top-[30%] left-[15%] z-20 text-4xl transition-transform duration-700 ease-out
          ${scrolled ? 'translate-y-6' : ''}`}
        >
          🚀
        </div>

        {/* Trophy */}
        <div
          className={`absolute top-[15%] right-[15%] w-[60px] h-[60px] rounded-full 
          bg-[radial-gradient(circle,rgba(0,255,204,0.2)_0%,rgba(0,255,204,0)_70%)] 
          border-2 border-[rgba(0,255,204,0.3)] shadow-lg z-10 transition-transform duration-700 ease-out
          ${scrolled ? 'translate-y-4' : ''}`}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
            🏆
          </div>
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
                ? "bg-black shadow-[0_0_15px_rgba(0,255,204,0.6)]"
                : "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            } hover:scale-110 hover:translate-y-[-2px]`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="text-[#00ffcc] h-5 w-5" /> : <Moon className="text-gray-800 h-5 w-5" />}
          </button>

          {/* Home button */}
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg flex items-center font-semibold transition-all duration-300 ${
              darkMode
                ? "bg-[rgba(0,255,204,0.2)] text-[#00ffcc] border border-[rgba(0,255,204,0.5)] shadow-lg"
                : "bg-[#4cc9f0] text-white shadow-md"
            } hover:translate-y-[-3px]`}
          >
            <span className="mr-1">🏠</span> Home
          </Link>

          {/* Login button */}
          <Link
            href="/login"
            className={`px-4 py-2 rounded-lg flex items-center font-semibold transition-all duration-300 ${
              darkMode
                ? "bg-[rgba(0,255,204,0.2)] text-[#00ffcc] border border-[rgba(0,255,204,0.5)] shadow-lg"
                : "bg-[#4cc9f0] text-white shadow-md"
            } hover:translate-y-[-3px]`}
          >
            <span className="mr-1">🔑</span> Login
          </Link>
        </div>

        {/* Hero section */}
        <div className="text-center py-16 max-w-3xl mx-auto opacity-0 animate-fade-in">
          <h1
            className={`text-6xl font-bold mb-6 leading-tight transition-all duration-800 ${
              darkMode
                ? "text-white drop-shadow-[0_0_15px_rgba(0,255,204,0.7)]"
                : "text-gray-800 drop-shadow-md"
            }`}
          >
            Level Up <span className="text-[#00ffcc]">Your Life</span>
          </h1>
          <p
            className={`text-xl mb-8 opacity-90 leading-relaxed transition-colors duration-800 ${
              darkMode ? "text-[#d0d0d0]" : "text-gray-700"
            }`}
          >
            Transform your daily habits into an epic journey of self-improvement. Track progress, earn rewards, and
            breakthrough your limitations!
          </p>
          
          {/* CTA Button */}
          <button
            onClick={handleStartJourney}
            className={`inline-flex items-center px-8 py-4 rounded-full text-lg font-bold transition-all duration-500 ${
              darkMode
                ? "bg-[#00ffcc] text-black shadow-lg"
                : "bg-[#4cc9f0] text-white shadow-md"
            } hover:scale-105 hover:translate-y-[-3px]`}
          >
            <span className="relative z-10">Begin Your Journey</span>
            <Rocket className="ml-2 h-5 w-5" />
          </button>
          
          <p
            className={`text-sm mt-2 opacity-80 italic transition-colors duration-800 ${
              darkMode ? "text-[#b0b0b0]" : "text-gray-600"
            }`}
          >
            Start building habits today and level up your life!
          </p>
        </div>

        {/* Stats section */}
        <div
          className={`max-w-2xl mx-auto mb-16 rounded-xl p-8 backdrop-blur-md border transition-all duration-300 ${
            darkMode
              ? "bg-[rgba(17,24,39,0.3)] border-[rgba(0,255,204,0.2)] shadow-lg"
              : "bg-white/10 border-white/20 shadow-md"
          } hover:translate-y-[-5px] text-center z-10 opacity-0 animate-fade-in-delay`}
        >
          <h3
            className={`text-2xl font-bold mb-4 transition-all duration-800 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Join Our Community of Achievers
          </h3>
          <div
            className={`text-5xl font-bold my-4 relative transition-all duration-800 ${
              darkMode
                ? "text-[#ffd700]"
                : "text-[#4cc9f0]"
            }`}
          >
            {userCount.toLocaleString()}+
          </div>
          <p className={`opacity-90 transition-colors duration-800 ${darkMode ? "text-[#d0d0d0]" : "text-gray-700"}`}>
            users already leveling up daily!
          </p>

          {/* Progress bar */}
          <div className="w-full h-3 bg-gray-500/20 rounded-full overflow-hidden my-6 relative">
            <div 
              className="h-full bg-gradient-to-r from-[#00ffcc] to-[#ffd700] rounded-full animate-progress-load"
            />
          </div>

          <p className={`opacity-90 transition-colors duration-800 ${darkMode ? "text-[#d0d0d0]" : "text-gray-700"}`}>
            Daily active users growing{" "}
            <span className={`font-bold ${darkMode ? "text-[#00ffcc]" : "text-[#4cc9f0]"}`}>
              15%
            </span> month over month
          </p>
        </div>

        {/* Features grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto z-10 mb-16 opacity-0 animate-fade-in-delay-2"
        >
          {/* Feature 1 */}
          <Card
            className={`transition-all duration-300 ${
              darkMode ? "bg-[rgba(17,24,39,0.25)] border-[rgba(0,255,204,0.2)]" : "bg-white/10 border-white/20"
            } backdrop-blur-md overflow-hidden hover:translate-y-[-10px]`}
          >
            <CardContent className="p-8 text-center">
              <div className="mx-auto text-4xl mb-4">
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
            className={`transition-all duration-300 ${
              darkMode ? "bg-[rgba(17,24,39,0.25)] border-[rgba(0,255,204,0.2)]" : "bg-white/10 border-white/20"
            } backdrop-blur-md overflow-hidden hover:translate-y-[-10px]`}
          >
            <CardContent className="p-8 text-center">
              <div className="flex justify-center text-4xl mb-4">
                <BarChart2 className="h-10 w-10" />
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
            className={`transition-all duration-300 ${
              darkMode ? "bg-[rgba(17,24,39,0.25)] border-[rgba(0,255,204,0.2)]" : "bg-white/10 border-white/20"
            } backdrop-blur-md overflow-hidden hover:translate-y-[-10px]`}
          >
            <CardContent className="p-8 text-center">
              <div className="flex justify-center text-4xl mb-4">
                <Trophy className="h-10 w-10" />
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
            className={`transition-all duration-300 ${
              darkMode ? "bg-[rgba(17,24,39,0.25)] border-[rgba(0,255,204,0.2)]" : "bg-white/10 border-white/20"
            } backdrop-blur-md overflow-hidden hover:translate-y-[-10px]`}
          >
            <CardContent className="p-8 text-center">
              <div className="flex justify-center text-4xl mb-4">
                <Users className="h-10 w-10" />
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
        </div>

        {/* Optimized Leaderboard Preview */}
        <div className="max-w-4xl mx-auto mb-16 z-10 opacity-0 animate-fade-in-delay-3">
          <h2 className={`text-3xl font-bold text-center mb-8 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}>
            Leaderboard Preview
          </h2>
          
          <div className={`rounded-xl overflow-hidden backdrop-blur-md border ${
            darkMode
              ? "bg-[rgba(17,24,39,0.3)] border-[rgba(0,255,204,0.2)] shadow-lg"
              : "bg-white/10 border-white/20 shadow-md"
          }`}>
            <div className={`p-4 ${
              darkMode
                ? "bg-[rgba(0,255,204,0.1)]"
                : "bg-[rgba(76,201,240,0.1)]"
            }`}>
              <h3 className={`text-xl font-bold ${
                darkMode ? "text-[#00ffcc]" : "text-gray-800"
              }`}>
                Top Achievers This Week
              </h3>
            </div>
            
            <div className="divide-y divide-gray-700/20">
              {leaderboard.map((user, index) => (
                <div 
                  key={user.id}
                  className={`flex items-center p-4 transition-all duration-300 ${
                    index === 0 ? "bg-[rgba(255,215,0,0.05)]" : ""
                  } hover:bg-${darkMode ? "[rgba(0,255,204,0.05)]" : "[rgba(76,201,240,0.05)]"} hover:translate-x-1`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 font-bold ${
                    index === 0
                      ? "bg-[rgba(255,215,0,0.2)] text-[#ffd700]"
                      : index === 1
                        ? "bg-[rgba(192,192,192,0.2)] text-[#c0c0c0]"
                        : index === 2
                          ? "bg-[rgba(205,127,50,0.2)] text-[#cd7f32]"
                          : "bg-gray-500/20 text-gray-400"
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="text-2xl mr-3">{user.avatar}</div>
                  
                  <div className="flex-1">
                    <h4 className={`font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}>
                      {user.name}
                    </h4>
                    <div className="flex items-center">
                      <span className={`text-sm ${
                        darkMode ? "text-[#b0b0b0]" : "text-gray-600"
                      }`}>
                        Level {user.level}
                      </span>
                      <div className="h-1.5 w-16 bg-gray-700/20 rounded-full mx-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#00ffcc] to-[#ffd700]"
                          style={{ width: `${(user.level / 50) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center ${
                    darkMode ? "text-[#ffd700]" : "text-[#4cc9f0]"
                  }`}>
                    <Award className="h-4 w-4 mr-1" />
                    <span className="font-bold">{user.xp.toLocaleString()}</span>
                    <span className="text-xs ml-1">XP</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 text-center">
              <Link 
                href="/leaderboard"
                className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold transition-all ${
                  darkMode
                    ? "bg-[rgba(0,255,204,0.2)] text-[#00ffcc] border border-[rgba(0,255,204,0.3)] hover:bg-[rgba(0,255,204,0.3)]"
                    : "bg-[#4cc9f0] text-white hover:bg-[#3db8df]"
                } hover:translate-y-[-2px]`}
              >
                View Full Leaderboard
                <Zap className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowOnboarding(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`max-w-md w-full rounded-xl p-6 ${
              darkMode
                ? "bg-[#111827] border border-[rgba(0,255,204,0.3)] shadow-lg"
                : "bg-white border border-gray-200 shadow-xl"
            }`}
          >
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${
                darkMode ? "text-[#00ffcc]" : "text-gray-800"
              }`}>
                Begin Your Journey
              </h2>
              <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                Complete these steps to start leveling up your life:
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              {[
                { icon: "👤", title: "Create your profile", desc: "Customize your avatar and set your goals" },
                { icon: "🎯", title: "Set your first habit", desc: "Start small with something achievable" },
                { icon: "🏆", title: "Earn your first badge", desc: "Complete your habit for 3 days in a row" }
              ].map((step, index) => (
                <div 
                  key={index}
                  className={`flex p-3 rounded-lg ${
                    darkMode 
                      ? "bg-[rgba(0,255,204,0.05)] border border-[rgba(0,255,204,0.2)]"
                      : "bg-blue-50 border border-blue-100"
                  }`}
                >
                  <div className="text-2xl mr-3">{step.icon}</div>
                  <div>
                    <h3 className={`font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowOnboarding(false)}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  darkMode
                    ? "bg-transparent border border-[rgba(0,255,204,0.3)] text-[#00ffcc] hover:bg-[rgba(0,255,204,0.1)]"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                Later
              </button>
              <Link
                href="/register"
                className={`flex-1 py-2 rounded-lg font-medium text-center transition-all ${
                  darkMode
                    ? "bg-[#00ffcc] text-black hover:bg-[#00e6b8]"
                    : "bg-[#4cc9f0] text-white hover:bg-[#3db8df]"
                }`}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CSS for optimized animations */}
      <style jsx global>{`
        /* Fixed TypeScript errors by using standard Tailwind classes */
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(40px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
        }
        
        /* CSS only animations for better performance */
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s forwards;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s forwards;
        }
        
        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.6s forwards;
        }
        
        @keyframes progress-load {
          0% { width: 0%; }
          100% { width: 75%; }
        }
        
        .animate-progress-load {
          animation: progress-load 1.5s ease-out 0.5s forwards;
        }
      `}</style>
    </div>
  )
}