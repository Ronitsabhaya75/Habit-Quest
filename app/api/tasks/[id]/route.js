import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/mongodb"
import Task from "../../../../models/Task"
import User from "../../../../models/User"
import { getUserFromToken } from "../../../../lib/auth"
import { getNextOccurrenceDate, shouldCreateNextInstance } from '../../../../utils/dateUtils'

// Get a specific task by ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    await connectToDatabase()
    
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const task = await Task.findOne({ _id: id, user: user._id })
    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: task }, { status: 200 })
  } catch (error) {
    console.error("Get task by ID error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}

// Update a specific task by ID
export async function PUT(request, { params }) {
  try {
    const { id } = params
    await connectToDatabase()
    
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    // Find the task to update
    const task = await Task.findOne({ _id: id, user: user._id })
    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }
    
    const updateData = await request.json()
    
    // Check if this is a task completion update
    const completingTask = updateData.completed && !task.completed
    let nextInstanceTask = null
    
    // Apply the updates to the task
    Object.assign(task, updateData)
    
    // If completing a task, set the completedAt timestamp
    if (completingTask) {
      task.completedAt = new Date()
      
      // Update user XP and streak
      try {
        const user = await User.findById(task.user)
        if (user) {
          // Award XP for completing the task
          const xpGain = task.xpReward || 10
          user.xp = (user.xp || 0) + xpGain
          
          // Update streak if needed
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const lastActive = user.lastActive ? new Date(user.lastActive) : null
          if (lastActive) {
            lastActive.setHours(0, 0, 0, 0)
            
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            
            if (lastActive.getTime() === yesterday.getTime()) {
              // If last active was yesterday, increment streak
              user.streak = (user.streak || 0) + 1
            } else if (lastActive.getTime() < yesterday.getTime()) {
              // If last active was before yesterday, reset streak
              user.streak = 1
            }
            // If last active is today, keep streak as is
          } else {
            // First activity, start streak at 1
            user.streak = 1
          }
          
          // Update lastActive to today
          user.lastActive = today
          
          await user.save()
        }
      } catch (error) {
        console.error("Error updating user XP/streak:", error)
        // Continue with task update even if XP update fails
      }
      
      // If this is a recurring task, create the next instance
      if (task.isRecurring && shouldCreateNextInstance(task)) {
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
            isRecurring: true,
            frequency: task.frequency,
            recurringEndDate: task.recurringEndDate,
            parentTaskId: parentId,
            user: user._id
          })
          
          await nextInstanceTask.save()
        }
      }
    }
    
    // Save the updated task
    await task.save()
    
    // Return the updated task and the newly created instance if applicable
    return NextResponse.json({ 
      success: true, 
      data: task,
      nextInstance: nextInstanceTask
    }, { status: 200 })
  } catch (error) {
    console.error("Update task by ID error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}

// Delete a specific task by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await connectToDatabase()
    
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    // Find the task to delete
    const task = await Task.findOne({ _id: id, user: user._id })
    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }
    
    // Check for delete recurring flag in search params
    const { searchParams } = new URL(request.url)
    const deleteRecurring = searchParams.get("deleteRecurring") === "true"
    
    // If this is a recurring task and deleteRecurring is true, delete all future instances
    if (task.isRecurring && deleteRecurring) {
      // Delete all tasks with this parent (including this one if it has a parent)
      if (task.parentTaskId) {
        await Task.deleteMany({
          $or: [
            { _id: id },
            { parentTaskId: task.parentTaskId }
          ],
          user: user._id
        })
      } else {
        // This is the parent task, delete it and all its children
        await Task.deleteMany({
          $or: [
            { _id: id },
            { parentTaskId: id }
          ],
          user: user._id
        })
      }
    } else {
      // Just delete this specific task
      await Task.findByIdAndDelete(id)
    }
    
    return NextResponse.json({ success: true, message: "Task deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete task by ID error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}
