"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useAuth } from "@/context/auth-context"
import { LogOut, Search, RefreshCw } from "lucide-react"
import AIChat from "@/components/ai-chat"

export default function Dashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState("")
  const [showInput, setShowInput] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [chartType, setChartType] = useState("line")
  const [streak, setStreak] = useState(7)
  const [totalXP, setTotalXP] = useState(350)
  const [tasks, setTasks] = useState([])
  const [notifications, setNotifications] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [timeAllocation, setTimeAllocation] = useState("")
  const [activeSection, setActiveSection] = useState("dashboard")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const inputRef = useRef(null)

  // Calculate derived values from totalXP
  const currentLevel = Math.floor(totalXP / 100) + 1
  const levelProgress = totalXP % 100
  const streakPercentage = Math.min((streak / 14) * 100, 100)

  // Add notification with animation and auto-dismissal
  const addNotification = useCallback((message, actions = []) => {
    const newNotification = { id: Date.now(), message, actions }
    setNotifications((prev) => [...prev, newNotification])
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id)), 5000)
  }, [])

  // Enhanced achievements with more visual appeal
  const achievements = [
    { id: 1, title: "First Week Streak", description: "Completed 7 days of habits", earned: streak >= 7 },
    { id: 2, title: "Milestone 100 XP", description: "Reached 100 XP points", earned: totalXP >= 100 },
    { id: 3, title: "Habit Master", description: "Completed 3 habits consistently", earned: true },
    {
      id: 4,
      title: "Task Champion",
      description: "Completed 5 tasks in a day",
      earned: tasks.filter((t) => t.completed).length >= 5,
    },
    { id: 5, title: "Early Bird", description: "Complete tasks before 9am", earned: true },
    { id: 6, title: "Game Player", description: "Played mini-games", earned: true },
    { id: 7, title: "Badge Collector", description: "Purchased badges from shop", earned: false },
    {
      id: 8,
      title: "Perfect Week",
      description: "Complete all scheduled tasks for 7 days",
      earned: streak >= 7 && totalXP > 300,
    },
    { id: 9, title: "Fitness Enthusiast", description: "Track fitness activities", earned: false },
    { id: 10, title: "Productivity Master", description: "Reached level 5", earned: currentLevel >= 5 },
  ]

  const fetchUserProgress = useCallback(async () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 6)

      const data = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        return {
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          progress: Math.floor(Math.random() * 50) + i * 10, // Increasing trend
        }
      })

      setChartData(data)
      setLoading(false)
    }, 1000)
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    // Simulate API call
    setTimeout(() => {
      const data = [
        { name: user?.username || "You", xp: totalXP, isCurrentUser: true },
        { name: "CosmicHabitMaster", xp: 520 },
        { name: "StarGazer42", xp: 480 },
        { name: "GalaxyQuester", xp: 410 },
        { name: "NebulaNinja", xp: 380 },
      ]

      setLeaderboard(data.sort((a, b) => b.xp - a.xp))
    }, 800)
  }, [user, totalXP])

  // Handle task completion with notification
  const handleTaskCompletion = (taskId, completed) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          if (!task.completed && completed) {
            // Task is being completed
            const xpGain = 10
            setTotalXP((prev) => prev + xpGain)
            addNotification(`✅ Task "${task.title}" completed! (+${xpGain} XP)`, [
              { label: "Review", onClick: () => router.push("/review") },
            ])
          }
          return { ...task, completed }
        }
        return task
      }),
    )
  }

  const openTimeAllocationModal = (task) => setSelectedTask(task)

  const saveTimeAllocation = () => {
    if (!selectedTask || !timeAllocation) return

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === selectedTask.id) {
          return { ...task, estimatedTime: Number.parseInt(timeAllocation, 10) }
        }
        return task
      }),
    )

    addNotification(`⏱️ Time allocated for "${selectedTask.title}": ${timeAllocation} minutes`)
    setSelectedTask(null)
    setTimeAllocation("")
  }

  useEffect(() => {
    fetchLeaderboard()
    fetchUserProgress()

    // Initialize sample tasks
    setTasks([
      { id: 1, title: "Morning meditation", completed: true, isHabit: true },
      { id: 2, title: "Read for 30 minutes", completed: false, isHabit: true },
      { id: 3, title: "Complete project proposal", completed: false, isHabit: false },
      { id: 4, title: "Exercise", completed: false, isHabit: true, estimatedTime: 45 },
      { id: 5, title: "Plan tomorrow's tasks", completed: false, isHabit: false },
    ])
  }, [fetchLeaderboard, fetchUserProgress])

  // Use effect to focus input when shown
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])

  const addTask = () => setShowInput(true)

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && newTask.trim()) {
      setTasks((prevTasks) => [
        ...prevTasks,
        { id: Date.now(), title: newTask.trim(), completed: false, isHabit: false },
      ])
      setNewTask("")
      setShowInput(false)
      addNotification(`🌟 New task "${newTask.trim()}" added!`)
    }
  }

  const deleteTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId))
      addNotification(`Task "${task.title}" deleted`)
    }
  }

  const toggleEdit = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, isEditing: !task.isEditing }
        }
        return task
      }),
    )
  }

  const updateTaskTitle = (taskId, newTitle) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, title: newTitle }
        }
        return task
      }),
    )
  }

  const handleNavigation = (section) => {
    setActiveSection(section)
    if (section !== "dashboard") {
      router.push(`/${section}`)
    }
    setShowMobileMenu(false)
  }

  // Generate stars for the background
  const generateStars = (count) => {
    const stars = []
    for (let i = 0; i < count; i++) {
      stars.push({
        id: i,
        size: Math.random() * 3 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.7 + 0.3,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 10,
        glow: Math.random() > 0.8 ? 3 : 1,
      })
    }
    return stars
  }

  const stars = generateStars(100)

  // Handle task updates from AI Chat
  const handleTaskUpdateFromAI = (taskId, completed, type = "") => {
    if (type === "add") {
      // Add new task
      setTasks((prevTasks) => [...prevTasks, { id: taskId, title: completed.title, completed: false }])
      return
    }

    if (type === "remove") {
      // Remove task
      deleteTask(taskId)
      return
    }

    if (type === "edit") {
      // Edit task
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, title: completed.title || task.title }
          }
          return task
        }),
      )
      return
    }

    // Toggle completion
    handleTaskCompletion(taskId, completed)
  }

  // Add task with date from AI Chat
  const handleAddTaskWithDate = (date, task) => {
    const newTask = {
      ...task,
      id: Date.now(),
      completed: false,
    }

    setTasks((prevTasks) => [...prevTasks, newTask])

    addNotification(`🗓️ New task scheduled for ${date.toLocaleDateString()}: "${task.title}"`)
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]">
      {/* Animated Star Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-starFloat"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              boxShadow: `0 0 ${star.glow}px ${star.glow}px #E0F7FA`,
            }}
          />
        ))}
      </div>

      {/* Notification System */}
      <div className="fixed top-20 right-5 z-50 flex flex-col gap-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] rounded-xl p-4 text-white shadow-lg flex items-center justify-between animate-slideIn relative overflow-hidden"
          >
            <span className="font-medium mr-4">{notification.message}</span>
            <div className="flex gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="px-2 py-1 bg-white/20 rounded-md text-sm hover:bg-white/30 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
            {/* Progress bar for auto-dismiss */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/70 w-full animate-notificationTimer"></div>
          </div>
        ))}
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 left-0 w-full bg-[#0F2027]/85 backdrop-blur-md shadow-md z-40 h-[70px] flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center text-2xl font-bold text-[#E0F7FA] cursor-pointer hover:animate-logoAnimation">
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 z-10 max-w-7xl mx-auto w-full animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#E0F7FA]/10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#E0F7FA] text-shadow-sm mb-2">
              Welcome{user?.username ? `, ${user.username}` : ""}! <span className="text-[#40E0D0]">👋</span>
            </h1>
            <p className="text-[#B8F0F9]">
              You have {totalXP} XP total and a {streak}-day streak!
            </p>
          </div>
          <Button
            onClick={() => {
              logout()
              router.push("/login")
            }}
            className="bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] text-white border-none py-2 px-6 rounded-xl font-semibold shadow-md hover:-translate-y-1 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <LogOut className="h-4 w-4 rotate-180" />
            Logout
          </Button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Overview Card */}
          <Card
            className="bg-[#203A43]/75 border-[#40E0D0]/15 backdrop-blur-md shadow-lg hover:-translate-y-2 hover:border-[#40E0D0]/30 hover:shadow-xl transition-all lg:col-span-2 animate-fadeIn"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="text-[#E0F7FA] text-xl border-b border-[#E0F7FA]/10 pb-2 text-shadow-sm">
                Progress Overview
              </CardTitle>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartType === "line"
                      ? "bg-[#40E0D0]/20 text-[#E0F7FA] border border-[#40E0D0]/60"
                      : "bg-white/5 text-[#E0F7FA]/70 border border-white/10 hover:bg-[#40E0D0]/10 hover:-translate-y-1"
                  }`}
                  onClick={() => setChartType("line")}
                >
                  Line
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartType === "bar"
                      ? "bg-[#40E0D0]/20 text-[#E0F7FA] border border-[#40E0D0]/60"
                      : "bg-white/5 text-[#E0F7FA]/70 border border-white/10 hover:bg-[#40E0D0]/10 hover:-translate-y-1"
                  }`}
                  onClick={() => setChartType("bar")}
                >
                  Bar
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-[#E0F7FA]/70 border border-white/10 hover:bg-[#40E0D0]/10 hover:-translate-y-1 transition-all ml-auto"
                  onClick={fetchUserProgress}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#203A43]/60 rounded-xl p-6 shadow-inner border border-[#40E0D0]/10 transition-all hover:border-[#40E0D0]/20 hover:shadow-lg">
                {loading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-[#B8F0F9]">Loading your progress data...</p>
                  </div>
                ) : (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "bar" ? (
                        <BarChart data={chartData}>
                          <XAxis dataKey="day" stroke="#E0F7FA" axisLine={{ stroke: "rgba(224, 247, 250, 0.3)" }} />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(32, 58, 67, 0.95)",
                              border: "1px solid rgba(64, 224, 208, 0.3)",
                              borderRadius: "8px",
                              color: "#E0F7FA",
                            }}
                          />
                          <Bar
                            dataKey="progress"
                            fill="#40E0D0"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                            animationEasing="ease"
                          />
                        </BarChart>
                      ) : (
                        <LineChart data={chartData}>
                          <XAxis dataKey="day" stroke="#E0F7FA" axisLine={{ stroke: "rgba(224, 247, 250, 0.3)" }} />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(32, 58, 67, 0.95)",
                              border: "1px solid rgba(64, 224, 208, 0.3)",
                              borderRadius: "8px",
                              color: "#E0F7FA",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="progress"
                            stroke="#40E0D0"
                            strokeWidth={3}
                            dot={{ fill: "#40E0D0", strokeWidth: 2, r: 6 }}
                            activeDot={{ fill: "#64B4FF", r: 8, strokeWidth: 0 }}
                            animationDuration={1500}
                            animationEasing="ease"
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <h3 className="mt-6 text-[#E0F7FA] flex items-center gap-2 font-medium">
                <span className="text-xl">🔥</span> Current Streak: {streak} days
              </h3>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mt-3 mb-5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(64,224,208,0.4)]"
                  style={{ width: `${streakPercentage}%` }}
                ></div>
              </div>
              <p className="text-right text-[#B8F0F9] text-sm">
                {streak >= 14 ? "🎉 Streak Maxed!" : `${14 - streak} days to max streak`}
              </p>
            </CardContent>
          </Card>

          {/* Leaderboard Card */}
          <Card
            className="bg-[#203A43]/75 border-[#40E0D0]/15 backdrop-blur-md shadow-lg hover:-translate-y-2 hover:border-[#40E0D0]/30 hover:shadow-xl transition-all animate-fadeIn"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader>
              <CardTitle className="text-[#E0F7FA] text-xl border-b border-[#E0F7FA]/10 pb-2 text-shadow-sm">
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mt-2">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-[#B8F0F9] italic bg-[#2A3A57]/30 rounded-lg">
                    Loading leaderboard data...
                  </div>
                ) : (
                  leaderboard.map((entry, index) => {
                    // Determine medal or rank display
                    let rankDisplay
                    if (index === 0) {
                      rankDisplay = "🥇"
                    } else if (index === 1) {
                      rankDisplay = "🥈"
                    } else if (index === 2) {
                      rankDisplay = "🥉"
                    } else {
                      rankDisplay = `${index + 1}`
                    }

                    return (
                      <li
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg animate-slideIn ${
                          entry.isCurrentUser
                            ? "bg-[#40E0D0]/15 border-l-3 border-[#40E0D0]"
                            : "bg-[#203A43]/80 hover:bg-[#2C3E50]/70 hover:translate-x-1"
                        } transition-all`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg min-w-8 text-center">{rankDisplay}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#E0F7FA] font-medium">{entry.name}</span>
                            {entry.isCurrentUser && (
                              <span className="bg-[#40E0D0]/20 border border-[#40E0D0]/40 text-[#40E0D0] text-xs px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[#40E0D0] font-bold bg-[#40E0D0]/10 px-3 py-1 rounded-full">
                          {entry.xp} XP
                        </span>
                      </li>
                    )
                  })
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card
            className="bg-[#203A43]/75 border-[#40E0D0]/15 backdrop-blur-md shadow-lg hover:-translate-y-2 hover:border-[#40E0D0]/30 hover:shadow-xl transition-all animate-fadeIn"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader>
              <CardTitle className="text-[#E0F7FA] text-xl border-b border-[#E0F7FA]/10 pb-2 text-shadow-sm">
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mt-2">
                {achievements
                  .filter((achievement) => showAllAchievements || achievement.earned)
                  .map((achievement, index) => (
                    <li
                      key={achievement.id}
                      className={`p-4 rounded-lg ${
                        achievement.earned
                          ? "bg-[#203A43]/60 border-l-3 border-[#40E0D0] opacity-100"
                          : "bg-[#203A43]/60 border-l-3 border-transparent opacity-70"
                      } flex justify-between items-center transition-all hover:translate-x-1 hover:bg-[#40E0D0]/10 animate-slideIn`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{achievement.earned ? "🏆" : "🔒"}</span>
                        <span className="text-[#E0F7FA] font-medium">{achievement.title}</span>
                      </div>
                      <span className="text-[#E0F7FA]/70 text-sm">{achievement.description}</span>
                    </li>
                  ))}
              </ul>
              <Button
                onClick={() => setShowAllAchievements((prev) => !prev)}
                className="w-full mt-6 bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] text-white font-semibold py-2 rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                {showAllAchievements ? "Show Earned Only" : "View All Achievements"}
              </Button>
            </CardContent>
          </Card>

          {/* Today's Tasks Card */}
          <Card
            className="bg-[#203A43]/75 border-[#40E0D0]/15 backdrop-blur-md shadow-lg hover:-translate-y-2 hover:border-[#40E0D0]/30 hover:shadow-xl transition-all animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader>
              <CardTitle className="text-[#E0F7FA] text-xl border-b border-[#E0F7FA]/10 pb-2 text-shadow-sm">
                Today's Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 mt-2">
                {tasks.length === 0 ? (
                  <p className="text-center py-8 text-[#B8F0F9]">No tasks for today. Add one below!</p>
                ) : (
                  tasks.map((task, index) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-4 py-3 px-2 border-b border-[#40E0D0]/10 last:border-b-0 hover:bg-[#40E0D0]/5 hover:rounded-lg hover:translate-x-1 transition-all animate-slideIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 ${
                          task.completed
                            ? "border-[#40E0D0] bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] flex items-center justify-center"
                            : "border-[#E0F7FA]/30 bg-transparent hover:border-[#40E0D0] hover:scale-110 hover:shadow-[0_0_10px_rgba(64,224,208,0.3)]"
                        } cursor-pointer transition-all`}
                        onClick={() => handleTaskCompletion(task.id, !task.completed)}
                      >
                        {task.completed && <span className="text-white text-xs font-bold">✓</span>}
                      </div>

                      {task.isEditing ? (
                        <Input
                          value={task.title}
                          onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                          onBlur={() => toggleEdit(task.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") toggleEdit(task.id)
                          }}
                          className="flex-1 py-2 px-3 bg-[#2A3343]/70 border border-[#40E0D0]/30 text-[#E0F7FA] rounded-lg focus:shadow-[0_0_10px_rgba(64,224,208,0.1)]"
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`flex-1 py-2 cursor-pointer ${
                            task.completed ? "text-[#E0F7FA]/50 line-through" : "text-[#E0F7FA] font-medium"
                          } transition-all`}
                          onDoubleClick={() => toggleEdit(task.id)}
                        >
                          {task.title}
                          {task.isHabit && <span className="text-sm opacity-80 ml-2">(daily)</span>}
                          {task.estimatedTime && (
                            <span className="text-sm opacity-80 ml-2 text-[#64B4FF]">({task.estimatedTime} min)</span>
                          )}
                        </span>
                      )}

                      <button
                        className="w-9 h-9 flex items-center justify-center bg-red-500/20 text-white rounded-lg hover:bg-red-500/50 hover:-translate-y-1 transition-all"
                        onClick={() => deleteTask(task.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))
                )}
              </ul>

              {showInput ? (
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Add a new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={() => setShowInput(false)}
                  className="w-full mt-5 p-4 bg-[#2A3343]/70 border border-[#40E0D0]/30 text-[#E0F7FA] rounded-lg focus:border-[#40E0D0]/60 focus:shadow-[0_0_15px_rgba(64,224,208,0.1)] focus:-translate-y-1 transition-all"
                />
              ) : (
                <Button
                  onClick={addTask}
                  className="w-full mt-5 bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] text-white font-semibold py-3 rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-xl">+</span> Add New Task
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Time Allocation Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[#203A43]/95 border border-[#40E0D0]/30 rounded-2xl p-8 w-[400px] max-w-[90%] shadow-2xl animate-fadeIn">
            <h3 className="text-[#E0F7FA] text-xl font-semibold mb-6 text-center">
              Allocate Time for "{selectedTask.title}"
            </h3>
            <Input
              type="number"
              placeholder="Estimated time in minutes"
              value={timeAllocation}
              onChange={(e) => setTimeAllocation(e.target.value)}
              className="w-full p-4 my-4 bg-[#0F2027]/70 border border-[#40E0D0]/30 text-[#E0F7FA] rounded-lg focus:border-[#40E0D0]/60 focus:shadow-[0_0_15px_rgba(64,224,208,0.1)] transition-all text-lg"
            />
            <div className="flex gap-4 mt-6">
              <Button
                onClick={saveTimeAllocation}
                className="flex-1 bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] text-white font-semibold py-3 rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                Save Time
              </Button>
              <Button
                onClick={() => setSelectedTask(null)}
                className="flex-1 bg-[#FFFFFF]/10 text-[#E0F7FA] font-semibold py-3 rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Component */}
      <AIChat
        user={user}
        tasks={tasks}
        onTaskUpdate={handleTaskUpdateFromAI}
        onAddTaskWithDate={handleAddTaskWithDate}
      />
    </div>
  )
}
