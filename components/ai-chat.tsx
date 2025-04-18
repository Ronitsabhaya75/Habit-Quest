"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, X, Bot, Edit, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Task {
  id: number | string
  title: string
  completed: boolean
  isHabit?: boolean
  estimatedTime?: number
  isEditing?: boolean
}

interface Message {
  id: string
  text: string
  sender: "user" | "ai" | "system"
  isTaskSuggestion?: boolean
  suggestedTask?: string
  hasDate?: boolean
}

interface AIChatProps {
  user?: any
  tasks?: Task[]
  onTaskUpdate?: (taskId: string | number, completed: boolean, type?: string) => void
  onAddTaskWithDate?: (date: Date, task: Task) => void
}

export default function AIChat({ user, tasks = [], onTaskUpdate, onAddTaskWithDate }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: `Hi${user?.username ? ` ${user.username}` : ""}! I'm your Habit Coach AI. I can help track your tasks and habits.`,
      sender: "ai",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTasks, setActiveTasks] = useState<Task[]>(tasks)
  const [editingTaskId, setEditingTaskId] = useState<string | number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [apiError, setApiError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, activeTasks])

  useEffect(() => {
    setActiveTasks(tasks)
  }, [tasks])

  const handleTaskToggle = (taskId: string | number) => {
    const taskToToggle = activeTasks.find((task) => task.id === taskId)
    if (!taskToToggle) return

    const updatedTasks = activeTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    )
    setActiveTasks(updatedTasks)

    if (onTaskUpdate) {
      onTaskUpdate(taskId, !taskToToggle.completed)
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: `Marked task "${taskToToggle.title}" as ${!taskToToggle.completed ? "completed" : "not completed"}`,
        sender: "system",
      },
    ])
  }

  const startEditTask = (taskId: string | number) => {
    const task = activeTasks.find((t) => t.id === taskId)
    if (task) {
      setEditingTaskId(taskId)
      setEditValue(task.title)
    }
  }

  const saveEditTask = () => {
    if (editingTaskId && editValue.trim()) {
      const updatedTasks = activeTasks.map((task) =>
        task.id === editingTaskId ? { ...task, title: editValue.trim() } : task,
      )

      setActiveTasks(updatedTasks)

      if (onTaskUpdate) {
        const updatedTask = updatedTasks.find((t) => t.id === editingTaskId)
        if (updatedTask) {
          onTaskUpdate(editingTaskId, updatedTask.completed, "edit")
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `Updated task: "${editValue.trim()}"`,
          sender: "system",
        },
      ])

      setEditingTaskId(null)
      setEditValue("")
    }
  }

  const cancelEditTask = () => {
    setEditingTaskId(null)
    setEditValue("")
  }

  const handleKeyPressForEdit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEditTask()
    } else if (e.key === "Escape") {
      cancelEditTask()
    }
  }

  const removeTask = (taskId: string | number) => {
    const taskToRemove = activeTasks.find((t) => t.id === taskId)
    if (!taskToRemove) return

    const updatedTasks = activeTasks.filter((task) => task.id !== taskId)
    setActiveTasks(updatedTasks)

    if (onTaskUpdate) {
      onTaskUpdate(taskId, false, "remove")
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: `Removed task: "${taskToRemove.title}"`,
        sender: "system",
      },
    ])
  }

  // Enhanced date extraction
  const extractDateFromText = (text: string): Date | null => {
    const today = new Date()
    const lowerText = text.toLowerCase()

    // Handle common date references
    if (lowerText.includes("today")) {
      return today
    } else if (lowerText.includes("tomorrow")) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    } else if (lowerText.includes("next week")) {
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      return nextWeek
    } else if (lowerText.includes("next month")) {
      const nextMonth = new Date(today)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return nextMonth
    }

    // Day names
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    for (let i = 0; i < dayNames.length; i++) {
      if (lowerText.includes(dayNames[i])) {
        const targetDay = i
        const todayDay = today.getDay()
        const daysUntilTarget = (targetDay + 7 - todayDay) % 7
        const nextOccurrence = new Date(today)
        nextOccurrence.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget))
        return nextOccurrence
      }
    }

    // Date formats like MM/DD/YYYY or DD/MM/YYYY
    const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (dateMatch) {
      const [_, part1, part2, year] = dateMatch
      // Try both MM/DD and DD/MM interpretations
      const candidate1 = new Date(Number.parseInt(year), Number.parseInt(part1) - 1, Number.parseInt(part2)) // MM/DD
      const candidate2 = new Date(Number.parseInt(year), Number.parseInt(part2) - 1, Number.parseInt(part1)) // DD/MM

      if (isFinite(candidate1.getTime()) && Number.parseInt(part1) <= 12) {
        return candidate1
      } else if (isFinite(candidate2.getTime()) && Number.parseInt(part2) <= 12) {
        return candidate2
      }
    }

    // Month names like "March 15" or "15th of March"
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ]
    for (let i = 0; i < monthNames.length; i++) {
      const monthName = monthNames[i]
      if (lowerText.includes(monthName)) {
        // Look for a day number near the month name
        const dayRegex = new RegExp(
          `(\\d{1,2})(?:st|nd|rd|th)? (?:of )?${monthName}|${monthName} (\\d{1,2})(?:st|nd|rd|th)?`,
          "i",
        )
        const match = lowerText.match(dayRegex)
        if (match) {
          const day = Number.parseInt(match[1] || match[2])
          if (day > 0 && day <= 31) {
            const targetDate = new Date(today.getFullYear(), i, day)
            if (targetDate < today) {
              targetDate.setFullYear(targetDate.getFullYear() + 1)
            }
            return targetDate
          }
        }
      }
    }

    return null // No date found
  }

  // Process user input for task commands
  const processTaskCommands = (userInput: string, aiResponse: string): boolean => {
    const lowerInput = userInput.toLowerCase()
    const commandDetected = false

    // Check for completion command
    const completePattern = /\b(complete|finish|mark done|mark as done|mark completed|check off)\b.+?\b(.+?)\b/i
    const completeMatch = userInput.match(completePattern)

    if (completeMatch) {
      const taskNameHint = completeMatch[2].trim()
      // Find a task that matches or contains the mentioned name
      const taskToComplete = activeTasks.find(
        (task) => task.title.toLowerCase().includes(taskNameHint.toLowerCase()) && !task.completed,
      )

      if (taskToComplete) {
        handleTaskToggle(taskToComplete.id)
        return true
      }
    }

    // Check for edit command
    const editPattern = /\b(edit|change|update|rename)\b.+?\b(.+?)\b.+?\b(to|as)\b.+?\b(.+)\b/i
    const editMatch = userInput.match(editPattern)

    if (editMatch) {
      const oldTaskHint = editMatch[2].trim()
      const newTaskName = editMatch[4].trim()

      // Find a task that matches or contains the mentioned name
      const taskToEdit = activeTasks.find((task) => task.title.toLowerCase().includes(oldTaskHint.toLowerCase()))

      if (taskToEdit && newTaskName) {
        const updatedTasks = activeTasks.map((task) =>
          task.id === taskToEdit.id ? { ...task, title: newTaskName } : task,
        )

        setActiveTasks(updatedTasks)

        if (onTaskUpdate) {
          onTaskUpdate(taskToEdit.id, taskToEdit.completed, "edit")
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: `Updated task: "${oldTaskHint}" to "${newTaskName}"`,
            sender: "system",
          },
        ])

        return true
      }
    }

    // Check for add task command
    const addPattern = /\b(add|create|set up|make|schedule)\b.+?\b(task|todo|to do|reminder)\b.+?\b(.+)\b/i
    const addMatch = userInput.match(addPattern)

    if (addMatch || (lowerInput.includes("add") && lowerInput.includes("task"))) {
      const taskTitle = addMatch
        ? addMatch[3].trim()
        : userInput.replace(/^.*\b(add|create|set up|make|schedule)\b.+?\b(task|todo|to do|reminder)\b/i, "").trim()

      if (taskTitle) {
        // Check for date in the task description
        const taskDate = extractDateFromText(userInput)

        if (taskDate) {
          // Add task with specific date
          const newTask = {
            id: Date.now(),
            title: taskTitle,
            completed: false,
          }

          if (onAddTaskWithDate) {
            onAddTaskWithDate(taskDate, newTask)
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                text: `Added new task for ${taskDate.toLocaleDateString()}: "${taskTitle}"`,
                sender: "system",
              },
            ])
          }
        } else {
          // Add task for today
          const newTask = {
            id: Date.now(),
            title: taskTitle,
            completed: false,
          }

          setActiveTasks((prev) => [...prev, newTask])

          if (onTaskUpdate) {
            onTaskUpdate(newTask.id, false, "add")
          }

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: `Added new task: "${taskTitle}"`,
              sender: "system",
            },
          ])
        }

        return true
      }
    }

    // Check for delete/remove command
    const deletePattern = /\b(delete|remove|cancel)\b.+?\b(.+?)\b/i
    const deleteMatch = userInput.match(deletePattern)

    if (deleteMatch) {
      const taskNameHint = deleteMatch[2].trim()
      // Find a task that matches or contains the mentioned name
      const taskToDelete = activeTasks.find((task) => task.title.toLowerCase().includes(taskNameHint.toLowerCase()))

      if (taskToDelete) {
        removeTask(taskToDelete.id)
        return true
      }
    }

    // Check if the AI is suggesting a task
    if (
      aiResponse.toLowerCase().includes("add task") ||
      aiResponse.toLowerCase().includes("create task") ||
      aiResponse.toLowerCase().includes("schedule task") ||
      aiResponse.toLowerCase().includes("add to your list") ||
      aiResponse.toLowerCase().includes("want me to add") ||
      aiResponse.toLowerCase().includes("should i add")
    ) {
      // Extract potential task from AI response
      let taskText = aiResponse.replace(/.*?(add|create|schedule) (a )?task( to)?:?\s+/i, "").trim()
      taskText = taskText.split(/\?|\./)[0] // Get the first sentence

      if (taskText && taskText.length > 5) {
        const hasDate = extractDateFromText(aiResponse) !== null

        const suggestion = {
          id: Date.now().toString(),
          text: "Would you like me to add this as a new task?",
          sender: "ai" as const,
          isTaskSuggestion: true,
          suggestedTask: taskText,
          hasDate: hasDate,
        }

        if (hasDate) {
          suggestion.text += " I noticed a date reference. Should I schedule it for that date?"
        }

        setMessages((prev) => [...prev, suggestion])
        return true
      }
    }

    return false
  }

  const addSuggestedTask = (taskText?: string, forSpecificDate = false) => {
    if (!taskText) return

    // Extract task title, removing common prefixes
    const taskTitle = taskText
      .replace(/^.*(add|suggest|recommend|create|schedule)/i, "")
      .replace(/[.?]$/, "")
      .trim()

    // Try to extract date from the task text
    const taskDate = extractDateFromText(taskText)
    const hasDate = taskDate !== null

    if (taskTitle) {
      const newTask = {
        id: Date.now(),
        title: taskTitle,
        completed: false,
      }

      if (hasDate || forSpecificDate) {
        // If there's a date reference or user wants to schedule it
        const targetDate = taskDate || new Date() // Default to today if no date found
        if (onAddTaskWithDate) {
          onAddTaskWithDate(targetDate, newTask)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: `Added new task for ${targetDate.toLocaleDateString()}: "${taskTitle}"`,
              sender: "system",
            },
          ])
        }
      } else {
        // Add to today's tasks
        setActiveTasks((prev) => [...prev, newTask])
        if (onTaskUpdate) {
          onTaskUpdate(newTask.id, false, "add")
        }
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: `Added new task: "${taskTitle}"`,
            sender: "system",
          },
        ])
      }
    }
  }

  // Get AI response from our server-side API
  const getAIResponse = async (userInput: string): Promise<string> => {
    try {
      // Call our server-side API route instead of directly using the API key
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput,
          activeTasks,
          messages: messages.slice(-4), // Send only the last 4 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return data.response
    } catch (error) {
      console.error("AI API Error:", error)
      return "I'm having trouble connecting to my systems. Please try again in a moment."
    }
  }

  // Update the handleSendMessage function to handle API errors better
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setApiError(null)

    try {
      // Process direct commands first
      const directCommandProcessed = processTaskCommands(inputValue, "")

      if (!directCommandProcessed) {
        // Get AI response if no direct command was processed
        const aiResponse = await getAIResponse(inputValue)

        // Add the AI response
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: aiResponse,
            sender: "ai",
          },
        ])

        // Check if the AI is suggesting a task
        processTaskCommands(inputValue, aiResponse)
      }
    } catch (error) {
      console.error("Chat Error:", error)
      setApiError(error instanceof Error ? error.message : "Unknown error")
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "I'm having trouble connecting. Please check your internet connection.",
          sender: "ai",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="w-[350px] h-[500px] bg-[#111827]/90 backdrop-blur-md border border-[#40E0D0]/20 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-slideIn">
          <div className="p-4 bg-[#1a2332]/90 border-b border-[#40E0D0]/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] flex items-center justify-center text-white">
              <Bot size={18} />
            </div>
            <h3 className="text-[#E0F7FA] font-semibold">Habit Coach AI</h3>
            {apiError && <div className="text-red-400 text-xs mt-1">API Error: {apiError}</div>}
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-thin scrollbar-thumb-[#40E0D0]/20 scrollbar-track-transparent">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[80%] p-3 rounded-2xl animate-fadeIn ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] text-white self-end rounded-br-sm"
                    : message.sender === "ai"
                      ? "bg-[#1a2332]/60 text-[#E0F7FA] self-start rounded-bl-sm"
                      : "bg-[#1a2332]/30 text-[#B8F0F9]/70 text-xs self-center rounded-xl"
                }`}
              >
                {message.text}
                {message.isTaskSuggestion && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => addSuggestedTask(message.suggestedTask)}
                      className="px-2 py-1 bg-[#40E0D0]/20 hover:bg-[#40E0D0]/30 text-[#E0F7FA] rounded text-xs transition-colors"
                    >
                      Add to Today
                    </button>
                    {message.hasDate && (
                      <button
                        onClick={() => addSuggestedTask(message.suggestedTask, true)}
                        className="px-2 py-1 bg-[#40E0D0]/20 hover:bg-[#40E0D0]/30 text-[#E0F7FA] rounded text-xs transition-colors"
                      >
                        Schedule for Date
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {activeTasks.length > 0 &&
              (inputValue.toLowerCase().includes("task") ||
                inputValue.toLowerCase().includes("show task") ||
                inputValue.toLowerCase().includes("list") ||
                inputValue.toLowerCase().includes("show me") ||
                messages.some((m) => m.text.toLowerCase().includes("current tasks"))) && (
                <div className="max-w-[90%] p-3 rounded-2xl bg-[#1a2332]/60 text-[#E0F7FA] self-start rounded-bl-sm animate-fadeIn">
                  <h4 className="text-[#40E0D0] font-medium mb-2 text-sm">Your Current Tasks:</h4>
                  <div className="space-y-2">
                    {activeTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 bg-[#1a2332]/80 rounded-lg hover:bg-[#1a2332] transition-colors"
                      >
                        {editingTaskId === task.id ? (
                          <>
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPressForEdit}
                              className="flex-1 h-8 bg-[#2a3343] border-[#40E0D0]/30 text-[#E0F7FA] text-sm"
                              autoFocus
                            />
                            <button onClick={saveEditTask} className="p-1 text-[#40E0D0] hover:bg-[#40E0D0]/10 rounded">
                              <Check size={16} />
                            </button>
                            <button onClick={cancelEditTask} className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                                task.completed
                                  ? "border-[#40E0D0] bg-gradient-to-r from-[#40E0D0] to-[#64B4FF]"
                                  : "border-[#E0F7FA]/30 hover:border-[#40E0D0]"
                              }`}
                              onClick={() => handleTaskToggle(task.id)}
                            >
                              {task.completed && <Check size={12} className="text-white" />}
                            </div>
                            <span
                              className={`flex-1 text-sm ${
                                task.completed ? "text-[#E0F7FA]/50 line-through" : "text-[#E0F7FA]"
                              }`}
                            >
                              {task.title}
                              {task.isHabit && <span className="text-xs opacity-70 ml-1">(daily)</span>}
                              {task.estimatedTime && (
                                <span className="text-xs text-[#64B4FF]/80 ml-1">({task.estimatedTime} min)</span>
                              )}
                            </span>
                            <button
                              onClick={() => startEditTask(task.id)}
                              className="p-1 text-[#E0F7FA]/50 hover:text-[#40E0D0] hover:bg-[#40E0D0]/10 rounded"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => removeTask(task.id)}
                              className="p-1 text-[#E0F7FA]/50 hover:text-red-400 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {isLoading && (
              <div className="self-start bg-[#1a2332]/60 text-[#E0F7FA] p-3 rounded-2xl rounded-bl-sm flex items-center space-x-2 animate-pulse">
                <span className="w-2 h-2 bg-[#40E0D0]/70 rounded-full"></span>
                <span className="w-2 h-2 bg-[#40E0D0]/70 rounded-full animation-delay-200"></span>
                <span className="w-2 h-2 bg-[#40E0D0]/70 rounded-full animation-delay-400"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-[#40E0D0]/20 bg-[#1a2332]/90 flex gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about habits or tasks..."
              disabled={isLoading}
              className="flex-1 bg-[#2a3343]/70 border-[#40E0D0]/30 text-[#E0F7FA] placeholder:text-[#E0F7FA]/50 focus:border-[#40E0D0]/60"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading}
              size="icon"
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] text-white hover:shadow-glow"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-[#40E0D0] to-[#64B4FF] text-white shadow-lg hover:shadow-[0_0_20px_rgba(64,224,208,0.4)] flex items-center justify-center transition-all hover:-translate-y-1"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>
    </div>
  )
}
