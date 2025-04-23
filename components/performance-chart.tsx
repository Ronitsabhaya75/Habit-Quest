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
  const [dailyData, setDailyData] = useState<ChartData[]>([]) // Store daily gain data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(12) // Default max streak

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true)
        setError(false)

        // Fetch performance data from API
        const response = await fetch("/api/stats/performance")

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Store cumulative data
          console.log("API Response:", data);
          
          // Force first day to be exactly 0 XP
          const fixedData = [...data.data];
          if (fixedData.length > 0) {
            fixedData[0].xp = 0;
          }
          
          setChartData(
            fixedData.map((item: any) => ({
              day: item.day,
              xp: item.xp,
            })),
          )
          
          // Store daily data for streak calculation
          if (data.dailyData) {
            setDailyData(
              data.dailyData.map((item: any) => ({
                day: item.day,
                xp: item.xp,
              })),
            )
            
            // Calculate current streak
            let streak = 0;
            // Start from today (last item) and go backwards
            for (let i = data.dailyData.length - 1; i >= 0; i--) {
              // Use a meaningful threshold (at least 5 XP) to count as an active day
              if (data.dailyData[i].xp >= 5) {
                streak++;
              } else {
                break; // Break when we find a day with insufficient XP
              }
            }
            
            // Ensure streak matches visible activity in graph
            console.log("Daily XP data:", data.dailyData);
            setCurrentStreak(streak);
          }
        } else {
          throw new Error(data.message || "Failed to fetch performance data")
        }
      } catch (error) {
        console.error("Failed to fetch performance data:", error)
        setError(true)

        // Generate fallback data
        const days = []
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

        const today = new Date()
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          days.push({
            date,
            day: dayNames[date.getDay()],
          })
        }

        // Generate fallback data - make sure to include all 7 days
        const fallbackData = days.map((day, index) => {
          // For new users with a 2-day streak, only show activity for the last 2 days
          let xpValue = 0;
          
          if (index >= days.length - 2) {
            // Last two days show gradual increase
            xpValue = (index === days.length - 1) ? 30 : 15; 
          }

          return {
            day: day.day,
            xp: xpValue,
          }
        });

        // Calculate cumulative values
        let cumulativeXP = 0;
        const cumulativeFallbackData = fallbackData.map(day => {
          cumulativeXP += day.xp;
          return {
            day: day.day,
            xp: cumulativeXP
          };
        });

        setChartData(cumulativeFallbackData);
        
        // Set fallback daily data
        const fallbackDailyData = days.map((day, index) => {
          // Only show XP gain for the last day to match the graph
          return {
            day: day.day,
            xp: index === days.length - 1 ? 30 : 0,
          }
        })

        setDailyData(fallbackDailyData)
        setCurrentStreak(1) // Set fallback streak to 1 day to match the graph
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
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
    <div className="space-y-4">
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
                formatter={(value) => [`${value} XP`, "progress"]}
                labelFormatter={(label) => `${label}`}
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
      
      {/* Current streak display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xl mr-2">🔥</span>
          <span className="text-white">Current Streak: {currentStreak} days</span>
        </div>
        
        {/* Progress bar to max streak */}
        <div className="flex-1 max-w-xs ml-4">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-blue-400"
              style={{ width: `${Math.min(100, (currentStreak / maxStreak) * 100)}%` }}
            />
          </div>
          <div className="text-right text-xs text-gray-400 mt-1">
            {maxStreak - currentStreak} days to max streak
          </div>
        </div>
      </div>
    </div>
  )
}
