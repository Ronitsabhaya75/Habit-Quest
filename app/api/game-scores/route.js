import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import GameScore from "@/models/GameScore"
import User from "@/models/User"
import { getUserFromToken } from "@/lib/auth"

// Get all game scores for the current user
export async function GET(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const game = searchParams.get("game")

    // Build query
    const query = { user: user._id }

    // If game is provided, filter by game
    if (game) {
      query.game = game
    }

    // Get game scores
    const gameScores = await GameScore.find(query).sort({ playedAt: -1 })

    return NextResponse.json({ success: true, data: gameScores }, { status: 200 })
  } catch (error) {
    console.error("Get game scores error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Save a new game score
export async function POST(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get game score data
    const { game, score, xpEarned } = await request.json()

    // Validate input
    if (!game || score === undefined) {
      return NextResponse.json({ success: false, message: "Game and score are required" }, { status: 400 })
    }

    // Ensure XP doesn't exceed max of 10
    const cappedXP = Math.min(xpEarned || 0, 10)

    // Create game score
    const gameScore = await GameScore.create({
      user: user._id,
      game,
      score,
      xpEarned: cappedXP,
    })

    // Award XP to user
    if (cappedXP > 0) {
      const userObj = await User.findById(user._id)
      userObj.addXP(cappedXP)
      await userObj.save()
    }

    return NextResponse.json({ success: true, data: gameScore }, { status: 201 })
  } catch (error) {
    console.error("Save game score error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
