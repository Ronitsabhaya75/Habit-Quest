import { NextResponse } from "next/server"
import connectToDatabase from "../../../lib/mongodb"
import Habit from "../../../models/Habit"
import Task from "../../../models/Task"
import { getUserFromToken } from "../../../lib/auth"

// Get all habits for the current user
export async function GET(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get habits
    const habits = await Habit.find({ user: user._id }).sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: habits }, { status: 200 })
  } catch (error) {
    console.error("Get habits error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Create a new habit
export async function POST(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get habit data
    const habitData = await request.json()

    // Make sure required fields exist
    if (!habitData.name) {
      return NextResponse.json({ 
        success: false, 
        message: "Habit name is required" 
      }, { status: 400 })
    }

    // Create habit
    const habit = await Habit.create({
      ...habitData,
      user: user._id,
    })

    // Create a corresponding task for today
    let habitTask = null
    try {
      console.log("Creating task for habit:", habit._id)
      
      // Format dates properly for habit task
      const startDate = habitData.startDate ? new Date(habitData.startDate) : new Date()
      const endDate = habitData.endDate ? new Date(habitData.endDate) : null
      
      // Use the static method from Task model to create a habit task
      habitTask = await Task.createHabitTask(
        {
          id: habit._id.toString(),
          name: habit.name,
          description: habit.description,
          frequency: habit.frequency || 'daily',
          startDate: startDate,
          endDate: endDate,
          xpReward: habit.xpReward || 30
        }, 
        user._id
      )
      
      // If task created successfully, log details
      if (habitTask) {
        console.log("Habit task created successfully:", {
          id: habitTask._id,
          title: habitTask.title,
          dueDate: habitTask.dueDate,
          dueDateString: habitTask.dueDateString
        })
      } else {
        console.warn("Habit task creation returned null")
      }
    } catch (taskError) {
      console.error("Error creating task for habit:", taskError)
      // Continue even if task creation fails, but include error in response
      return NextResponse.json({ 
        success: true, 
        data: habit, 
        warning: "Habit created but task creation failed: " + taskError.message 
      }, { status: 201 })
    }

    // Return success response with both habit and task data
    return NextResponse.json({ 
      success: true, 
      data: habit,
      habitTask: habitTask 
    }, { status: 201 })
  } catch (error) {
    console.error("Create habit error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}
