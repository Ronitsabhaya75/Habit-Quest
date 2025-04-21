import { NextResponse } from "next/server"
import connectToDatabase from "../../../lib/mongodb"
import Task from "../../../models/Task"
import { getUserFromToken } from "../../../lib/auth"
import User from "../../../models/User"
import { getNextOccurrenceDate, shouldCreateNextInstance } from '../../../utils/dateUtils'

// Get all tasks for the current user
export async function GET(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    // Build query
    const query = { user: user._id }

    // If date is provided, filter by date
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      query.dueDate = { $gte: startDate, $lte: endDate }
    }

    // Get tasks
    const tasks = await Task.find(query).sort({ dueDate: 1 })

    return NextResponse.json({ success: true, data: tasks }, { status: 200 })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}

// Create a new task
export async function POST(request) {
  try {
    console.log("Starting task creation...")
    await connectToDatabase()
    console.log("Database connected")
    
    const user = await getUserFromToken(request)
    console.log("User authentication:", user ? `successful for ${user._id}` : "failed")
    
    if (!user) {
      console.log("Authentication failed: No user found from token")
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    let body
    try {
      body = await request.json()
      console.log("Request body parsed:", JSON.stringify(body))
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    
    const { title, description, dueDate, xpReward, isHabit, isRecurring, frequency, recurringEndDate } = body
    
    // Detailed validation logging
    if (!title) {
      console.log("Validation failed: Missing title")
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    
    if (!dueDate) {
      console.log("Validation failed: Missing dueDate")
      return NextResponse.json({ error: 'Due date is required' }, { status: 400 })
    }
    
    try {
      const parsedDate = new Date(dueDate)
      if (isNaN(parsedDate.getTime())) {
        console.log("Validation failed: Invalid date format for dueDate:", dueDate)
        return NextResponse.json({ error: 'Invalid due date format' }, { status: 400 })
      }
      console.log("Date parsed successfully:", parsedDate)
    } catch (error) {
      console.error("Error parsing date:", error)
      return NextResponse.json({ error: 'Invalid due date format' }, { status: 400 })
    }
    
    // Create task with proper date handling
    try {
      const task = await Task.create({
        user: user._id,
        title,
        description,
        dueDate: new Date(dueDate),
        xpReward: xpReward || 10,
        isHabit: isHabit || false,
        isRecurring: isRecurring || false,
        frequency: frequency || 'daily',
        recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null
      })
      
      console.log("Task created successfully:", task._id)
      return NextResponse.json({ task }, { status: 200 })
    } catch (dbError) {
      console.error("Database error creating task:", dbError)
      return NextResponse.json({ 
        error: 'Failed to create task in database', 
        details: dbError.message 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating task:', error)
    // Detailed error information
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      name: error.name,
      code: error.code
    }, { status: 500 })
  }
}

// Update a task
export async function PUT(request) {
  try {
    await connectToDatabase()
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const requestData = await request.json()
    const { id, updateAllInstances, ...updateData } = requestData
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Task ID is required" }, { status: 400 })
    }
    
    // Find the task to update
    const task = await Task.findOne({ _id: id, user: user._id })
    
    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }
    
    // Check if this is a task completion update
    const completingTask = updateData.completed && !task.completed
    let nextInstanceTask = null
    let updatedTasks = []
    
    // If updateAllInstances is true and this is a recurring task,
    // update all future instances of this task
    if (updateAllInstances && task.isRecurring) {
      const parentId = task.parentTaskId || task._id
      
      // Get all future tasks in this recurring series (not yet completed)
      const futureTasks = await Task.find({
        $or: [
          { _id: parentId },
          { parentTaskId: parentId }
        ],
        user: user._id,
        completed: false,
        dueDate: { $gte: task.dueDate }
      })
      
      // Update all future tasks
      for (const futureTask of futureTasks) {
        // Don't change completion status for future tasks
        const futureTaskUpdates = { ...updateData }
        if (futureTask._id.toString() !== id) {
          delete futureTaskUpdates.completed
          delete futureTaskUpdates.completedAt
        }
        
        Object.assign(futureTask, futureTaskUpdates)
        await futureTask.save()
        updatedTasks.push(futureTask)
      }
    } else {
      // Apply the updates to just this task
      Object.assign(task, updateData)
      
      // If completing a task, set the completedAt timestamp
      if (completingTask) {
        task.completedAt = new Date()
        
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
      updatedTasks = [task]
    }
    
    // Return the updated tasks and the newly created instance if applicable
    return NextResponse.json({ 
      success: true, 
      data: updatedTasks.length === 1 ? updatedTasks[0] : updatedTasks,
      nextInstance: nextInstanceTask
    }, { status: 200 })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}

// Delete a task
export async function DELETE(request) {
  try {
    await connectToDatabase()
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const deleteRecurring = searchParams.get("deleteRecurring") === "true"
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Task ID is required" }, { status: 400 })
    }
    
    // Find the task to delete
    const task = await Task.findOne({ _id: id, user: user._id })
    
    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }
    
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
    console.error("Delete task error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}
