import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Badge from "@/models/Badge"
import User from "@/models/User"
import { getUserFromToken } from "@/lib/auth"

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

    // Get badge
    const badge = await Badge.findById(badgeId)

    if (!badge) {
      return NextResponse.json({ success: false, message: "Badge not found" }, { status: 404 })
    }

    // Get user with badges
    const userObj = await User.findById(user._id)

    // Check if user already has this badge
    if (userObj.badges.includes(badgeId)) {
      return NextResponse.json({ success: false, message: "You already own this badge" }, { status: 400 })
    }

    // Check if user has enough XP
    if (userObj.xp < badge.price) {
      return NextResponse.json({ success: false, message: "Not enough XP" }, { status: 400 })
    }

    // Deduct XP and add badge
    userObj.xp -= badge.price
    userObj.badges.push(badgeId)
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
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
