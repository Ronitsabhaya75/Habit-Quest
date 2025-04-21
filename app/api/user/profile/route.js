import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import connectToDatabase from "../../../../lib/mongodb"
import User from "../../../../models/User"

export async function GET() {
  try {
    console.log("Starting profile endpoint execution")
    
    // Get token from cookie - properly awaiting the cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      console.log("No token found in cookies")
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    console.log("Token found, verifying...")
    
    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log("Token verified, user ID:", decoded.id)
    } catch (error) {
      console.error("Token verification failed:", error.message)
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // Connect to database
    console.log("Connecting to database...")
    await connectToDatabase()

    // Find user
    console.log("Finding user with ID:", decoded.id)
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      console.error("User not found for ID:", decoded.id)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    console.log("User found, returning profile data")
    return NextResponse.json({ success: true, data: user }, { status: 200 })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
