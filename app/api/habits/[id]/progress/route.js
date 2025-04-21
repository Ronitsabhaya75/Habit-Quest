import { NextResponse } from "next/server"
import connectToDatabase from "../../../../../lib/mongodb"
import Habit from "../../../../../models/Habit"
import User from "../../../../../models/User"
import { getUserFromToken } from "../../../../../lib/auth"

// Update habit progress for a specific date
export async function POST(request, { params }) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get habit
    const habit = await Habit.findOne({
      _id: params.id,
      user: user._id,
    })

    if (!habit) {
      return NextResponse.json({ success: false, message: "Habit not found" }, { status: 404 })
    }

    // Get progress data
    const { date, completed } = await request.json()

    if (!date) {
      return NextResponse.json({ success: false, message: "Date is required" }, { status: 400 })
    }

    // Check if progress for this date already exists
    const progressIndex = habit.progress.findIndex(
      (p) => new Date(p.date).toDateString() === new Date(date).toDateString(),
    )

    // Update or add progress
    if (progressIndex !== -1) {
      // If progress exists and is being marked as completed for the first time
      const wasCompletedBefore = habit.progress[progressIndex].completed
      habit.progress[progressIndex].completed = completed

      // Award XP if completing for the first time
      if (!wasCompletedBefore && completed) {
        const userObj = await User.findById(user._id)
        userObj.addXP(habit.xpReward)
        await userObj.save()
      }
    } else {
      // Add new progress
      habit.progress.push({ date, completed })

      // Award XP if completed
      if (completed) {
        const userObj = await User.findById(user._id)
        userObj.addXP(habit.xpReward)
        await userObj.save()
      }
    }

    await habit.save()

    return NextResponse.json({ success: true, data: habit }, { status: 200 })
  } catch (error) {
    console.error("Update habit progress error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
