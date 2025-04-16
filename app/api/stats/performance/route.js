import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Task from "@/models/Task"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get the last 7 days
    const days = []
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      days.push({
        date,
        nextDate,
        day: dayNames[date.getDay()],
      })
    }

    // Get completed tasks for each day
    const performanceData = await Promise.all(
      days.map(async ({ date, nextDate, day }) => {
        // Find completed tasks for this day
        const completedTasks = await Task.find({
          user: user._id,
          completed: true,
          completedAt: { $gte: date, $lt: nextDate },
        })

        // Calculate XP earned
        const xp = completedTasks.reduce((total, task) => total + (task.xpReward || 0), 0)

        return {
          day,
          xp,
        }
      }),
    )

    return NextResponse.json({ success: true, data: performanceData }, { status: 200 })
  } catch (error) {
    console.error("Get performance data error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}
