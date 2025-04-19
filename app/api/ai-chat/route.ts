import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userInput, activeTasks, messages } = await request.json()

    // Get the user for personalization
    const user = await getUserFromToken(request)
    const username = user?.username || "there"

    // Generate appropriate response based on user input
    const response = generateResponse(userInput, activeTasks, messages, username)
    
    return NextResponse.json({ response })
  } catch (error) {
    console.error("AI API Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

// Response generator with task awareness
function generateResponse(userInput: string, activeTasks: any[], messages: any[], username: string): string {
  const input = userInput.toLowerCase()
  
  // Task creation
  if (input.includes("add task") || input.includes("create task") || input.includes("new task")) {
    const taskMatch = input.match(/(?:add|create|new) task (?:called |named |titled |")?([^"]+)(?:"|)/i)
    if (taskMatch && taskMatch[1]) {
      const taskTitle = taskMatch[1].trim()
      
      if (input.includes("tomorrow")) {
        return `I've added "${taskTitle}" to your tasks for tomorrow.`
      } else if (input.includes("next week")) {
        return `I've added "${taskTitle}" to your tasks for next week.`
      } else {
        return `I've added "${taskTitle}" to your tasks for today.`
      }
    } else {
      return "What would you like to name this task?"
    }
  }
  
  // Task completion
  if (input.includes("complete") || input.includes("finish") || input.includes("done")) {
    const taskMatch = input.match(/(?:complete|finish|done)(?:d)? (?:the |my |)(?:task |)(?:called |named |titled |")?([^"]+)(?:"|)/i)
    if (taskMatch && taskMatch[1]) {
      const taskTitle = taskMatch[1].trim().toLowerCase()
      const task = activeTasks.find((t: any) => t.title.toLowerCase() === taskTitle)
      
      if (task) {
        return `Great job! I've marked "${task.title}" as completed.`
      } else {
        return `I couldn't find a task called "${taskMatch[1]}". Would you like me to add it as a new task?`
      }
    }
  }
  
  // Task status inquiry
  if (input.includes("task") && (input.includes("status") || input.includes("progress"))) {
    const completedCount = activeTasks.filter((t: any) => t.completed).length
    const totalTasks = activeTasks.length
    
    if (totalTasks === 0) {
      return "You don't have any tasks yet. Would you like to create one?"
    }
    
    const percentComplete = Math.round((completedCount / Math.max(totalTasks, 1)) * 100)
    
    if (percentComplete === 100) {
      return `Amazing work! You've completed all ${totalTasks} of your tasks today!`
    } else if (percentComplete > 75) {
      return `You're doing great! You've completed ${completedCount} out of ${totalTasks} tasks (${percentComplete}%). Almost there!`
    } else if (percentComplete > 50) {
      return `Good progress! You've completed ${completedCount} out of ${totalTasks} tasks (${percentComplete}%). Keep going!`
    } else if (percentComplete > 0) {
      return `You've completed ${completedCount} out of ${totalTasks} tasks (${percentComplete}%). You can do this!`
    } else {
      return `You have ${totalTasks} tasks to complete today. Let's get started!`
    }
  }
  
  // Help
  if (input.includes("help") || input.includes("assist") || input.includes("what can you do")) {
    return `I can help you manage your tasks and habits, ${username}. Try asking me things like:
• "Add task called 'Read a book'"
• "Complete task 'Morning exercise'"
• "What's my task progress?"
• "Give me some motivation"
• "How do I build better habits?"`;
  }
  
  // Greetings
  if (input.includes("hello") || input.includes("hi ") || input === "hi") {
    return `Hello ${username}! How can I help you with your habits today?`
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
    
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
  }
  
  // Habit building advice
  if (input.includes("habit") && (input.includes("build") || input.includes("create") || input.includes("develop"))) {
    return `Here are some tips for building lasting habits, ${username}:
1. Start tiny - make it so easy you can't say no
2. Anchor to existing habits (do it after something you already do)
3. Track your progress visually
4. Create a supportive environment
5. Get an accountability partner
6. Focus on identity (become the type of person who does X)
7. Celebrate small wins along the way!`
  }
  
  // Default response with some personality
  const defaultResponses = [
    `I'm here to help with your tasks and habits, ${username}. You can ask me to add tasks, mark them complete, or check your progress.`,
    "I'm your AI assistant for building better habits. What would you like help with today?",
    "Need help with task management or habit building? I'm here for you!",
    "Let me know if you need help with tracking tasks, building habits, or some motivation to keep going."
  ]
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}
