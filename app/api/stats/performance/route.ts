import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

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

    // Check if user is new (registered less than 7 days ago)
    const isNewUser = new Date().getTime() - new Date(user.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000

    // Always provide real-time data, even for new users
    // For users with 0 XP, show at least their starting point
    if (isNewUser || !user.xp || user.xp === 0) {
      // Create minimal real-time data showing the user's starting point
      // Use user's registration date as the starting point
      const userCreatedDate = new Date(user.createdAt)
      const registrationDay = userCreatedDate.getDay() // 0-6, where 0 is Sunday
      
      const performanceData = days.map((day, index) => {
        // If this day is on or after registration, set 0 XP (starting point)
        // Otherwise, make it null (no data for days before registration)
        const currentDayName = day.day;
        const currentDayIndex = dayNames.indexOf(currentDayName);
        const daysSinceRegistration = (currentDayIndex >= registrationDay)
          ? currentDayIndex - registrationDay
          : 7 - registrationDay + currentDayIndex;
        
        // For days since registration, show 0 XP as starting point
        // For days after today, show null
        if (index === 6) {
          // Today always shows the current XP
          return {
            day: day.day,
            xp: user.xp || 0
          }
        } else if (daysSinceRegistration <= 6 - index) {
          // This is after registration but before today
          return {
            day: day.day,
            xp: 0 // Starting point
          }
        } else {
          // This is before registration
          return {
            day: day.day,
            xp: null // No data yet
          }
        }
      });
      
      // Filter out null values
      const filteredData = performanceData.filter(item => item.xp !== null);
      
      return NextResponse.json({ success: true, data: filteredData }, { status: 200 })
    }

    // For existing users, generate progress data based on actual user data
    // This would normally come from a database query of user activities
    // For now, we'll create simulated data based on the user's XP
    const performanceData = days.map((day, index) => {
      // Calculate a portion of their total XP for each day
      // This is just a placeholder until real activity data is implemented
      const dailyXpPercent = 0.1 + (index * 0.9 / 6); // Start at 10% and end at 100% of their XP
      const dailyXp = Math.floor(user.xp * dailyXpPercent);

      return {
        day: day.day,
        xp: dailyXp,
      }
    })

    return NextResponse.json({ success: true, data: performanceData }, { status: 200 })
  } catch (error) {
    console.error("Get performance data error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
