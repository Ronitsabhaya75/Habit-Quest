import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/mongodb"
import Task from "../../../../models/Task"
import User from "../../../../models/User"
import { getUserFromToken } from "../../../../lib/auth"

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
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
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

    // Get update data
    const updateData = await request.json()

    // Find and update task
    const task = await Task.findOneAndUpdate(
      {
        _id: params.id,
        user: user._id,
      },
      updateData,
      { new: true, runValidators: true }
    )

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    // If task is marked as completed, award XP to the user
    if (updateData.completed === true && !task.completedAt) {
      // Set completedAt date if not already set
      task.completedAt = new Date()
      await task.save()

      // Award XP to user
      const userObj = await User.findById(user._id)
      userObj.addXP(task.xpReward || 20)
      await userObj.save()
    }

    return NextResponse.json({ success: true, data: task }, { status: 200 })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
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

    // Find and delete task
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
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}
