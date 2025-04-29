import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Task from '@/models/Task';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    // Get the body data
    const body = await request.json();
    const { id, completed } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Convert string ID to ObjectId if needed
    const taskId = typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) 
      ? new ObjectId(id) 
      : id;

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify this task belongs to the current user
    if (task.userId && task.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this task' },
        { status: 403 }
      );
    }

    // Update the task's completed status
    task.completed = completed;
    
    // Save the updated task
    await task.save();

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

// Handle other methods to prevent 405 errors
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  );
}