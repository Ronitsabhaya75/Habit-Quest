import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Task from "@/models/Task"
import User from "@/models/User"
import { getUserFromToken } from "@/lib/auth"

// Get a single task
export async function GET(request, { params }) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get task
    const task = await Task.findOne({
      _id: params.id,
      user: user._id,
    })

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: task }, { status: 200 })
  } catch (error) {
    console.error("Get task error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Update a task
export async function PUT(request, { params }) {
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

    // Find the task
    const task = await Task.findOne({
      _id: params.id,
      user: user._id,
    })

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    // Check if task is being marked as completed
    const isCompletingTask = !task.completed && taskData.completed

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      params.id,
      {
        ...taskData,
        completedAt: taskData.completed ? new Date() : null,
      },
      { new: true },
    )

    // If task is being completed, award XP
    if (isCompletingTask) {
      const userObj = await User.findById(user._id)
      userObj.addXP(task.xpReward)
      await userObj.save()
    }

    return NextResponse.json({ success: true, data: updatedTask }, { status: 200 })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Delete a task
export async function DELETE(request, { params }) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Delete task
    const task = await Task.findOneAndDelete({
      _id: params.id,
      user: user._id,
    })

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
