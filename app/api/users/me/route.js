import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/mongodb"
import User from "../../../../models/User"
import { getUserFromToken } from "../../../../lib/auth"

// Get current user
export async function GET(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get user with badges
    const userObj = await User.findById(user._id).select("-password").populate("badges")

    return NextResponse.json({ success: true, data: userObj }, { status: 200 })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Update current user
export async function PUT(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get user data
    const userData = await request.json()

    // Remove sensitive fields
    delete userData.password
    delete userData.email
    delete userData.xp
    delete userData.level
    delete userData.streak
    delete userData.badges

    // Update user
    const updatedUser = await User.findByIdAndUpdate(user._id, userData, { new: true }).select("-password")

    return NextResponse.json({ success: true, data: updatedUser }, { status: 200 })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
