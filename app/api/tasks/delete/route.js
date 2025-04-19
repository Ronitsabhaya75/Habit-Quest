import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Task from "@/models/Task"
import { getUserFromToken } from "@/lib/auth"

// Delete task
export async function DELETE(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get task ID from request body
    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ success: false, message: "Task ID is required" }, { status: 400 })
    }

    // Find and delete task
    const task = await Task.findOneAndDelete({
      _id: taskId,
      user: user._id,
    })

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { message: "Task deleted successfully" } }, { status: 200 })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
} 