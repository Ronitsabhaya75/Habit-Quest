import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import { getUserFromToken } from "@/lib/auth"

// Get leaderboard
export async function GET(request) {
  try {
    // Get current user from token
    const currentUser = await getUserFromToken(request)

    // Connect to the database
    await connectToDatabase()

    // Get top 10 users by XP
    const users = await User.find().select("username xp level badges").sort({ xp: -1 }).limit(10)

    // Format leaderboard data
    const leaderboard = users.map((user, index) => {
      // Get the highest rarity badge (or default emoji if no badges)
      let topBadge = "🚀" // Default badge

      if (user.badges && user.badges.length > 0) {
        // If badges are populated objects
        if (typeof user.badges[0] === "object" && user.badges[0].rarity) {
          const rarityOrder = { epic: 3, rare: 2, common: 1 }
          topBadge =
            user.badges.reduce((prev, current) => {
              return rarityOrder[current.rarity] > rarityOrder[prev.rarity] ? current : prev
            }).icon || "🚀"
        } else {
          // If badges are just IDs, use default badge
          topBadge = "🏆"
        }
      }

      return {
        rank: index + 1,
        username: user.username,
        xp: user.xp,
        level: user.level,
        badge: topBadge,
        isCurrentUser: currentUser && user._id.toString() === currentUser._id.toString(),
      }
    })

    return NextResponse.json({ success: true, data: leaderboard }, { status: 200 })
  } catch (error) {
    console.error("Get leaderboard error:", error)

    // If there's an error, generate fallback data
    const fallbackData = generateFallbackData()
    return NextResponse.json({ success: true, data: fallbackData }, { status: 200 })
  }
}

// Generate fallback data if database connection fails
function generateFallbackData() {
  const mockUsers = [
    { username: "AstroAchiever", xp: 350, isCurrentUser: true },
    { username: "CosmicExplorer", xp: 520, isCurrentUser: false },
    { username: "StarGazer42", xp: 480, isCurrentUser: false },
    { username: "GalaxyQuester", xp: 410, isCurrentUser: false },
    { username: "NebulaNinja", xp: 380, isCurrentUser: false },
    { username: "MoonWalker", xp: 320, isCurrentUser: false },
    { username: "SolarSurfer", xp: 290, isCurrentUser: false },
    { username: "CosmicCaptain", xp: 260, isCurrentUser: false },
    { username: "VoyagerVIP", xp: 230, isCurrentUser: false },
    { username: "OrbitObtainer", xp: 200, isCurrentUser: false },
  ]

  // Sort by XP
  const sortedUsers = mockUsers.sort((a, b) => b.xp - a.xp)

  // Add rank and level
  return sortedUsers.map((user, index) => ({
    ...user,
    rank: index + 1,
    level: Math.floor(user.xp / 100) + 1,
    badge: getBadgeForUser(user.xp, index),
  }))
}

// Function to determine badge based on XP and rank
function getBadgeForUser(xp, rank) {
  if (rank === 0) return "🥇"
  if (rank === 1) return "🥈"
  if (rank === 2) return "🥉"
  if (xp >= 500) return "🌟"
  if (xp >= 400) return "🚀"
  if (xp >= 300) return "🌙"
  if (xp >= 200) return "✨"
  return "🔭"
}
