import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Achievement from "@/models/Achievement"
import User from "@/models/User"
import { getUserFromToken } from "@/lib/auth"

// Get all achievements with user progress
export async function GET(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get all achievements
    const achievements = await Achievement.find().sort({ threshold: 1 })

    // Get user with achievements
    const userObj = await User.findById(user._id)

    // Map achievements with user progress
    const achievementsWithProgress = achievements.map((achievement) => {
      const userAchievement = userObj.achievements.find(
        (a) => a.achievementId.toString() === achievement._id.toString(),
      )

      return {
        _id: achievement._id,
        name: achievement.name,
        description: achievement.description,
        xpReward: achievement.xpReward,
        criteria: achievement.criteria,
        threshold: achievement.threshold,
        progress: userAchievement ? userAchievement.progress : 0,
        completed: userAchievement ? userAchievement.completed : false,
        completedAt: userAchievement ? userAchievement.completedAt : null,
      }
    })

    return NextResponse.json({ success: true, data: achievementsWithProgress }, { status: 200 })
  } catch (error) {
    console.error("Get achievements error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
