import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import { getUserFromToken } from "@/lib/auth"

// Define a list of fun default usernames for the demo
const defaultUsernames = [
  "CosmicHabitMaster",
  "StarGazer42", 
  "GalaxyQuester", 
  "NebulaNinja", 
  "MoonWalker", 
  "SolarSurfer", 
  "CosmicCaptain", 
  "VoyagerVIP", 
  "OrbitObtainer",
  "CosmicExplorer"
];

// Get leaderboard
export async function GET(request) {
  try {
    // Get current user from token
    const currentUser = await getUserFromToken(request)

    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get only real users with usernames, ordered by XP
    const users = await User.find({ username: { $exists: true } })
      .select("username xp level badges")
      .sort({ xp: -1 })
      .limit(10)

    // Create a flag to check if the current user is already in the top users
    let currentUserIncluded = false;

    // Format leaderboard data
    let leaderboard = [];
    
    if (users && users.length > 0) {
      leaderboard = users.map((user, index) => {
        const isCurrentUser = currentUser && user._id.toString() === currentUser._id.toString();
        
        // If we found the current user, mark the flag
        if (isCurrentUser) {
          currentUserIncluded = true;
        }

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
          level: user.level || Math.floor(user.xp / 100) + 1,
          badge: topBadge,
          isCurrentUser
        }
      });
    }

    // If current user is not already included, add them
    if (!currentUserIncluded && currentUser) {
      // Get badges info for current user
      let topBadge = "🚀" // Default badge
      
      if (currentUser.badges && currentUser.badges.length > 0) {
        // If badges are populated objects
        if (typeof currentUser.badges[0] === "object" && currentUser.badges[0].rarity) {
          const rarityOrder = { epic: 3, rare: 2, common: 1 }
          topBadge =
            currentUser.badges.reduce((prev, current) => {
              return rarityOrder[current.rarity] > rarityOrder[prev.rarity] ? current : prev
            }).icon || "🚀"
        } else {
          // If badges are just IDs, use default badge
          topBadge = "🏆"
        }
      }
      
      leaderboard.push({
        rank: leaderboard.length + 1,
        username: currentUser.username,
        xp: currentUser.xp || 0,
        level: currentUser.level || Math.floor((currentUser.xp || 0) / 100) + 1,
        badge: topBadge,
        isCurrentUser: true
      });
    }

    // If the leaderboard is completely empty, just add the current user
    if (leaderboard.length === 0 && currentUser) {
      leaderboard = [{
        rank: 1,
        username: currentUser.username,
        xp: currentUser.xp || 0,
        level: currentUser.level || Math.floor((currentUser.xp || 0) / 100) + 1,
        badge: "🚀",
        isCurrentUser: true
      }];
    }

    // Log what we're returning for debugging
    console.log("Returning leaderboard data:", JSON.stringify(leaderboard));

    return NextResponse.json({ success: true, data: leaderboard }, { status: 200 })
  } catch (error) {
    console.error("Get leaderboard error:", error)

    // If there's an error but we have the current user, at least show them
    if (currentUser) {
      const fallbackLeaderboard = [{
        rank: 1,
        username: currentUser.username,
        xp: currentUser.xp || 0,
        level: currentUser.level || Math.floor((currentUser.xp || 0) / 100) + 1,
        badge: "🚀",
        isCurrentUser: true
      }];
      
      return NextResponse.json({ success: true, data: fallbackLeaderboard }, { status: 200 })
    }

    // Return empty array as last resort
    return NextResponse.json({ success: true, data: [] }, { status: 200 })
  }
}
