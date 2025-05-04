import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import { getUserFromToken } from "../../../lib/auth";
import Task from "../../../models/Task";
import { formatDateForAPI } from "../../../utils/dateUtils";

// Get all tasks for the current user
export async function GET(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month");

    // Build query
    const query = { user: user._id };

    // Handle different types of date queries
    if (month) {
      // Month-based query (YYYY-MM format)
      console.log("Fetching tasks for month:", month);
      
      // Validate month format (YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid month format. Use YYYY-MM format."
        }, { status: 400 });
      }
      
      // Extract year and month
      const [year, monthNum] = month.split('-').map(Number);
      
      // Create date range for the entire month
      const startDate = new Date(year, monthNum - 1, 1); // Month is 0-indexed in JS
      const endDate = new Date(year, monthNum, 0); // Last day of month
      
      // Format for consistent comparison
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      
      console.log(`Querying tasks from ${startDateString} to ${endDateString}`);
      
      // Query by dueDateString range which is more reliable across timezones
      query.dueDateString = {
        $gte: startDateString,
        $lte: endDateString
      };
    } else if (date) {
      // Single day query
      // Parse the date parameter - The date is expected to be in YYYY-MM-DD format
      // No need to create a new Date object that might introduce timezone issues
      const dateString = date.includes('T') ? date.split('T')[0] : date;
      
      // Debug logging
      console.log("Date parameter:", date);
      console.log("Normalized date string:", dateString);
      
      // Query by dueDateString which is more reliable across timezones
      query.dueDateString = dateString;
      
      console.log("Final query:", JSON.stringify(query));
    }

    // Get tasks
    const tasks = await Task.find(query).sort({ dueDate: 1 });
    console.log(`Found ${tasks.length} tasks for ${month ? 'month ' + month : date ? 'date ' + date : 'all dates'}`);
    
    // Print each task if found for debugging
    if (tasks.length > 0 && tasks.length < 10) {
      tasks.forEach(task => {
        console.log(`Task: ${task.title}, dueDate: ${task.dueDate}, dueDateString: ${task.dueDateString}, isHabit: ${task.isHabit}`);
      });
    } else if (tasks.length >= 10) {
      console.log(`Found ${tasks.length} tasks, too many to log individually`);
    }

    return NextResponse.json({ success: true, data: tasks }, { status: 200 });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

// Create a new task
export async function POST(request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get user from token
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    // Get task data from request
    const taskData = await request.json();
    
    // Validate required fields
    if (!taskData.title) {
      return NextResponse.json({
        success: false,
        message: "Task title is required"
      }, { status: 400 });
    }
    
    // Add date string for easier filtering - ensure consistent format
    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      // Set time to midnight to avoid timezone issues
      dueDate.setHours(0, 0, 0, 0);
      taskData.dueDate = dueDate;
      taskData.dueDateString = dueDate.toISOString().split('T')[0]; // YYYY-MM-DD
      console.log("Creating task with due date:", taskData.dueDate, "string:", taskData.dueDateString);
    }
    
    // Create new task
    const newTask = new Task({
      ...taskData,
      user: user._id,
      completed: false,
      completedAt: null
    });
    
    // Save the task
    await newTask.save();
    
    // Log specific details about recurring tasks for debugging
    if (taskData.isRecurring) {
      console.log(`Created recurring task with frequency: ${taskData.frequency}, start date: ${taskData.dueDate}, end date: ${taskData.recurringEndDate || 'none'}`);
    }
    
    return NextResponse.json({
      success: true,
      data: newTask
    }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Server error"
    }, { status: 500 });
  }
}