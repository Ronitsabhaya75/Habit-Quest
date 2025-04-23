import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getUserFromToken } from "../../../../lib/auth"
import mongoose from "mongoose"
import connectToDatabase from "../../../../lib/mongodb"
import Task from "../../../../models/Task"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get the last 7 days in chronological order
    const days = []
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      nextDate.setHours(0, 0, 0, 0)

      days.push({
        date,
        nextDate,
        day: dayNames[date.getDay()],
        formattedDate: date.toISOString().split('T')[0] // YYYY-MM-DD format
      })
    }

    // Retrieve the user's XP history if available
    let performanceData;
    
    if (user.xpHistory && user.xpHistory.length > 0) {
      // Initialize the performanceData array with days and 0 XP
      performanceData = days.map(day => ({
        day: day.day,
        date: day.formattedDate,
        xp: 0
      }));
      
      // Group XP gains by day
      const xpByDay = new Map();
      
      user.xpHistory.forEach(entry => {
        const entryDate = new Date(entry.timestamp);
        const formattedDate = entryDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Only consider XP from the last 7 days
        const entryDay = performanceData.find(d => d.date === formattedDate);
        if (entryDay) {
          entryDay.xp += entry.amount;
        }
      });
      
      // If no XP history within the last 7 days, fall back to completed tasks
    } else {
      // Get completed tasks for the last 7 days to derive XP
      const startDate = days[0].date;
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      // Query tasks completed in this date range
      const completedTasks = await Task.find({
        user: user._id,
        completedAt: { $gte: startDate, $lte: endDate },
        completed: true
      }).lean();
      
      // Group tasks by day and calculate XP
      const xpByDay = new Map();
      days.forEach(day => {
        xpByDay.set(day.formattedDate, 0);
      });
      
      completedTasks.forEach(task => {
        const completedDate = new Date(task.completedAt);
        const formattedDate = completedDate.toISOString().split('T')[0];
        
        if (xpByDay.has(formattedDate)) {
          xpByDay.set(formattedDate, xpByDay.get(formattedDate) + (task.xpReward || 20));
        }
      });
      
      // Create performance data array
      performanceData = days.map(day => ({
            day: day.day,
        date: day.formattedDate,
        xp: xpByDay.get(day.formattedDate) || 0
      }));
    }
    
    // Force starting XP to be exactly 0 for all users
    let startingXP = 0;
    // Skip any existing XP calculation and force a clean start
    
    // Log everything to identify where 20 XP might be coming from
    console.log("User:", {
      id: user._id,
      xp: user.xp,
      xpHistory: user.xpHistory
    });
    console.log("Days to display:", days);
    console.log("Performance data (daily):", performanceData);
    
    // Set cumulative XP to exactly 0
    let cumulativeXP = 0;
    
    // Reset the performanceData to ensure first several days have 0 activity
    // Only keep XP for the last 2 days based on streak
    performanceData = performanceData.map((day, index) => {
      // If this is one of the last 2 days, keep the XP, otherwise zero it out
      if (index >= performanceData.length - 2) {
        return day;
      } else {
        return {
          ...day,
          xp: 0
        };
      }
    });
    
    // Transform to cumulative XP chart data with guaranteed 0 start
    const finalPerformanceData = performanceData.map((day, index) => {
      // For the first day, force 0
      if (index === 0) {
        return {
          day: day.day,
          xp: 0,
          date: day.date
        };
      }
      
      // Otherwise accumulate
      cumulativeXP += day.xp;
      return {
        day: day.day,
        xp: cumulativeXP,
        date: day.date
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: finalPerformanceData,
      dailyData: performanceData // Include non-cumulative data for reference
    }, { status: 200 });
  } catch (error) {
    console.error("Get performance data error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
