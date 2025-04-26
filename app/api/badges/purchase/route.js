import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/mongodb"
import Badge from "../../../../models/Badge"
import User from "../../../../models/User"
import { getUserFromToken } from "../../../../lib/auth"

// Purchase a badge
export async function POST(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get badge ID
    const { badgeId } = await request.json()

    if (!badgeId) {
      return NextResponse.json({ success: false, message: "Badge ID is required" }, { status: 400 })
    }

    // Get badge - check if the badgeId is a number to handle frontend numeric IDs
    let badge
    
    if (typeof badgeId === 'number' || !isNaN(parseInt(badgeId))) {
      const numericBadgeId = parseInt(badgeId)
      
      // First try to find the badge by numeric ID
      badge = await Badge.findOne({ numericId: numericBadgeId })
      
      // If badge doesn't exist, create it directly
      if (!badge) {
        try {
          // Create the badge with the hardcoded data
          badge = new Badge({
            numericId: numericBadgeId,
            name: getBadgeName(numericBadgeId),
            description: getBadgeDescription(numericBadgeId),
            price: getBadgePrice(numericBadgeId),
            rarity: getBadgeRarity(numericBadgeId)
          })
          
          // Save the new badge
          await badge.save()
        } catch (error) {
          console.error("Error creating badge:", error)
          // If there was an error with the numericId, try finding by name
          badge = await Badge.findOne({ 
            name: getBadgeName(numericBadgeId) 
          })
          
          if (!badge) {
            return NextResponse.json({ 
              success: false, 
              message: "Failed to create or find badge" 
            }, { status: 500 })
          }
        }
      }
    } else {
      // If it's not a number, assume it's a valid MongoDB ID
      badge = await Badge.findById(badgeId)
    }

    if (!badge) {
      return NextResponse.json({ success: false, message: "Badge not found" }, { status: 404 })
    }

    // Get user with badges
    const userObj = await User.findById(user._id)

    // Check if user already has this badge (compare badge ID strings)
    if (userObj.badges.some(b => b.toString() === badge._id.toString())) {
      return NextResponse.json({ success: false, message: "You already own this badge" }, { status: 400 })
    }

    // Check if user has enough XP
    if (userObj.xp < badge.price) {
      return NextResponse.json({ success: false, message: "Not enough XP" }, { status: 400 })
    }

    // Deduct XP and add badge
    userObj.xp -= badge.price
    userObj.badges.push(badge._id)
    await userObj.save()

    return NextResponse.json(
      {
        success: true,
        data: {
          badge,
          userXp: userObj.xp,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Purchase badge error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}

// Helper functions to get badge data based on numeric ID
function getBadgeName(id) {
  const names = {
    1: "Early Bird",
    2: "Night Owl",
    3: "Streak Master",
    4: "Game Champion",
    5: "Fitness Guru",
    6: "Habit Hero"
  }
  return names[id] || `Badge ${id}`
}

function getBadgeDescription(id) {
  const descriptions = {
    1: "Complete 5 tasks before 9 AM",
    2: "Complete 5 tasks after 10 PM",
    3: "Maintain a 7-day streak",
    4: "Win all mini games",
    5: "Complete a 30-day fitness plan",
    6: "Create and complete 10 habits"
  }
  return descriptions[id] || `Badge ${id} description`
}

function getBadgePrice(id) {
  const prices = {
    1: 100,
    2: 100,
    3: 200,
    4: 300,
    5: 500,
    6: 500
  }
  return prices[id] || 100
}

function getBadgeRarity(id) {
  const rarities = {
    1: "common",
    2: "common",
    3: "rare",
    4: "rare",
    5: "epic",
    6: "epic"
  }
  return rarities[id] || "common"
}
