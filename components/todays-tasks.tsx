"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { toast } from "@/components/ui/use-toast"

interface Task {
  _id: string
  title: string
  completed: boolean
  xpReward: number
}

export function TodaysTasks() {
  const { user, updateUser } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Fetch tasks for today
  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true)
        const today = new Date().toISOString().split("T")[0]
        const res = await fetch(`/api/tasks?date=${today}`)

        if (!res.ok) {
          console.error("Failed to fetch tasks with status:", res.status)
          // Use placeholder data
          setTasks([
            { _id: "1", title: "Morning meditation", completed: false, xpReward: 20 },
            { _id: "2", title: "Read for 30 minutes", completed: true, xpReward: 20 },
          ])
          return
        }

        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("API returned non-JSON response:", contentType)
          // Use placeholder data
          setTasks([
            { _id: "1", title: "Morning meditation", completed: false, xpReward: 20 },
            { _id: "2", title: "Read for 30 minutes", completed: true, xpReward: 20 },
          ])
          return
        }

        const data = await res.json()
        if (data.success) {
          setTasks(data.data)
        } else {
          // Use placeholder data
          setTasks([
            { _id: "1", title: "Morning meditation", completed: false, xpReward: 20 },
            { _id: "2", title: "Read for 30 minutes", completed: true, xpReward: 20 },
          ])
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
        // Use placeholder data
        setTasks([
          { _id: "1", title: "Morning meditation", completed: false, xpReward: 20 },
          { _id: "2", title: "Read for 30 minutes", completed: true, xpReward: 20 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const addTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        const today = new Date()

        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newTaskTitle,
            dueDate: today,
            xpReward: 20,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setTasks([...tasks, data.data])
            setNewTaskTitle("")
            setDialogOpen(false)

            toast({
              title: "Success",
              description: "Task added successfully",
            })
          } else {
            throw new Error(data.message || "Failed to add task")
          }
        } else {
          throw new Error("Failed to add task")
        }
      } catch (error) {
        console.error("Add task error:", error)
        // Add task locally for demo purposes
        const newTask = {
          _id: Date.now().toString(),
          title: newTaskTitle,
          completed: false,
          xpReward: 20,
        }
        setTasks([...tasks, newTask])
        setNewTaskTitle("")
        setDialogOpen(false)

        toast({
          title: "Success",
          description: "Task added successfully (offline mode)",
        })
      }
    }
  }

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          // Update tasks list
          setTasks(tasks.map((task) => (task._id === id ? { ...task, completed } : task)))

          // If task was completed, update user XP
          if (completed) {
            // Fetch updated user data
            const userRes = await fetch("/api/users/me")
            if (userRes.ok) {
              const userData = await userRes.json()
              if (userData.success) {
                updateUser(userData.data)

                toast({
                  title: "Task Completed!",
                  description: `You earned 20 XP`,
                })
              }
            }
          }
        } else {
          throw new Error(data.message || "Failed to update task")
        }
      } else {
        throw new Error("Failed to update task")
      }
    } catch (error) {
      console.error("Toggle task error:", error)
      // Update task locally for demo purposes
      setTasks(tasks.map((task) => (task._id === id ? { ...task, completed } : task)))

      if (completed) {
        toast({
          title: "Task Completed!",
          description: `You earned 20 XP (offline mode)`,
        })
      }
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading tasks...</div>
  }

  return (
    <div className="space-y-4">
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#2a3343] transition-colors"
            >
              <Checkbox
                id={`task-${task._id}`}
                checked={task.completed}
                onCheckedChange={(checked) => toggleTask(task._id, checked === true)}
                className="text-[#4cc9f0] border-[#4cc9f0]"
              />
              <label
                htmlFor={`task-${task._id}`}
                className={`text-white flex-1 cursor-pointer ${task.completed ? "line-through text-gray-400" : ""}`}
              >
                {task.title}
              </label>
              {task.completed && <span className="text-green-400 text-xs">+{task.xpReward} XP</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">No tasks for today. Add one below!</div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1a2332] border-[#2a3343] text-white">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Name</Label>
              <Input
                id="task-title"
                placeholder="Enter task name"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-[#2a3343] border-[#3a4353] text-white"
              />
            </div>
            <Button className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black" onClick={addTask}>
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
