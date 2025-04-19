import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import User from "@/models/User"
import connectToDatabase from "./mongodb"

// Generate JWT token
export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  })
}

// Verify JWT token
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// Get current user from request
export async function getCurrentUser() {
  try {
    // Get token from cookie - properly awaiting cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return null
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    // Connect to database
    await connectToDatabase()

    // Find user
    const user = await User.findById(decoded.id).select("-password")
    return user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}
