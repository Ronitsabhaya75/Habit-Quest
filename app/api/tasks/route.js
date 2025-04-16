import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Task from "@/models/Task"
import { getUserFromToken } from "@/lib/auth"

// Get all tasks for the current user
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
    const date = searchParams.get("date")

    // Build query
    const query = { user: user._id }

    // If date is provided, filter by date
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      query.dueDate = { $gte: startDate, $lte: endDate }
    }

    // Get tasks
    const tasks = await Task.find(query).sort({ dueDate: 1 })

    return NextResponse.json({ success: true, data: tasks }, { status: 200 })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Create a new task
export async function POST(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get task data
    const taskData = await request.json()

    // Create task
    const task = await Task.create({
      ...taskData,
      user: user._id,
    })

    return NextResponse.json({ success: true, data: task }, { status: 201 })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
