"use client"
import { useState, useEffect } from "react"
import { Line, Bar, LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartData {
  day: string
  xp: number
}

interface PerformanceChartProps {
  type: "line" | "bar"
  userData?: {
    completedTasks: number[]
    completedHabits: number[]
    playedGames: number[]
  }
}

export function PerformanceChart({ type, userData }: PerformanceChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const generateChartData = () => {
      try {
        setLoading(true)
        setError(false)

        // Get the last 7 days
        const days = []
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          days.push({
            date,
            day: dayNames[date.getDay()]
          })
        }

        // If we have user data, use it; otherwise, generate realistic data
        if (userData) {
          const data = days.map((day, index) => {
            // Calculate XP from user data
            const tasksXP = (userData.completedTasks[index] || 0) * 10
            const habitsXP = (userData.completedHabits[index] || 0) * 20
            const gamesXP = (userData.playedGames[index] || 0) * 10
            
            return {
              day: day.day,
              xp: tasksXP + habitsXP + gamesXP
            }
          })
          
          setChartData(data)
        } else {
          // Generate realistic data with an upward trend
          const data = days.map((day, index) => {
            // Base XP that increases slightly each day
            const baseXP = 30 + index * 5
            
            // Add some randomness but keep the trend
            const randomFactor = Math.floor(Math.random() * 20) - 5
            
            return {
              day: day.day,
              xp: Math.max(0, baseXP + randomFactor)
            }
          })
          
          setChartData(data)
        }
      } catch (error) {
        console.error("Failed to generate chart data:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    generateChartData()
  }, [userData])

  if (loading) {
    return <div className="h-[300px] w-full bg-[#1a2332]/50 animate-pulse rounded-md"></div>
  }

  if (error || chartData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Unable to load performance data.</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-[#4cc9f0] hover:underline">
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3343" />
            <XAxis dataKey="day" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af" }}
              label={{ value: "XP", angle: -90, position: "insideLeft", fill: "#9ca3af" }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a2332", borderColor: "#2a3343", color: "#fff" }}
              labelStyle={{ color: "#fff" }}
              formatter={(value) => [`${value} XP`, "XP"]}
            />
            <Line
              type="monotone"
              dataKey="xp"
              stroke="#4cc9f0"
              strokeWidth={2}
              dot={{ fill: "#4cc9f0", r: 4 }}
              activeDot={{ r: 6, fill: "#4cc9f0" }}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3343" />
            <XAxis dataKey="day" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af" }}
              label={{ value: "XP", angle: -90, position: "insideLeft", fill: "#9ca3af" }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a2332", borderColor: "#2a3343", color: "#fff" }}
              labelStyle={{ color: "#fff" }}
              formatter={(value) => [`${value} XP`, "XP"]}
            />
            <Bar dataKey="xp" fill="#4cc9f0" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
