import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Badge from "@/models/Badge"
import { getUserFromToken } from "@/lib/auth"

// Get all badges
export async function GET(request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const rarity = searchParams.get("rarity")

    // Build query
    const query = {}

    // If rarity is provided, filter by rarity
    if (rarity) {
      query.rarity = rarity
    }

    // Get badges
    const badges = await Badge.find(query).sort({ price: 1 })

    return NextResponse.json({ success: true, data: badges }, { status: 200 })
  } catch (error) {
    console.error("Get badges error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Create a new badge (admin only)
export async function POST(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // TODO: Add admin check here

    // Connect to the database
    await connectToDatabase()

    // Get badge data
    const badgeData = await request.json()

    // Create badge
    const badge = await Badge.create(badgeData)

    return NextResponse.json({ success: true, data: badge }, { status: 201 })
  } catch (error) {
    console.error("Create badge error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
