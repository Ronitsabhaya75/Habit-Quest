"use client"

import { useState, useEffect } from "react"

interface LeaderboardEntry {
  rank: number
  username: string
  xp: number
  level: number
  badge?: string
  isCurrentUser?: boolean
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

        // In a real app, you would fetch this from your API
        // For now, we'll generate realistic data
        const mockUsers = [
          { username: "CosmicExplorer", xp: 520, isCurrentUser: false },
          { username: "StarGazer42", xp: 480, isCurrentUser: false },
          { username: "GalaxyQuester", xp: 410, isCurrentUser: false },
          { username: "NebulaNinja", xp: 380, isCurrentUser: false },
          { username: "AstroAchiever", xp: 350, isCurrentUser: true },
          { username: "MoonWalker", xp: 320, isCurrentUser: false },
          { username: "SolarSurfer", xp: 290, isCurrentUser: false },
          { username: "CosmicCaptain", xp: 260, isCurrentUser: false },
          { username: "VoyagerVIP", xp: 230, isCurrentUser: false },
          { username: "OrbitObtainer", xp: 200, isCurrentUser: false },
        ]

        // Sort by XP
        const sortedUsers = mockUsers.sort((a, b) => b.xp - a.xp)

        // Add rank and level
        const rankedUsers = sortedUsers.map((user, index) => ({
          ...user,
          rank: index + 1,
          level: Math.floor(user.xp / 100) + 1,
          badge: getBadgeForUser(user.xp)
        }))

        setLeaderboardData(rankedUsers)
      } catch (error) {
        console.error("Leaderboard error:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  // Function to determine badge based on XP
  function getBadgeForUser(xp: number): string {
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
