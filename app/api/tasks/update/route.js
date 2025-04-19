import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Task from "@/models/Task"
import { getUserFromToken } from "@/lib/auth"

// Update task
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

    // Basic validation
    if (!taskData.taskId) {
      return NextResponse.json({ success: false, message: "Task ID is required" }, { status: 400 })
    }

    // Find the task
    const task = await Task.findOne({ _id: taskData.taskId, user: user._id })

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    // Create update object with only valid fields
    const updateFields = {}
    
    if (taskData.title !== undefined) updateFields.title = taskData.title
    if (taskData.completed !== undefined) updateFields.completed = taskData.completed
    if (taskData.dueDate !== undefined) updateFields.dueDate = taskData.dueDate
    if (taskData.estimatedTime !== undefined) updateFields.estimatedTime = taskData.estimatedTime
    if (taskData.isHabit !== undefined) updateFields.isHabit = taskData.isHabit
    
    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskData.taskId,
      { $set: updateFields },
      { new: true }
    )

    return NextResponse.json({ success: true, data: updatedTask }, { status: 200 })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
} 