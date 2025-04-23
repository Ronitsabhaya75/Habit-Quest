import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import User from "../models/User"
import connectToDatabase from "./mongodb"

// Get user from token
export async function getUserFromToken(request) {
  try {
    // Get token from cookie - properly awaiting cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return null
    }

    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

    const { payload } = await jwtVerify(token, secret)

    // Connect to the database
    await connectToDatabase()

    // Get user
    const user = await User.findById(payload.id).select("-password")

    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Get user from token error:", error)
    return null
  }
}
