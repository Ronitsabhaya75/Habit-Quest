import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Get the body data
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Authenticate the user using getUserFromToken
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Convert string ID to ObjectId if needed
    let taskId;
    try {
      taskId = typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) 
        ? new ObjectId(id) 
        : id;
    } catch (error) {
      console.error('Invalid task ID format:', id);
      return NextResponse.json(
        { success: false, message: 'Invalid task ID format' },
        { status: 400 }
      );
    }

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify this task belongs to the current user
    if (task.user && task.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this task' },
        { status: 403 }
      );
    }

    // Save the previous completion state before updates
    const wasCompletedBefore = task.completed;
    
    // Update allowed fields from the request body
    const allowedFields = [
      'title', 'description', 'dueDate', 'dueDateString', 'completed', 
      'xpReward', 'isHabit', 'isRecurring', 'frequency', 'recurringEndDate'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        task[field] = body[field];
      }
    }
    
    // Handle special case for completion state change
    if (body.completed === true && !wasCompletedBefore) {
      task.completedAt = new Date();
      
      // Award XP to the user and update streak
      if (user) {
        try {
          // Get current date (normalized to midnight)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Get last active date (normalized to midnight)
          const lastActive = user.lastActive ? new Date(user.lastActive) : null;
          if (lastActive) {
            lastActive.setHours(0, 0, 0, 0);
          }
          
          // Check if this is first activity today
          const isFirstActivityToday = !lastActive || 
            lastActive.toISOString().split('T')[0] !== today.toISOString().split('T')[0];
          
          // Update streak calculation
          let newStreak = user.streak || 0;
          
          if (isFirstActivityToday) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            // If last active was yesterday, increment streak
            if (lastActive && lastActive.toISOString().split('T')[0] === yesterdayStr) {
              newStreak += 1;
              console.log(`Streak increased to ${newStreak} - last active was yesterday`);
            } 
            // If last active was before yesterday, reset streak to 1
            else if (!lastActive || lastActive.toISOString().split('T')[0] !== today.toISOString().split('T')[0]) {
              newStreak = 1;
              console.log(`Streak reset to 1 - wasn't active yesterday`);
            }
            // Otherwise keep streak (already active today)
          }
          
          // Update user with XP and streak info
          const updateData = {
            $inc: { xp: task.xpReward || 10 },
            $set: { 
              lastActive: new Date(),
              streak: newStreak
            }
          };
          
          const updatedUser = await User.findByIdAndUpdate(
            user._id, 
            updateData,
            { new: true } // Return updated document
          );
          
          console.log(`User streak updated: ${newStreak}, XP added: ${task.xpReward || 10}`);
        } catch (error) {
          console.error("Error updating user streak/XP:", error);
        }
      }
    }
    
    // Handle date field normalization for dueDateString
    if (body.dueDate && !body.dueDateString) {
      const dueDate = new Date(body.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      task.dueDateString = dueDate.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    // Save the updated task
    await task.save();
    
    // If this is a recurring task that was just completed, check if we need to create the next instance
    let nextInstance = null;
    if (body.completed === true && !wasCompletedBefore && task.isRecurring) {
      try {
        // Use the static method from Task model
        nextInstance = await Task.createNextRecurringInstance(task, user._id);
      } catch (error) {
        console.error('Error creating next recurring instance:', error);
        // Continue with the response even if next instance creation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
      nextInstance
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

// Support PUT method as well
export async function PUT(request) {
  return POST(request);
}

// Handle other methods to prevent 405 errors
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Use POST or PUT instead.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Use POST or PUT instead.' },
    { status: 405 }
  );
}