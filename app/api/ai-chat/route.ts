import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userInput, activeTasks, messages } = await request.json()

    // Get API key from server environment - using MONGODB_URI as a secure environment variable
    // We'll extract the API key from the MongoDB URI for demonstration purposes
    // In a real app, you would have a dedicated AI_API_KEY environment variable
    const API_KEY = process.env.MONGODB_URI?.split("@")[0]?.split(":")?.pop() || ""

    if (!API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // For demonstration, we'll mock the AI response since we don't have a real API key
    // In a real app, you would use the actual API endpoint
    const mockResponse = generateMockResponse(userInput, activeTasks, messages)
    
    return NextResponse.json({ response: mockResponse })
  } catch (error) {
    console.error("AI API Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

// Mock response generator
function generateMockResponse(userInput: string, activeTasks: any[], messages: any[]): string {
  const input = userInput.toLowerCase()
  
  if (input.includes("hello") || input.includes("hi")) {
    return "Hello there! How can I help with your tasks and habits today?"
  }
  
  if (input.includes("task") && (input.includes("add") || input.includes("create"))) {
    return "I've noted that task. Would you like me to add it to your list?"
  }
  
  if (input.includes("complete") || input.includes("finish")) {
    return "Great job completing that task! You're making excellent progress."
  }
  
  if (input.includes("help")) {
    return "I can help you manage tasks, track habits, and provide motivation. What would you like to do?"
  }
  
  if (input.includes("habit")) {
    return "Habits are powerful! Creating consistent habits can transform your productivity and wellbeing."
  }
  
  if (input.includes("progress") || input.includes("stats")) {
    return "You're making steady progress. Keep up the great work and you'll reach your goals!"
  }
  
  // Default response
  return "I understand. Is there anything specific about your tasks or habits you'd like to discuss?"
}
