import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/mongodb"
import User from "../../../../models/User"
import Task from "../../../../models/Task"
import { getUserFromToken } from "../../../../lib/auth"

// Update user XP
export async function POST(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get XP data
    const { xpGain, taskId } = await request.json()

    if (!xpGain || typeof xpGain !== "number" || xpGain <= 0) {
      return NextResponse.json({ success: false, message: "Valid XP gain is required" }, { status: 400 })
    }

    // Verify that the task exists and belongs to the user (if taskId is provided)
    if (taskId) {
      const task = await Task.findOne({ _id: taskId, user: user._id })
      if (!task) {
        return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
      }
    }

    // Update user XP
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        $inc: { xp: xpGain },
        // Calculate level based on XP (1 level per 100 XP)
        $set: { level: Math.floor((user.xp + xpGain) / 100) + 1 } 
      },
      { new: true }
    )

    // Check if user earned a streak point today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastStreak = user.lastStreakDate ? new Date(user.lastStreakDate) : null
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    let streakUpdated = false
    let newStreak = user.streak || 0
    
    // If no streak date or it was yesterday, increment streak
    if (!lastStreak || 
        (lastStreak.getTime() <= yesterday.getTime() && 
         lastStreak.getTime() >= yesterday.setHours(0, 0, 0, 0))) {
      newStreak += 1
      streakUpdated = true
    } 
    // If streak date is before yesterday, reset streak to 1
    else if (lastStreak.getTime() < yesterday.getTime()) {
      newStreak = 1
      streakUpdated = true
    }
    
    // Update streak if needed
    if (streakUpdated) {
      await User.findByIdAndUpdate(
        user._id,
        { 
          $set: { 
            streak: newStreak,
            lastStreakDate: today
          } 
        }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        xp: updatedUser.xp, 
        level: updatedUser.level,
        streak: streakUpdated ? newStreak : user.streak
      } 
    }, { status: 200 })
  } catch (error) {
    console.error("Update XP error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
} 