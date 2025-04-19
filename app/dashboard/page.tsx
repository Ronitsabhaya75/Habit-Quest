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

// Define types for tasks and notifications
type Task = {
  id: number | string
  title: string
  completed: boolean
  isHabit?: boolean
  estimatedTime?: number
  isEditing?: boolean
}

type Notification = {
  id: number
  message: string
  actions: { label: string; onClick: () => void }[]
}

export default function Dashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [chartData, setChartData] = useState<Array<{ day: string; progress: number }>>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState("")
  const [showInput, setShowInput] = useState(false)
  const [leaderboard, setLeaderboard] = useState<Array<{ username?: string; name?: string; xp: number; isCurrentUser?: boolean }>>([])
  const [chartType, setChartType] = useState("line")
  const [streak, setStreak] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [timeAllocation, setTimeAllocation] = useState("")
  const [activeSection, setActiveSection] = useState("dashboard")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Calculate derived values from totalXP
  const currentLevel = Math.floor(totalXP / 100) + 1
  const levelProgress = totalXP % 100
  const streakPercentage = Math.min((streak / 14) * 100, 100)

  // Add notification with animation and auto-dismissal
  const addNotification = useCallback((message: string, actions: { label: string; onClick: () => void }[] = []) => {
    const newNotification: Notification = { id: Date.now(), message, actions }
    setNotifications((prev) => [...prev, newNotification])
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id)), 5000)
  }, [])

  // Enhanced achievements with more visual appeal - set all to not earned by default for new users
  const achievements = [
    { id: 1, title: "First Week Streak", description: "Completed 7 days of habits", earned: false },
    { id: 2, title: "Milestone 100 XP", description: "Reached 100 XP points", earned: false },
    { id: 3, title: "Habit Master", description: "Completed 3 habits consistently", earned: false },
    {
      id: 4,
      title: "Task Champion",
      description: "Completed 5 tasks in a day",
      earned: false,
    },
    { id: 5, title: "Early Bird", description: "Complete tasks before 9am", earned: false },
    { id: 6, title: "Game Player", description: "Played mini-games", earned: false },
    { id: 7, title: "Badge Collector", description: "Purchased badges from shop", earned: false },
    {
      id: 8,
      title: "Perfect Week",
      description: "Complete all scheduled tasks for 7 days",
      earned: false,
    },
    { id: 9, title: "Fitness Enthusiast", description: "Track fitness activities", earned: false },
    { id: 10, title: "Productivity Master", description: "Reached level 5", earned: false },
  ]

  // Add a function to fetch the user profile with XP and streak
  const fetchUserProfile = useCallback(async () => {
    try {
      // Use the user profile API endpoint
      const res = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store" // Ensure fresh data
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch user profile: ${res.status}`)
      }

      const data = await res.json()
      
      if (data.success && data.data) {
        // Update XP and streak from the user profile
        setTotalXP(data.data.xp || 0)
        setStreak(data.data.streak || 0)
      } else {
        throw new Error(data.message || "Failed to fetch user profile")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      // Keep the current values of XP and streak if there's an error
    }
  }, [])

  const fetchUserProgress = useCallback(async () => {
    setLoading(true)

    try {
      // Use the real API endpoint for performance data
      const res = await fetch("/api/stats/performance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store" // Ensure fresh data
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch performance data: ${res.status}`)
      }

      const data = await res.json()
      
      if (data.success) {
        // For new users with no data, show empty state
        if (data.data && data.data.length > 0) {
          // Format the data for the chart
          const formattedData = data.data.map((item: any) => ({
            day: item.day,
            progress: item.xp // Use the xp value as progress
          }))
          
          setChartData(formattedData)
        } else {
          // No data yet - show empty state
          setChartData([])
        }
      } else {
        throw new Error(data.message || "Failed to fetch performance data")
      }
    } catch (error) {
      console.error("Error fetching progress data:", error)
      
      // For new users, show empty state
      setChartData([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    try {
      // Use the real API endpoint for leaderboard data
      const res = await fetch("/api/users/leaderboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store" // Ensure fresh data
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch leaderboard data: ${res.status}`)
      }

      const data = await res.json()
      
      if (data.success) {
        // Validate data exists and is an array
        if (!data.data || !Array.isArray(data.data)) {
          setLeaderboard([])
          return
        }
        
        // Debug: Log the data structure
        console.log("Leaderboard data:", JSON.stringify(data.data));
        
        // Map the API response to the leaderboard format needed for the UI
        // Take the top 5 users
        let leaderboardData = data.data.slice(0, 5).map((entry: any) => ({
          username: entry.username,
          name: entry.name,
          xp: entry.xp,
          isCurrentUser: entry.isCurrentUser
        }))
        
        // If the current user is not in the top 5, add a note about their position
        if (!leaderboardData.some((entry: { isCurrentUser?: boolean }) => entry.isCurrentUser)) {
          addNotification(`You're not in the top 5 yet. Keep earning XP!`)
        }
        
        setLeaderboard(leaderboardData)
      } else {
        // No successful response, show empty state
        setLeaderboard([])
        throw new Error(data.message || "Failed to fetch leaderboard data")
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
      
      // Show empty state instead of mock data
      setLeaderboard([])
    }
  }, [addNotification])

  // Fetch user tasks from API
  const fetchUserTasks = useCallback(async () => {
    try {
      // Call the tasks API endpoint
      const res = await fetch("/api/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store"
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch tasks: ${res.status}`)
      }

      const data = await res.json()
      
      if (data.success) {
        // Map API response to the task format
        const tasksData = data.data.map((task: any) => ({
          id: task.id || task._id,
          title: task.title,
          completed: task.completed,
          isHabit: task.isHabit || false,
          estimatedTime: task.estimatedTime
        }))
        
        setTasks(tasksData)
      } else {
        throw new Error(data.message || "Failed to fetch tasks")
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      // Initialize with empty tasks instead of hardcoded ones
      setTasks([])
    }
  }, [])

  // Fetch achievements from API
  const fetchUserAchievements = useCallback(async () => {
    try {
      // Call the achievements API endpoint
      const res = await fetch("/api/achievements", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store"
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch achievements: ${res.status}`)
      }

      const data = await res.json()
      
      if (data.success) {
        // Update achievements based on API data
        // Instead of replacing the achievements array, update the earned status
        const updatedAchievements = achievements.map(achievement => {
          const apiAchievement = data.data.find((a: any) => a.id === achievement.id || a.title === achievement.title)
          if (apiAchievement) {
            return {
              ...achievement,
              earned: apiAchievement.earned || apiAchievement.completed
            }
          }
          return achievement
        })
        
        // We're not setting state directly since achievements is already defined in the component
        // If you want to make achievements a state, you'd need to refactor that part
      } else {
        throw new Error(data.message || "Failed to fetch achievements")
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
      // Keep existing achievements definition but don't assume any are earned
    }
  }, [achievements])

  // Update the useEffect to fetch all required data
  useEffect(() => {
    // Fetch all data when component mounts
    fetchUserProfile()
    fetchLeaderboard()
    fetchUserProgress()
    fetchUserTasks()
    fetchUserAchievements()
    
    // Optional: Set up a refresh interval (e.g., every 5 minutes) instead of continuous fetching
    const refreshInterval = setInterval(() => {
      fetchUserProfile()
      fetchLeaderboard()
      fetchUserProgress()
      fetchUserTasks()
      fetchUserAchievements()
    }, 300000) // 5 minutes
    
    // Clean up the interval on unmount
    return () => clearInterval(refreshInterval)
    
    // Empty dependency array to run only on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle task completion with notification
  const handleTaskCompletion = async (taskId: number | string, completed: boolean) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed }
        }
        return task
      }),
    )
    
    try {
      if (completed) {
        // Task is being completed, update XP
        const xpGain = 10
        
        // Update XP on the server
        const xpResponse = await fetch("/api/users/update-xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xpGain, taskId })
        })
        
        if (xpResponse.ok) {
          const xpData = await xpResponse.json()
          if (xpData.success) {
            // Update local state with new XP and possibly streak
            setTotalXP(xpData.data.xp)
            if (xpData.data.streak) {
              setStreak(xpData.data.streak)
            }
            
            // Show notification
            addNotification(`✅ Task completed! (+${xpGain} XP)`, [
              { label: "Review", onClick: () => router.push("/review") },
            ])
            
            // Refresh data
            fetchUserProgress()
            fetchLeaderboard()
          }
        }
      }
      
      // Update task status on the server regardless of completed state
      await fetch("/api/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          taskId, 
          completed 
        })
      })
    } catch (err) {
      console.error("Error updating task:", err)
      addNotification("Failed to update task. Please try again.")
    }
  }

  // Add a new task (both locally and on the server)
  const handleAddTask = async (title: string) => {
    // Add to local state temporarily with placeholder ID
    const tempId = Date.now()
    const newTask: Task = { 
      id: tempId,
      title: title.trim(),
      completed: false,
      isHabit: false
    }
    
    setTasks(prevTasks => [...prevTasks, newTask])
    
    try {
      // Send to server
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: title.trim(),
          isHabit: false,
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Replace temporary task with real one from server
          setTasks(prevTasks => prevTasks.map(task => 
            task.id === tempId ? { ...task, id: data.data._id } : task
          ))
          
          // Add notification
          addNotification(`🌟 New task "${title.trim()}" added!`)
        }
      } else {
        // If failed, remove the temporary task
        setTasks(prevTasks => prevTasks.filter(task => task.id !== tempId))
        addNotification("Failed to create task. Please try again.")
      }
    } catch (err) {
      console.error("Error creating task:", err)
      // If failed, remove the temporary task
      setTasks(prevTasks => prevTasks.filter(task => task.id !== tempId))
      addNotification("Failed to create task. Please try again.")
    }
  }

  // Updated keyboard handler for adding tasks
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTask.trim()) {
      handleAddTask(newTask)
      setNewTask("")
      setShowInput(false)
    }
  }

  // Delete a task
  const deleteTask = async (taskId: number | string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      // Remove from local state
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId))
      
      try {
        // Delete from server
        const response = await fetch(`/api/tasks/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId })
        })
        
        if (response.ok) {
          addNotification(`Task "${task.title}" deleted`)
        } else {
          // Restore task if server deletion failed
          setTasks(prevTasks => [...prevTasks, task])
          addNotification("Failed to delete task. Please try again.")
        }
      } catch (err) {
        console.error("Error deleting task:", err)
        // Restore task if server deletion failed
        setTasks(prevTasks => [...prevTasks, task])
        addNotification("Failed to delete task. Please try again.")
      }
    }
  }

  // Handle task update from AI chatbot
  const handleTaskUpdateFromAI = (taskId: number | string, completed: boolean) => {
    handleTaskCompletion(taskId, completed)
  }

  // Add task with date from AI chatbot
  const handleAddTaskWithDate = (date: Date, taskInput: { title: string, completed: boolean }) => {
    const newTask: Task = { 
      id: Date.now(),
      title: taskInput.title,
      completed: taskInput.completed,
      isHabit: false 
    }
    
    setTasks(prevTasks => [...prevTasks, newTask])
    
    // Add notification about the new task
    const dateStr = date.toDateString() === new Date().toDateString() 
      ? "today" 
      : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    
    addNotification(`🆕 New task "${taskInput.title}" added for ${dateStr}!`)
  }

  const openTimeAllocationModal = (task: Task) => setSelectedTask(task)

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

  // Use effect to focus input when shown
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])

  const addTask = () => setShowInput(true)

  const handleNavigation = (section: string) => {
    setActiveSection(section)
    if (section !== "dashboard") {
      router.push(`/${section}`)
    }
    setShowMobileMenu(false)
  }

  // Generate stars for the background
  const generateStars = (count: number) => {
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

  // Handle task editing functions
  const toggleEdit = (taskId: number | string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, isEditing: !task.isEditing }
        }
        return task
      }),
    )
  }

  const updateTaskTitle = (taskId: number | string, newTitle: string) => {
    if (!newTitle.trim()) return

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          // Update task locally
          const updatedTask = { ...task, title: newTitle, isEditing: false }
          
          // Update task on server
          fetch("/api/tasks/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              taskId, 
              title: newTitle 
            })
          }).catch(err => console.error("Error updating task title:", err))
          
          return updatedTask
        }
        return task
      }),
    )
  }

  // Update the Today's Task card to show better guidance for new users
  const renderEmptyTasksMessage = () => {
    return (
      <div className="text-center py-6 flex flex-col items-center">
        <div className="text-5xl mb-4">👋</div>
        <p className="text-[#B8F0F9] text-lg mb-3">Welcome! You're just getting started.</p>
        <p className="text-[#E0F7FA]/70 mb-5">Start by adding your first task below.</p>
        <div className="bg-[#40E0D0]/10 border border-[#40E0D0]/20 rounded-lg p-4 text-[#E0F7FA]/90 text-sm">
          <p className="mb-2"><strong>Tips:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Start with small, achievable tasks</li>
            <li>Build consistent daily habits</li>
            <li>Track your progress to stay motivated</li>
          </ul>
        </div>
      </div>
    )
  }

  // Render welcome message for the graph when there's no data
  const renderEmptyChartMessage = () => {
    return (
      <div className="h-[200px] flex items-center justify-center flex-col">
        <div className="text-4xl mb-3">📈</div>
        <p className="text-[#B8F0F9] text-base mb-2">No progress data yet</p>
        <p className="text-[#E0F7FA]/70 text-sm">Complete tasks to see your progress!</p>
      </div>
    )
  }

  // Render empty leaderboard message
  const renderEmptyLeaderboardMessage = () => {
    return (
      <div className="text-center py-8 flex flex-col items-center">
        <div className="text-4xl mb-3">🏆</div>
        <p className="text-[#B8F0F9] text-base mb-2">Leaderboard data unavailable</p>
        <p className="text-[#E0F7FA]/70 text-sm">Complete tasks to join the rankings!</p>
      </div>
    )
  }

  // Override the chart component to ensure it properly displays for new users
  const renderChart = () => {
    // If no data or empty array, always show the empty state
    if (!chartData || chartData.length === 0) {
      return renderEmptyChartMessage()
    }

    // Otherwise render the appropriate chart
    return (
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
    )
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
              { path: "recurring-tasks", label: "Recurring", icon: "🔄" },
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
              { path: "recurring-tasks", label: "Recurring", icon: "🔄" },
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
                {loading ? renderEmptyChartMessage() : renderChart()}
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
                  renderEmptyLeaderboardMessage()
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
                      // Use a trophy icon instead of numbers for other positions
                      rankDisplay = "🏆"
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
                            <span className="text-[#E0F7FA] font-medium">
                              {entry.username || entry.name || "User"}
                            </span>
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
              {tasks.length === 0 ? (
                renderEmptyTasksMessage()
              ) : (
                <ul className="space-y-1 mt-2">
                  {tasks.map((task, index) => (
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
                            if (e.key === "Enter") updateTaskTitle(task.id, task.title)
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
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTask(task.id)
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

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
                  onClick={() => setShowInput(true)}
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
        activeTasks={tasks}
        onTaskUpdate={handleTaskUpdateFromAI}
        onAddTask={handleAddTaskWithDate}
      />
    </div>
  )
}
