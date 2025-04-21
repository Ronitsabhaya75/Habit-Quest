import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "../../../lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userInput, activeTasks, messages } = await request.json()

    // Get the user for personalization
    const user = await getUserFromToken(request)
    const username = user?.username || "there"

    // Generate appropriate response based on user input
    const result = generateResponse(userInput, activeTasks, messages, username)
    
    // Format the response to match what the component expects
    return NextResponse.json(result)
  } catch (error) {
    console.error("AI API Error:", error)
    return NextResponse.json({ message: "Sorry, I'm having trouble connecting right now. Please try again later." }, { status: 200 })
  }
}

// Response generator with task awareness
function generateResponse(userInput: string, activeTasks: any[], messages: any[], username: string): any {
  const input = userInput.toLowerCase()
  let action = null;
  
  console.log("AI processing input:", input); // Debug log
  
  // Task creation - expanded patterns
  if (
    input.includes("add task") || 
    input.includes("create task") || 
    input.includes("new task") ||
    input.includes("add a task") ||
    input.includes("create a task") ||
    (input.includes("add") && input.includes("task")) ||
    (input.includes("create") && input.includes("task")) ||
    (input.includes("add me") && input.includes("task")) ||
    (input.includes("add me a") && input.includes("task"))
  ) {
    console.log("Task creation intent detected"); // Debug log
    
    // More flexible task title extraction
    let taskTitle = "";
    
    // Try different patterns to extract task title
    const patterns = [
      // Standard patterns
      /(?:add|create|new) task (?:called |named |titled |")?([^"]+)(?:"|)/i,
      // "Add me a task" pattern
      /add me a task (?:called |named |titled |about |for |)(?:")?([^"]+)(?:"|)/i,
      // "Add me task" pattern
      /add me task (?:called |named |titled |about |for |)(?:")?([^"]+)(?:"|)/i,
      // General extraction after "task" keyword
      /task (?:called |named |titled |about |for |)(?:")?([^"]+)(?:"|)/i,
      // Last resort - extract everything after "task"
      /task(?:s|) (.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        taskTitle = match[1].trim();
        console.log("Found task title:", taskTitle); // Debug log
        break;
      }
    }
    
    // If we still don't have a title, just use whatever comes after "task"
    if (!taskTitle && input.includes("task")) {
      const parts = input.split("task");
      if (parts.length > 1) {
        taskTitle = parts[1].trim();
        // Remove leading "for", "about", etc.
        taskTitle = taskTitle.replace(/^(for|about|called|named|titled)\s+/i, "");
      }
    }
    
    // If we have a task title, create the task
    if (taskTitle) {
      let dateObj = new Date();
      
      // Create the task action
      action = {
        type: 'addTask',
        payload: {
          title: taskTitle,
          date: dateObj.toISOString()
        }
      };
      
      // Determine when the task is for
      if (input.includes("tomorrow")) {
        dateObj.setDate(dateObj.getDate() + 1);
        action.payload.date = dateObj.toISOString();
        return {
          message: `I've added "${taskTitle}" to your tasks for tomorrow.`,
          action
        }
      } else if (input.includes("next week")) {
        dateObj.setDate(dateObj.getDate() + 7);
        action.payload.date = dateObj.toISOString();
        return {
          message: `I've added "${taskTitle}" to your tasks for next week.`,
          action
        }
      } else {
        // Default to today
        return {
          message: `I've added "${taskTitle}" to your tasks for today.`,
          action
        }
      }
    } else {
      return { message: "What would you like to name this task?" }
    }
  }
  
  // Task completion
  if (input.includes("complete") || input.includes("finish") || input.includes("done")) {
    const taskMatch = input.match(/(?:complete|finish|done)(?:d)? (?:the |my |)(?:task |)(?:called |named |titled |")?([^"]+)(?:"|)/i)
    if (taskMatch && taskMatch[1]) {
      const taskTitle = taskMatch[1].trim().toLowerCase()
      const task = activeTasks.find((t: any) => t.title.toLowerCase() === taskTitle)
      
      if (task) {
        action = {
          type: 'completeTask',
          payload: {
            taskId: task.id
          }
        };
        return {
          message: `Great job! I've marked "${task.title}" as completed.`,
          action
        }
      } else {
        return { message: `I couldn't find a task called "${taskMatch[1]}". Would you like me to add it as a new task?` }
      }
    }
  }
  
  // Task status inquiry
  if (input.includes("task") && (input.includes("status") || input.includes("progress"))) {
    const completedCount = activeTasks.filter((t: any) => t.completed).length
    const totalTasks = activeTasks.length
    
    if (totalTasks === 0) {
      return { message: "You don't have any tasks yet. Would you like to create one?" }
    }
    
    const percentComplete = Math.round((completedCount / Math.max(totalTasks, 1)) * 100)
    
    action = {
      type: 'showProgress',
      payload: {
        completed: completedCount,
        total: totalTasks,
        percent: percentComplete
      }
    };
    
    if (percentComplete === 100) {
      return {
        message: `Amazing work! You've completed all ${totalTasks} of your tasks today!`,
        action
      }
    } else if (percentComplete > 75) {
      return {
        message: `You're doing great! You've completed ${completedCount} out of ${totalTasks} tasks (${percentComplete}%). Almost there!`,
        action
      }
    } else if (percentComplete > 50) {
      return {
        message: `Good progress! You've completed ${completedCount} out of ${totalTasks} tasks (${percentComplete}%). Keep going!`,
        action
      }
    } else if (percentComplete > 0) {
      return {
        message: `You've completed ${completedCount} out of ${totalTasks} tasks (${percentComplete}%). You can do this!`,
        action
      }
    } else {
      return {
        message: `You have ${totalTasks} tasks to complete today. Let's get started!`,
        action
      }
    }
  }
  
  // Help
  if (input.includes("help") || input.includes("assist") || input.includes("what can you do")) {
    return {
      message: `I can help you manage your tasks and habits, ${username}. Try asking me things like:
• "Add task called 'Read a book'"
• "Complete task 'Morning exercise'"
• "What's my task progress?"
• "Give me some motivation"
• "How do I build better habits?"` 
    }
  }
  
  // Greetings
  if (input.includes("hello") || input.includes("hi ") || input === "hi") {
    return { message: `Hello ${username}! How can I help you with your habits today?` }
  }
  
  // Motivation
  if (input.includes("motivate") || input.includes("motivation") || input.includes("inspire")) {
    const motivationalMessages = [
      `You've got this, ${username}! Small daily improvements lead to big results over time.`,
      "The difference between who you are and who you want to be is what you do every day.",
      "Don't count the days, make the days count!",
      "Habits are the compound interest of self-improvement.",
      "Success is the sum of small efforts repeated day in and day out.",
      "The only bad workout is the one that didn't happen.",
      "Your future is created by what you do today, not tomorrow."
    ]
    
    return { message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)] }
  }
  
  // Habit building advice
  if (input.includes("habit") && (input.includes("build") || input.includes("create") || input.includes("develop"))) {
    return {
      message: `Here are some tips for building lasting habits, ${username}:
1. Start tiny - make it so easy you can't say no
2. Anchor to existing habits (do it after something you already do)
3. Track your progress visually
4. Create a supportive environment
5. Get an accountability partner
6. Focus on identity (become the type of person who does X)
7. Celebrate small wins along the way!`
    }
  }
  
  // Default response with some personality
  const defaultResponses = [
    `I'm here to help with your tasks and habits, ${username}. You can ask me to add tasks, mark them complete, or check your progress.`,
    "I'm your AI assistant for building better habits. What would you like help with today?",
    "Need help with task management or habit building? I'm here for you!",
    "Let me know if you need help with tracking tasks, building habits, or some motivation to keep going."
  ]
  
  return { message: defaultResponses[Math.floor(Math.random() * defaultResponses.length)] }
}
