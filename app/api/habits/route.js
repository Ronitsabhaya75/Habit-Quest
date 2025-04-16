import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Habit from "@/models/Habit"
import { getUserFromToken } from "@/lib/auth"

// Get all habits for the current user
export async function GET(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get habits
    const habits = await Habit.find({ user: user._id }).sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: habits }, { status: 200 })
  } catch (error) {
    console.error("Get habits error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Create a new habit
export async function POST(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get habit data
    const habitData = await request.json()

    // Create habit
    const habit = await Habit.create({
      ...habitData,
      user: user._id,
    })

    return NextResponse.json({ success: true, data: habit }, { status: 201 })
  } catch (error) {
    console.error("Create habit error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
