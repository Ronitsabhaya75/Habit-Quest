"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "react-hot-toast"

// Define the task interface
export interface Task {
  _id: string
  title: string
  description?: string
  dueDate: Date
  completed: boolean
  completedAt?: Date | null
  xpReward: number
  isHabit: boolean
  isRecurring: boolean
  frequency?: "daily" | "weekly" | "biweekly" | "monthly"
  recurringEndDate?: Date | null
  parentTaskId?: string
  createdAt: Date
  updatedAt: Date
}

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, "_id" | "completed" | "createdAt" | "updatedAt">) => Promise<void>
  updateTask: (id: string, task: Partial<Task>, updateAllInstances?: boolean) => Promise<void>
  removeTask: (id: string, deleteRecurring?: boolean) => Promise<void>
  completeTask: (id: string) => Promise<void>
  getTasksForDate: (date: Date) => Task[]
}

const TaskContext = createContext<TaskContextType | null>(null)

interface AddTaskInput {
  title: string
  description?: string
  dueDate: Date
  xpReward?: number
  isHabit?: boolean
  isRecurring?: boolean
  frequency?: "daily" | "weekly" | "biweekly" | "monthly"
  recurringEndDate?: Date | null
}

interface UpdateTaskInput {
  id: string
  title?: string
  description?: string
  dueDate?: Date
  completed?: boolean
  xpReward?: number
  isHabit?: boolean
  isRecurring?: boolean
  frequency?: "daily" | "weekly" | "biweekly" | "monthly"
  recurringEndDate?: Date | null
  updateAllInstances?: boolean
}

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/tasks")
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Ensure we're setting tasks to an array
      // The API might return data in different formats
      if (data && data.data && Array.isArray(data.data)) {
        setTasks(data.data)
      } else if (data && Array.isArray(data)) {
        setTasks(data)
      } else {
        console.error("Unexpected API response format:", data)
        setTasks([])
      }
      
      setError(null)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Failed to fetch tasks")
      setTasks([]) // Ensure tasks is an array even on error
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (taskData: AddTaskInput) => {
    try {
      setLoading(true)
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskData,
          xpReward: taskData.xpReward || 10,
          isHabit: taskData.isHabit || false,
          isRecurring: taskData.isRecurring || false,
          frequency: taskData.frequency || "daily",
          recurringEndDate: taskData.isRecurring ? taskData.recurringEndDate : null
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      const newTask = data.task
      
      setTasks((prevTasks) => [...prevTasks, newTask])
      toast.success("Task added successfully!")
      return newTask
    } catch (err) {
      console.error("Error adding task:", err)
      setError("Failed to add task")
      toast.error("Failed to add task")
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (taskData: UpdateTaskInput) => {
    try {
      setLoading(true)
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      const updatedTask = data.data
      
      // If we're updating all instances (array of tasks returned)
      if (Array.isArray(updatedTask)) {
        // Replace all the updated tasks in our state
        setTasks((prevTasks) =>
          prevTasks.map((t) => {
            const matchingTask = updatedTask.find(ut => ut._id === t._id)
            return matchingTask || t
          })
        )
      } else {
        // Just update the single task
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === taskData.id ? updatedTask : t))
        )
      }
      
      toast.success("Task updated successfully!")
      
      // If the update involved completing a recurring task
      if (taskData.completed && 
          ((!Array.isArray(updatedTask) && updatedTask.isRecurring) || 
           (Array.isArray(updatedTask) && updatedTask.some(t => t.isRecurring)))) {
        // Fetch tasks to get the newly created recurring task
        fetchTasks()
      }
      
      return updatedTask
    } catch (err) {
      console.error("Error updating task:", err)
      setError("Failed to update task")
      toast.error("Failed to update task")
      return null
    } finally {
      setLoading(false)
    }
  }

  const removeTask = async (id: string, deleteRecurring = false) => {
    try {
      setLoading(true)
      const url = `/api/tasks?id=${id}${deleteRecurring ? '&deleteRecurring=true' : ''}`
      const response = await fetch(url, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      if (deleteRecurring) {
        // If we're deleting a recurring task and all its instances, we need to refresh the task list
        await fetchTasks()
      } else {
        // Otherwise just remove the single task from state
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id))
      }
      toast.success("Task removed successfully!")
    } catch (err) {
      console.error("Error removing task:", err)
      setError("Failed to remove task")
      toast.error("Failed to remove task")
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          id, 
          completed: true 
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      const updatedTask = data.data
      
      // Update the completed task in state
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === id ? updatedTask : t))
      )
      
      // If this was a recurring task, fetch tasks to get the newly created recurring instance
      if (updatedTask.isRecurring) {
        await fetchTasks()
      }
      
      toast.success("Task completed!")
      return updatedTask
    } catch (err) {
      console.error("Error completing task:", err)
      setError("Failed to complete task")
      toast.error("Failed to complete task")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Function to get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    // Make sure tasks is actually an array before filtering
    if (!Array.isArray(tasks)) {
      return []
    }
    
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate >= startOfDay && taskDate <= endOfDay
    })
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        addTask,
        updateTask,
        removeTask,
        completeTask,
        getTasksForDate,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export const useTask = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider")
  }
  return context
}
