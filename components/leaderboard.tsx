"use client"

import { useState, useEffect } from "react"

interface LeaderboardEntry {
  rank: number
  username: string
  xp: number
  level: number
  badge?: string
}

export function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true)
        setError(false)

        // Fetch actual user data from the database
        const res = await fetch("/api/users/leaderboard")

        if (!res.ok) {
          console.error("Leaderboard fetch failed with status:", res.status)
          setError(true)
          return
        }

        const data = await res.json()
        if (data.success) {
          setLeaderboardData(data.data)
        } else {
          setError(true)
        }
      } catch (error) {
        console.error("Leaderboard error:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-md bg-[#2a3343]/50 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
              <div className="h-4 w-24 bg-gray-600 rounded"></div>
            </div>
            <div className="h-4 w-16 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || leaderboardData.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        <p>Unable to load leaderboard data.</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-[#4cc9f0] hover:underline">
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {leaderboardData.map((user) => (
          <div
            key={user.rank}
            className="flex items-center justify-between p-2 rounded-md bg-[#1a2332] hover:bg-[#2a3343] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-white font-bold w-4">{user.rank}</span>
              <div className="flex items-center">
                <span className="text-[#4cc9f0] mr-2">{user.badge || "🚀"}</span>
                <span className="text-white">{user.username}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#4cc9f0] font-bold">{user.xp} XP</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#2a3343] text-gray-300">Lv.{user.level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
