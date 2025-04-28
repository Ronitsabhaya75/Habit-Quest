import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/mongodb"
import Task from "../../../../models/Task"
import User from "../../../../models/User"
import { getUserFromToken } from "../../../../lib/auth"
import { getNextOccurrenceDate, shouldCreateNextInstance } from '../../../../utils/dateUtils'

// Update task via PUT or POST for compatibility
export async function PUT(request) {
  return handleTaskUpdate(request)
}

// Add POST support for platforms that don't support PUT (like Vercel Edge)
export async function POST(request) {
  return handleTaskUpdate(request)
}

// Handle task update with shared logic
async function handleTaskUpdate(request) {
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
    if (!taskData.id) {
      return NextResponse.json({ success: false, message: "Task ID is required" }, { status: 400 })
    }

    // Find the task
    const task = await Task.findOne({ _id: taskData.id, user: user._id })

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    // Create update object with only valid fields
    const updateFields = {}
    
    if (taskData.title !== undefined) updateFields.title = taskData.title
    if (taskData.description !== undefined) updateFields.description = taskData.description
    if (taskData.completed !== undefined) updateFields.completed = taskData.completed
    if (taskData.dueDate !== undefined) updateFields.dueDate = taskData.dueDate
    if (taskData.estimatedTime !== undefined) updateFields.estimatedTime = taskData.estimatedTime
    if (taskData.isHabit !== undefined) updateFields.isHabit = taskData.isHabit
    if (taskData.frequency !== undefined) updateFields.frequency = taskData.frequency
    if (taskData.recurringEndDate !== undefined) updateFields.recurringEndDate = taskData.recurringEndDate
    
    // Check if this is a task completion update
    const completingTask = taskData.completed && !task.completed

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskData.id,
      { $set: updateFields },
      { new: true }
    )

    // Create next instance for recurring tasks if being completed
    let nextInstanceTask = null
    if (completingTask && task.isRecurring && shouldCreateNextInstance(task)) {
      const nextDueDate = getNextOccurrenceDate(
        task.dueDate,
        task.frequency || 'daily',
        task.recurringEndDate
      )
      
      if (nextDueDate) {
        const parentId = task.parentTaskId || task._id
        
        // Create the next instance
        nextInstanceTask = new Task({
          title: task.title,
          description: task.description,
          dueDate: nextDueDate,
          completed: false,
          completedAt: null,
          xpReward: task.xpReward,
          isHabit: task.isHabit,
          isRecurring: true,
          frequency: task.frequency,
          recurringEndDate: task.recurringEndDate,
          parentTaskId: parentId,
          user: user._id
        })
        
        // Set dueDateString for proper filtering
        nextInstanceTask.dueDateString = nextDueDate.toISOString().split('T')[0]
        
        await nextInstanceTask.save()
        console.log(`Created next recurring instance for task ${task.title} with due date ${nextDueDate}`)
      }
    }

    // Add XP for task completion
    if (completingTask) {
      try {
        const userObj = await User.findById(user._id)
        if (userObj) {
          // Add XP for completing the task (default 20 if no specific reward)
          const xpGain = task.xpReward || 20
          userObj.xp = (userObj.xp || 0) + xpGain
          await userObj.save()
        }
      } catch (error) {
        console.error("Error updating user XP:", error)
        // Continue with task update even if XP update fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedTask,
      nextInstance: nextInstanceTask 
    }, { status: 200 })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
} 