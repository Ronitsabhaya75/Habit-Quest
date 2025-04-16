import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"

// Get leaderboard
export async function GET(request) {
  try {
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
      }
    })

    return NextResponse.json({ success: true, data: leaderboard }, { status: 200 })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}
