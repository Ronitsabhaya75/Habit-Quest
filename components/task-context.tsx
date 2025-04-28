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
  addTask: (taskData: AddTaskInput) => Promise<any>
  updateTask: (taskData: UpdateTaskInput) => Promise<any>
  removeTask: (id: string, deleteRecurring?: boolean) => Promise<void>
  completeTask: (id: string) => Promise<any>
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
  const [completedTaskCount, setCompletedTaskCount] = useState(0);

  // Check and unlock achievements when tasks are completed
  const checkAndUnlockAchievements = async (completedTaskCount: number, taskId?: string) => {
    try {
      // Check if achievements exist in local storage when offline
      if (!navigator.onLine) {
        const localAchievements = JSON.parse(localStorage.getItem('userAchievements') || '[]');
        const pendingAchievements = [];
        
        // Define achievement thresholds
        const achievementThresholds = [
          { threshold: 1, name: "First Steps", description: "Complete your first task", xpReward: 10 },
          { threshold: 5, name: "Getting Things Done", description: "Complete 5 tasks", xpReward: 20 },
          { threshold: 10, name: "Productivity Master", description: "Complete 10 tasks", xpReward: 30 },
          { threshold: 25, name: "Task Champion", description: "Complete 25 tasks", xpReward: 50 },
          { threshold: 50, name: "Achievement Hunter", description: "Complete 50 tasks", xpReward: 100 },
          { threshold: 100, name: "Legendary Completionist", description: "Complete 100 tasks", xpReward: 200 }
        ];
        
        // Check for new unlocked achievements
        achievementThresholds.forEach(achievement => {
          if (completedTaskCount >= achievement.threshold && 
              !localAchievements.some((a: any) => a.name === achievement.name)) {
            pendingAchievements.push(achievement);
            localAchievements.push({
              ...achievement,
              unlocked: true,
              unlockedAt: new Date().toISOString()
            });
          }
        });
        
        // Save updated achievements locally
        localStorage.setItem('userAchievements', JSON.stringify(localAchievements));
        
        // Show notifications for newly unlocked achievements
        pendingAchievements.forEach(achievement => {
          toast.success(`🏆 Achievement Unlocked: ${achievement.name} (+${achievement.xpReward} XP)`, {
            duration: 5000,
            icon: '🏆'
          });
        });
        
        return;
      }
      
      // If online, fetch from server
      const response = await fetch('/api/achievements/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          taskCompleted: true,
          tasksCompletedToday: completedTaskCount,
          updatedTaskId: taskId
        }),
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      
      // Show notifications for newly unlocked achievements
      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        data.unlockedAchievements.forEach((achievement: any) => {
          toast.success(`🏆 Achievement Unlocked: ${achievement.name} (+${achievement.xpReward} XP)`, {
            duration: 5000,
            icon: '🏆'
          });
        });
        
        // Trigger a dashboard refresh if available
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('achievement-unlocked', { 
            detail: { achievements: data.unlockedAchievements }
          }));
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };

  // Setup offline task notifications
  const setupOfflineTaskNotifications = () => {
    // Register for online/offline events
    window.addEventListener('online', syncOfflineTasks);
    window.addEventListener('offline', () => {
      // When going offline, schedule notifications for incomplete tasks
      scheduleIncompleteTaskNotifications();
    });
    
    return () => {
      window.removeEventListener('online', syncOfflineTasks);
      window.removeEventListener('offline', scheduleIncompleteTaskNotifications);
    };
  };

  // Function to schedule notifications for incomplete tasks
  const scheduleIncompleteTaskNotifications = () => {
    // Check if notifications are supported and permission is granted
    if (!("Notification" in window)) return;
    
    // Request permission if needed
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    
    if (Notification.permission !== "granted") return;
    
    // Get incomplete tasks from local storage
    const incompleteTasks = JSON.parse(localStorage.getItem('incompleteTasks') || '[]');
    
    // Schedule notifications for tasks due soon
    incompleteTasks.forEach((task: any) => {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      
      // If task is due today or in the next 24 hours
      if (dueDate > now && dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
        // Create notification
        const notification = new Notification("Task Reminder", {
          body: `Don't forget to complete your task: ${task.title}`,
          icon: "/favicon.ico"
        });
        
        // Close notification after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    });
  };

  // Function to sync offline tasks with server
  const syncOfflineTasks = async () => {
    try {
      // Sync completed tasks that were done offline
      const offlineCompletedTasks = JSON.parse(localStorage.getItem('offlineCompletedTasks') || '[]');
      
      if (offlineCompletedTasks.length > 0) {
        // Attempt to sync with server
        for (const taskId of offlineCompletedTasks) {
          await fetch("/api/tasks", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              id: taskId, 
              completed: true 
            }),
          });
        }
        
        // Clear offline completed tasks
        localStorage.setItem('offlineCompletedTasks', '[]');
        
        // Refresh tasks
        fetchTasks();
        
        toast.success("Your completed tasks have been synced!");
      }
    } catch (error) {
      console.error("Error syncing offline tasks:", error);
    }
  };

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
      setLoading(true);
      
      // Ensure taskData has required fields
      if (!taskData.dueDate) {
        taskData.dueDate = new Date();
      }
      
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskData,
          // Ensure dueDate is properly formatted as ISO string
          dueDate: taskData.dueDate instanceof Date ? taskData.dueDate.toISOString() : taskData.dueDate,
          xpReward: taskData.xpReward || 10,
          isHabit: taskData.isHabit || false,
          isRecurring: taskData.isRecurring || false,
          frequency: taskData.frequency || "daily",
          recurringEndDate: taskData.isRecurring && taskData.recurringEndDate ? 
            (taskData.recurringEndDate instanceof Date ? 
              taskData.recurringEndDate.toISOString() : taskData.recurringEndDate) : null
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      const newTask = data.task;
      
      setTasks((prevTasks) => [...prevTasks, newTask]);
      toast.success("Task added successfully!");
      return newTask;
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task");
      toast.error("Failed to add task");
      return null;
    } finally {
      setLoading(false);
    }
  }

  const updateTask = async (taskData: UpdateTaskInput) => {
    try {
      setLoading(true)
      
      // Format dates properly to avoid API validation errors
      const formattedData = {
        ...taskData,
        dueDate: taskData.dueDate instanceof Date ? taskData.dueDate.toISOString() : taskData.dueDate,
        recurringEndDate: taskData.recurringEndDate instanceof Date ? 
          taskData.recurringEndDate.toISOString() : taskData.recurringEndDate
      };
      
      console.log("Updating task with data:", JSON.stringify(formattedData));
      
      // Use the proper API endpoint for task updates
      const response = await fetch(`/api/tasks/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })
      
      // Better error handling
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API error response:", errorData || response.statusText);
        throw new Error(`Failed to update task: ${errorData?.error || response.statusText}`);
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
      toast.error(err instanceof Error ? err.message : "Failed to update task")
      return null
    } finally {
      setLoading(false)
    }
  }

  const removeTask = async (id: string, deleteRecurring = false) => {
    try {
      // Validate id parameter
      if (!id) {
        console.error("Cannot remove task: Invalid task ID (undefined or empty)");
        setError("Cannot remove task: Missing task ID");
        toast.error("Cannot remove task: Task ID is missing");
        return;
      }

      setLoading(true);
      
      // Use the correct API endpoint for task deletion
      const response = await fetch(`/api/tasks/${id}${deleteRecurring ? '?deleteRecurring=true' : ''}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      if (deleteRecurring) {
        // If we're deleting a recurring task and all its instances, we need to refresh the task list
        await fetchTasks();
      } else {
        // Otherwise just remove the single task from state
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
      }
      toast.success("Task removed successfully!");
    } catch (err) {
      console.error("Error removing task:", err);
      setError("Failed to remove task");
      toast.error("Failed to remove task");
    } finally {
      setLoading(false);
    }
  }

  const completeTask = async (id: string) => {
    try {
      setLoading(true);
      
      // Track offline task completion if not connected
      if (!navigator.onLine) {
        // Store the task ID to sync later
        const offlineCompletedTasks = JSON.parse(localStorage.getItem('offlineCompletedTasks') || '[]');
        offlineCompletedTasks.push(id);
        localStorage.setItem('offlineCompletedTasks', JSON.stringify(offlineCompletedTasks));
        
        // Update local task state
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === id ? {...t, completed: true, completedAt: new Date()} : t))
        );
        
        // Increment completed task count
        const newCount = completedTaskCount + 1;
        setCompletedTaskCount(newCount);
        
        // Check for achievements
        checkAndUnlockAchievements(newCount);
        
        // Update local leaderboard score
        updateLocalLeaderboardScore(20); // Assuming 20 XP per task
        
        toast.success("Task completed! (offline mode)");
        return null;
      }
      
      // Use the specific task ID endpoint that matches our API structure
      const response = await fetch(`/api/tasks/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, completed: true }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      const updatedTask = data.data;
      
      // Update the completed task in state
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === id ? updatedTask : t))
      );
      
      // Increment completed task count and check achievements
      const newCount = completedTaskCount + 1;
      setCompletedTaskCount(newCount);
      checkAndUnlockAchievements(newCount, id);
      
      // Update leaderboard with task XP
      updateLeaderboard(updatedTask.xpReward || 20);
      
      // If this was a recurring task, fetch tasks to get the newly created recurring instance
      if (updatedTask.isRecurring) {
        await fetchTasks();
      }
      
      toast.success("Task completed!");
      return updatedTask;
    } catch (err) {
      console.error("Error completing task:", err);
      setError("Failed to complete task");
      toast.error("Failed to complete task");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add function to update leaderboard when tasks are completed
  const updateLeaderboard = async (xpAmount: number) => {
    try {
      await fetch("/api/users/leaderboard/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          xpGained: xpAmount,
          source: "task_completion"
        }),
      });
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  };

  // Function to update local leaderboard score when offline
  const updateLocalLeaderboardScore = (xpAmount: number) => {
    const currentScore = parseInt(localStorage.getItem('offlineXpScore') || '0');
    const newScore = currentScore + xpAmount;
    localStorage.setItem('offlineXpScore', newScore.toString());
  };

  // Function to get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
    
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
    
      // Make sure tasks is actually an array before filtering
      if (!Array.isArray(tasks)) {
        console.log("Tasks is not an array in getTasksForDate");
        return [];
      }
    
      return tasks.filter(task => {
        // Skip null or undefined tasks
        if (!task) return false;
        
        // Make sure the task has a dueDate
        if (!task.dueDate) return false;
        
        // Parse the date safely (could be string or Date object)
        let taskDate: Date;
        try {
          taskDate = new Date(task.dueDate);
        } catch (e) {
          console.error('Invalid date format:', task.dueDate);
          return false;
        }
        
        return taskDate >= startOfDay && taskDate <= endOfDay;
      });
    } catch (error) {
      console.error("Error in getTasksForDate:", error);
      return [];
    }
  };
  
  // Initialize completed task count on load
  useEffect(() => {
    // Count completed tasks
    if (Array.isArray(tasks)) {
      const count = tasks.filter(task => {
        // Skip null or undefined tasks
        if (!task) return false;
        return task.completed === true;
      }).length;
      setCompletedTaskCount(count);
    }
  }, [tasks]);
  
  // Setup offline task notifications
  useEffect(() => {
    const cleanup = setupOfflineTaskNotifications();
    
    // Sync with server when coming back online
    if (navigator.onLine) {
      syncOfflineTasks();
    }
    
    // Store incomplete tasks for offline notifications
    if (Array.isArray(tasks)) {
      const incompleteTasks = tasks.filter(task => {
        // Skip null or undefined tasks
        if (!task) return false;
        return task.completed !== true;
      });
      localStorage.setItem('incompleteTasks', JSON.stringify(incompleteTasks));
    }
    
    return cleanup;
  }, [tasks]);

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
