"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  username: string
  xp: number
  level: number
  gameStats?: {
    spinWheel?: { totalXP: number }
    quizGame?: { totalXP: number }
    wordScrambler?: { totalXP: number }
  }
  badge?: string
  isCurrentUser?: boolean
}

export function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(false)

      const res = await fetch("/api/users/leaderboard")
      if (!res.ok) throw new Error("Failed to fetch leaderboard")

      const data = await res.json()
      if (data.success && data.data?.length > 0) {
        setLeaderboardData(data.data)
      } else {
        throw new Error("No data available")
      }
    } catch (error) {
      console.error("Leaderboard error:", error)
      setError(true)
      setLeaderboardData(generatePlaceholderData())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  function generatePlaceholderData(): LeaderboardEntry[] {
    const mockUsers = [
      { 
        username: "AstroAchiever", 
        xp: 350, 
        isCurrentUser: true,
        gameStats: {
          spinWheel: { totalXP: 100 },
          quizGame: { totalXP: 150 },
          wordScrambler: { totalXP: 100 }
        }
      },
      { 
        username: "CosmicExplorer", 
        xp: 520, 
        isCurrentUser: false,
        gameStats: {
          spinWheel: { totalXP: 170 },
          quizGame: { totalXP: 200 },
          wordScrambler: { totalXP: 150 }
        }
      },
      { 
        username: "StarGazer42", 
        xp: 480, 
        isCurrentUser: false,
        gameStats: {
          spinWheel: { totalXP: 150 },
          quizGame: { totalXP: 180 },
          wordScrambler: { totalXP: 150 }
        }
      },
      { 
        username: "GalaxyQuester", 
        xp: 410, 
        isCurrentUser: false,
        gameStats: {
          spinWheel: { totalXP: 110 },
          quizGame: { totalXP: 150 },
          wordScrambler: { totalXP: 150 }
        }
      },
      { 
        username: "NebulaNinja", 
        xp: 380, 
        isCurrentUser: false,
        gameStats: {
          spinWheel: { totalXP: 100 },
          quizGame: { totalXP: 130 },
          wordScrambler: { totalXP: 150 }
        }
      }
    ]

    return mockUsers
      .sort((a, b) => b.xp - a.xp)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        level: Math.floor(user.xp / 100) + 1,
        badge: getBadgeForUser(user.xp, index),
      }))
  }

  function getBadgeForUser(xp: number, rank: number): string {
    if (rank === 0) return "🥇"
    if (rank === 1) return "🥈"
    if (rank === 2) return "🥉"
    if (xp >= 500) return "🌟"
    if (xp >= 400) return "🚀"
    if (xp >= 300) return "🌙"
    if (xp >= 200) return "✨"
    return "🔭"
  }

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
        <button 
          onClick={fetchLeaderboard} 
          className="mt-2 flex items-center justify-center gap-1 text-[#4cc9f0] hover:underline mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 text-center">
        Total XP includes points from all games: Spin Wheel, Quiz, and Word Scrambler
      </div>
      <div className="space-y-1">
        {leaderboardData.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center justify-between p-2 rounded-md animate-slideIn ${
              user.isCurrentUser
                ? "bg-[#40E0D0]/15 border-l-3 border-[#40E0D0]"
                : "bg-[#1a2332] hover:bg-[#2a3343] hover:translate-x-1"
            } transition-all`}
            style={{ animationDelay: `${user.rank * 0.1}s` }}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg min-w-8 text-center">
                {user.rank <= 3 ? ["🥇", "🥈", "🥉"][user.rank - 1] : user.rank}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[#E0F7FA] font-medium">{user.username}</span>
                {user.isCurrentUser && (
                  <span className="bg-[#40E0D0]/20 border border-[#40E0D0]/40 text-[#40E0D0] text-xs px-1.5 py-0.5 rounded">
                    You
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#40E0D0] font-bold bg-[#40E0D0]/10 px-3 py-1 rounded-full">
                {user.xp} XP
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#2a3343] text-gray-300">Lv.{user.level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
