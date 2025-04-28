"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { X, Plus, Pencil, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useAuth } from "../context/auth-context"
import { toast } from "./ui/use-toast"
import { format, startOfDay, endOfDay, parseISO, isSameDay } from "date-fns"

interface Task {
  _id: string
  title: string
  completed: boolean
  xpReward: number
  dueDate?: string | Date
  isHabit?: boolean
}

interface TodaysTasksProps {
  date?: Date
}

export function TodaysTasks({ date = new Date() }: TodaysTasksProps) {
  const { user, updateUser } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [completedTaskCount, setCompletedTaskCount] = useState(0)

  // Fetch tasks for the specified date
  useEffect(() => {
    let isMounted = true;
    
    async function fetchTasks() {
      try {
        setLoading(true)
        
        // Fix the date handling by using UTC dates to prevent timezone issues
        // This way we'll consistently get the selected date, not the date + timezone offset
        const normalizedDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        
        // Format date string in YYYY-MM-DD format for the API
        const dateStr = format(normalizedDate, 'yyyy-MM-dd');
        
        console.log("Fetching tasks for date:", dateStr, "Original date:", date.toISOString());
        
        const res = await fetch(`/api/tasks?date=${dateStr}`)

        if (!res.ok) {
          console.error("Failed to fetch tasks with status:", res.status)
          // Use placeholder data
          if (isMounted) setTasks([])
          return
        }

        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("API returned non-JSON response:", contentType)
          if (isMounted) setTasks([])
          return
        }

        const data = await res.json()
        console.log("API response for tasks:", data)
        
        if (data.success && isMounted) {
          // Ensure each task has a properly formatted date for display
          const formattedTasks = data.data.map((task: any) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : null
          }));
          console.log("Formatted tasks:", formattedTasks)
          setTasks(formattedTasks)
        } else if (isMounted) {
          setTasks([])
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
        if (isMounted) setTasks([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchTasks()
    
    return () => {
      isMounted = false;
    }
  }, [date])
  
  // Update completed task count when tasks change
  useEffect(() => {
    const newCompletedCount = tasks.filter(task => task.completed).length;
    setCompletedTaskCount(newCompletedCount);
  }, [tasks]);

  const addTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        // Fix the date handling for new tasks
        const normalizedDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          12, 0, 0 // Set to noon to avoid any date crossing issues
        );
        
        // Format the date consistently as YYYY-MM-DD
        const dateStr = format(normalizedDate, 'yyyy-MM-dd');
        
        console.log("Adding task for date:", dateStr, "ISO string:", normalizedDate.toISOString());
        
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newTaskTitle,
            dueDate: normalizedDate.toISOString(),
            dueDateString: dateStr,
            xpReward: 20,
          }),
        })

        const data = await res.json()
        console.log("Task creation response:", data)
        
        if (res.ok && data.success) {
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
      } catch (error) {
        console.error("Add task error:", error)
        // Add task locally for demo purposes
        const newTask = {
          _id: Date.now().toString(),
          title: newTaskTitle,
          completed: false,
          xpReward: 20,
          dueDate: date
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

  // Check for unlocked achievements
  const checkAchievements = async (newCompletedCount: number, taskId: string) => {
    try {
      // Call achievement check endpoint
      const achievementRes = await fetch('/api/achievements/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskCompleted: true,
          tasksCompletedToday: newCompletedCount,
          updatedTaskId: taskId
        }),
      });
      
      if (achievementRes.ok) {
        const achievementData = await achievementRes.json();
        
        // If achievements were unlocked, show toasts and update UI
        if (achievementData.unlockedAchievements && achievementData.unlockedAchievements.length > 0) {
          achievementData.unlockedAchievements.forEach((achievement: any) => {
            toast({
              title: `🏆 Achievement Unlocked: ${achievement.name}!`,
              description: achievement.description,
              duration: 5000,
            });
          });
          
          // Trigger a custom event to update the achievements display
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('achievement-unlocked', { 
              detail: { achievements: achievementData.unlockedAchievements }
            }));
          }
        }
      }
    } catch (error) {
      console.error("Failed to check achievements:", error);
    }
  };

  const handleTaskToggle = async (id: string) => {
    try {
      const task = tasks.find((task) => task._id === id)
      if (!task) {
        console.error("Task not found")
        return
      }
      const completed = !task.completed

      // Try the direct PUT request first
      let res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      })

      // If PUT fails with a 405 error, try the fallback POST endpoint
      if (res.status === 405) {
        console.log("PUT method not allowed, using fallback POST endpoint")
        res = await fetch(`/api/tasks/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, completed }),
        })
      }

      const data = await res.json()
      
      if (res.ok && data.success) {
        // Update tasks list
        setTasks(tasks.map((task) => (task._id === id ? { ...task, completed } : task)))

        // If task was completed, update user XP and check achievements
        if (completed) {
          // Import the XP_VALUES from lib/xp-system
          const { XP_VALUES } = await import("../lib/xp-system")
          
          // Update completed task count
          const newCompletedCount = completedTaskCount + 1
          setCompletedTaskCount(newCompletedCount)
          
          // Show toast for XP gained
          toast({
            title: "Task Completed!",
            description: `You earned ${XP_VALUES.TASK_COMPLETION} XP`,
          })
          
          // Check for unlocked achievements
          await checkAchievements(newCompletedCount, id)
        } else {
          // Task was uncompleted, decrease count
          setCompletedTaskCount(prevCount => Math.max(0, prevCount - 1))
        }
      } else {
        throw new Error(data.message || "Failed to update task")
      }
    } catch (error) {
      console.error("Toggle task error:", error)
      // Update task locally for demo purposes
      setTasks(tasks.map((task) => (task._id === id ? { ...task, completed: !task.completed } : task)))

      const task = tasks.find((task) => task._id === id)
      if (task && !task.completed) {
        // Update completed count locally
        const newCount = completedTaskCount + 1
        setCompletedTaskCount(newCount)
        
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
  
  // Properly check if the provided date is today
  const today = new Date();
  const isToday = isSameDay(today, date);
  
  // Use the formatted date for display purposes
  const formattedDate = isToday ? "Today" : format(date, "EEEE, MMMM d, yyyy");

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-white mb-4">{formattedDate}'s Tasks</h3>
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
                onCheckedChange={() => handleTaskToggle(task._id)}
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
        <div className="text-center py-8 text-gray-400">
          No tasks for {isToday ? "today" : format(date, "MMMM d")}. Add one below!
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1a2332] border-[#2a3343] text-white">
          <DialogHeader>
            <DialogTitle>Add New Task for {format(date, "MMM d")}</DialogTitle>
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
