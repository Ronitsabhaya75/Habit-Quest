"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Pencil, Trash2, AlertCircle, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useTask, type Task } from "./task-context"
import { useToast } from "./ui/use-toast"

interface TaskListProps {
  date?: Date
}

export function TaskList({ date = new Date() }: TaskListProps) {
  const { tasks, addTask, updateTask, removeTask, getTasksForDate } = useTask()
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [editingTask, setEditingTask] = useState<{ id: string; title: string } | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const { toast } = useToast()
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "biweekly" | "monthly">("daily")
  const [deletedTaskCount, setDeletedTaskCount] = useState<number>(0)
  const [userStreak, setUserStreak] = useState<{
    streak: number;
    lastActive: string | null;
    hours: number | null;
  }>({
    streak: 0,
    lastActive: null,
    hours: null
  });

  // Load the deleted task count from localStorage on component mount
  useEffect(() => {
    const storedCount = localStorage.getItem('deletedTaskCount')
    if (storedCount) {
      setDeletedTaskCount(parseInt(storedCount, 10))
    }
    
    // Fetch user streak information
    fetchUserStreak();
    
    // Setup event listener for user data updates
    window.addEventListener('user-data-updated', handleUserDataUpdate);
    
    return () => {
      window.removeEventListener('user-data-updated', handleUserDataUpdate);
    };
  }, [])
  
  // Handle user data update events
  const handleUserDataUpdate = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.userData) {
      updateStreakFromData(customEvent.detail.userData);
    }
  };
  
  // Fetch user streak information
  const fetchUserStreak = async () => {
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          updateStreakFromData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user streak:', error);
    }
  };
  
  // Update streak data from API response
  const updateStreakFromData = (userData: any) => {
    setUserStreak({
      streak: userData.streak || 0,
      lastActive: userData.lastActiveFormatted || null,
      hours: userData.streakExpiresIn?.hours || null
    });
  };

  // Filter tasks based on the selected date
  useEffect(() => {
    try {
      if (date) {
        // Make sure getTasksForDate doesn't throw errors
        const tasksForDate = getTasksForDate(date);
        console.log("Tasks for date:", tasksForDate?.length || 0);
        
        // Extra validation to ensure we're dealing with valid tasks
        if (Array.isArray(tasksForDate)) {
          const validTasks = tasksForDate.filter(task => 
            task && // Filter out null/undefined tasks
            typeof task === 'object' && // Make sure it's an object
            task._id // Make sure it has an ID
          );
          setFilteredTasks(validTasks);
        } else {
          console.warn("getTasksForDate didn't return an array");
          setFilteredTasks([]);
        }
      } else {
        setFilteredTasks([]);
      }
    } catch (error) {
      console.error("Error filtering tasks by date:", error);
      setFilteredTasks([]);
    }
  }, [date, tasks, getTasksForDate]);

  const toggleTask = (id: string) => {
    try {
      const task = tasks.find((t) => t && t._id === id);
      if (task) {
        updateTask({
          id,
          completed: !task.completed
        })

        // Provide feedback on completed task
        if (!task.completed) {
          toast({
            title: "Task Completed!",
            description: "Great job on completing your task!",
          })
        }
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  }

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle,
        dueDate: date,
        isRecurring: isRecurring,
        frequency: frequency,
      })

      setNewTaskTitle("")
      setDialogOpen(false)

      toast({
        title: "Task Added",
        description: `New task "${newTaskTitle}" added for ${date.toLocaleDateString()}.`,
      })
    }
  }

  const confirmDeleteTask = (id: string) => {
    setTaskToDelete(id)
    setDeleteDialogOpen(true)
  }

  const deleteTask = (id: string) => {
    const task = tasks.find((t) => t._id === id)
    if (task) {
      removeTask(id)

      // Update deleted task count and check for achievements
      const newDeletedCount = deletedTaskCount + 1
      setDeletedTaskCount(newDeletedCount)
      localStorage.setItem('deletedTaskCount', newDeletedCount.toString())
      
      // Check for achievement unlock
      checkDeleteAchievement(newDeletedCount)

      toast({
        title: "Task Deleted",
        description: `Task "${task.title}" has been removed.`,
      })
    }
    
    setDeleteDialogOpen(false)
  }

  // Check if user should unlock "Task Manager" achievement
  const checkDeleteAchievement = async (count: number) => {
    // Unlock achievement at 5 task deletions
    if (count === 5) {
      try {
        // Call achievement check API endpoint
        const response = await fetch('/api/achievements/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            taskDeleted: true,
            tasksDeletedTotal: count
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // Show notification for newly unlocked achievements
          if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
            data.unlockedAchievements.forEach((achievement: any) => {
              toast({
                title: `🏆 Achievement Unlocked: ${achievement.name}!`,
                description: `${achievement.description} (+${achievement.xpReward} XP)`,
                duration: 5000,
              })
            })
          }
        }
      } catch (error) {
        console.error("Failed to check achievements:", error)
        
        // Fallback for offline mode
        toast({
          title: `🏆 Achievement Unlocked: Task Manager!`,
          description: `You've deleted 5 tasks! (+30 XP)`,
          duration: 5000,
        })
      }
    }
  }

  const updateTaskTitle = (id: string, newTitle: string) => {
    if (newTitle.trim()) {
      updateTask({
        id,
        title: newTitle
      })
      setEditingTask(null)

      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <StreakStyles />
      
      {/* Streak display */}
      {userStreak.streak > 0 && (
        <div className="bg-gradient-to-r from-[#1a1e33] to-[#2a3050] border border-[#3a4060] rounded-md p-3 mb-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2 streak-pulse">🔥</span>
              <div>
                <h3 className="font-bold text-[#4cc9f0]">{userStreak.streak} Day Streak!</h3>
                {userStreak.lastActive && (
                  <p className="text-xs text-gray-400">Last activity: {userStreak.lastActive}</p>
                )}
              </div>
            </div>
            {userStreak.hours !== null && userStreak.hours < 24 && (
              <div className="text-right">
                <div className="text-xs text-gray-400">Time to maintain streak:</div>
                <div className={`text-sm font-medium ${userStreak.hours < 6 ? 'text-red-400' : 'text-green-400'}`}>
                  {userStreak.hours} hours left
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {filteredTasks.length > 0 ? (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#2a3343] transition-colors"
            >
              <Checkbox
                id={`task-${task._id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task._id)}
                className="text-[#4cc9f0] border-[#4cc9f0]"
              />

              {editingTask && editingTask.id === task._id ? (
                <div className="flex-1 flex items-center space-x-2">
                  <Input
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="bg-[#2a3343] border-[#3a4353] text-white"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateTaskTitle(task._id, editingTask.title)}
                    className="h-8 w-8 p-0 text-green-500"
                  >
                    ✓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingTask(null)}
                    className="h-8 w-8 p-0 text-red-500"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <>
                  <label
                    htmlFor={`task-${task._id}`}
                    className={`text-white flex-1 cursor-pointer ${task.completed ? "line-through text-gray-400" : ""}`}
                  >
                    {task.title}
                    {task.isHabit && <span className="text-sm opacity-80 ml-2">(daily habit)</span>}
                    {task.isRecurring && !task.isHabit && (
                      <span className="text-sm opacity-80 ml-2">
                        ({task.frequency} · repeating)
                      </span>
                    )}
                  </label>

                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white"
                      onClick={() => setEditingTask({ id: task._id, title: task.title })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-all duration-200 ease-in-out"
                      onClick={() => confirmDeleteTask(task._id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">No tasks for this date. Add a task to get started!</div>
      )}

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">+ Add Task</Button>
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
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="task-recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked === true)}
                className="text-[#4cc9f0] border-[#4cc9f0]"
              />
              <label htmlFor="task-recurring" className="text-sm text-white cursor-pointer">
                Make this a recurring task
              </label>
            </div>
            {isRecurring && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="task-frequency">Frequency</Label>
                <select
                  id="task-frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "biweekly" | "monthly")}
                  className="w-full bg-[#2a3343] border-[#3a4353] text-white rounded-md p-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
            <Button className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black" onClick={handleAddTask}>
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3343] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="border-[#3a4353] hover:bg-[#2a3343] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => taskToDelete && deleteTask(taskToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Add these styles to the global stylesheet
const StreakStyles = () => (
  <style jsx global>{`
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    .streak-pulse {
      animation: pulse 2s infinite;
    }
  `}</style>
);

export { StreakStyles };
