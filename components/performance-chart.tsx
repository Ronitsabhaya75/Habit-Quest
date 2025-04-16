"use client"
import { useState, useEffect } from "react"
import { Line, Bar, LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartData {
  day: string
  xp: number
}

interface PerformanceChartProps {
  type: "line" | "bar"
}

export function PerformanceChart({ type }: PerformanceChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        setError(false)

        // Fetch actual performance data
        const res = await fetch("/api/stats/performance")

        if (!res.ok) {
          console.error("Performance data fetch failed with status:", res.status)
          setError(true)
          return
        }

        const data = await res.json()
        if (data.success) {
          setChartData(data.data)
        } else {
          setError(true)
        }
      } catch (error) {
        console.error("Failed to fetch chart data:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

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
