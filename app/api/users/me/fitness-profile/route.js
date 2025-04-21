import { NextResponse } from "next/server"
import connectToDatabase from "../../../../../lib/mongodb"
import User from "../../../../../models/User"
import { getUserFromToken } from "../../../../../lib/auth"

// Get fitness profile
export async function GET(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get user
    const userObj = await User.findById(user._id).select("fitnessProfile")

    return NextResponse.json({ success: true, data: userObj.fitnessProfile || {} }, { status: 200 })
  } catch (error) {
    console.error("Get fitness profile error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Update fitness profile
export async function PUT(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get fitness profile data
    const fitnessProfileData = await request.json()

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { fitnessProfile: fitnessProfileData },
      { new: true },
    ).select("fitnessProfile")

    return NextResponse.json({ success: true, data: updatedUser.fitnessProfile }, { status: 200 })
  } catch (error) {
    console.error("Update fitness profile error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
