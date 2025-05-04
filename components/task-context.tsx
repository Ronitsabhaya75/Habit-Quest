"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"

// Define the task interface
export interface Task {
  _id: string
  title: string
  description?: string
  dueDate: Date
  dueDateString?: string  // Add this field to allow explicit date string passing
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
  fetchTasks: (dateString?: string) => Promise<void>
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
  dueDateString?: string  // Add this field to allow explicit date string passing
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
      // Track if we're checking achievements offline
      const isOffline = !navigator.onLine;
      
      // Use this function to show achievement notifications
      const notifyAchievementUnlocked = (achievement: any) => {
        toast.success(`🏆 Achievement Unlocked: ${achievement.name} (+${achievement.xpReward} XP)`, {
          duration: 5000,
          icon: '🏆'
        });
        
        // Trigger event for dashboard to update
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('achievement-unlocked', { 
            detail: { achievements: [achievement] }
          }));
        }
      };
      
      // If offline, handle achievements locally
      if (isOffline) {
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
          notifyAchievementUnlocked(achievement);
        });
        
        return;
      }
      
      // If online, fetch from server with retry logic
      const checkWithRetry = async (retries = 3) => {
        try {
          const response = await fetch('/api/achievements/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              taskCompleted: true,
              tasksCompletedCount: completedTaskCount,
              updatedTaskId: taskId
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Achievement check failed with status ${response.status}`);
          }
          
          const data = await response.json();
          
          // Show notifications for newly unlocked achievements
          if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
            data.unlockedAchievements.forEach((achievement: any) => {
              notifyAchievementUnlocked(achievement);
            });
          }
          
          return data;
        } catch (error) {
          console.error(`Achievement check attempt failed (${retries} retries left):`, error);
          if (retries > 0) {
            // Wait 500ms before trying again
            await new Promise(resolve => setTimeout(resolve, 500));
            return checkWithRetry(retries - 1);
          }
          throw error;
        }
      };
      
      // Attempt achievement check with retries
      await checkWithRetry();
      
    } catch (error) {
      console.error("Error checking achievements:", error);
      // Even on error, try to update UI to show any local achievements
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('refresh-achievements'));
      }
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
    if (!("Notification" in window)) {
      console.log("Notifications not supported in this browser");
      return;
    }
    
    // Request permission if needed - show this more prominently to users
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      // Show a custom UI element explaining why we need notification permission
      toast({
        title: "Enable notifications",
        description: "Allow notifications to get reminders about your tasks when offline",
        action: (
          <div className="flex gap-2 mt-2">
            <Button 
              onClick={() => {
                Notification.requestPermission().then(permission => {
                  if (permission === "granted") {
                    toast.success("Notifications enabled!");
                    // Register service worker after permission is granted
                    registerServiceWorker();
                    // Try to schedule notifications again
                    setTimeout(scheduleIncompleteTaskNotifications, 1000);
                  }
                });
              }}
              className="bg-[#7FE9FF] text-[#050714] hover:bg-[#7FE9FF]/80"
            >
              Allow
            </Button>
          </div>
        ),
        duration: 10000
      });
      return;
    }
    
    if (Notification.permission !== "granted") {
      console.log("Notification permission not granted");
      return;
    }
    
    // Register service worker for notifications if not already registered
    registerServiceWorker();
    
    // Get incomplete tasks from local storage
    const incompleteTasks = JSON.parse(localStorage.getItem('incompleteTasks') || '[]');
    
    // Schedule notifications for tasks due soon
    incompleteTasks.forEach((task: any) => {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      
      // If task is due today or in the next 24 hours
      if (dueDate > now && dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
        // Try to use service worker for notifications first
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          // Send message to service worker to schedule notification
          navigator.serviceWorker.controller.postMessage({
            type: 'SCHEDULE_NOTIFICATION',
            payload: {
              id: task._id || task.id,
              title: "Task Reminder",
              body: `Don't forget to complete your task: ${task.title}`,
              icon: "/favicon.ico",
              // Schedule notification after 5 seconds as an example
              // In a real app, you'd calculate this based on the due time
              showAt: new Date(Date.now() + 5000).getTime()
            }
          });
        } else {
          // Fallback to regular notifications if service worker is not available
          try {
            const notification = new Notification("Task Reminder", {
              body: `Don't forget to complete your task: ${task.title}`,
              icon: "/favicon.ico"
            });
            
            // Close notification after 5 seconds
            setTimeout(() => {
              notification.close();
            }, 5000);
          } catch (error) {
            console.error("Error showing notification:", error);
          }
        }
      }
    });
  };
  
  // Function to register the service worker for notifications
  const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/notification-service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    } else {
      console.log('Service workers are not supported by this browser');
    }
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

  const fetchTasks = async (dateString?: string) => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams()
      if (dateString) {
        // Check if this is a month query (YYYY-MM) or a day query (YYYY-MM-DD)
        const isMonthQuery = dateString.split('-').length === 2;
        
        if (isMonthQuery) {
          console.log(`Fetching tasks for month: ${dateString}`);
          // For month queries, convert to proper format
          queryParams.set("month", dateString);
        } else {
          // For day queries, use the date parameter
          queryParams.set("date", dateString);
        }
      }

      const url = `/api/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      console.log("Fetching tasks from URL:", url)

      // Add retry logic for reliability
      let response;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          response = await fetch(url);
          if (response.ok) break;
          
          // If server error, retry
          if (response.status >= 500) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          } else {
            // If client error, don't retry
            break;
          }
        } catch (fetchError) {
          console.error(`Fetch attempt ${retryCount + 1} failed:`, fetchError);
          retryCount++;
          
          if (retryCount >= maxRetries) throw fetchError;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`HTTP error! Status: ${response?.status || 'unknown'}`);
      }

      const result = await response.json();
      
      // Log the full response for debugging
      console.log("Task API response:", result);
      
      // Process the response
      let data;
      if (result.success && result.data) {
        data = result.data;
      } else if (data && Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error("Unexpected API response format:", data);
        setTasks([]);
      }
      
      // Standardize date formats in tasks before storing them
      if (Array.isArray(data)) {
        const formattedTasks = data.map(task => {
          if (task.dueDate) {
            // Ensure dueDateString is consistent
            const taskDate = new Date(task.dueDate);
            // Set time to noon to avoid timezone issues
            taskDate.setHours(12, 0, 0, 0);
            if (!task.dueDateString) {
              task.dueDateString = taskDate.toISOString().split('T')[0];
            }
          }
          return task;
        });
        
        // Merge with existing tasks, don't replace (to maintain cached state)
        setTasks(prevTasks => {
          // Create a map of existing tasks by ID
          const taskMap = new Map(prevTasks.map(task => [task._id, task]));
          
          // Update or add new tasks
          formattedTasks.forEach(task => {
            taskMap.set(task._id, task);
          });
          
          // Convert back to array
          return Array.from(taskMap.values());
        });
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to fetch tasks");
      // Only clear tasks on error if it's the initial load
      if (tasks.length === 0) {
        setTasks([]);
      }
    } finally {
      setLoading(false);
    }
  }

  const addTask = async (taskData: AddTaskInput) => {
    try {
      setLoading(true);
      
      // Ensure taskData has required fields
      if (!taskData.dueDate) {
        taskData.dueDate = new Date();
      }
      
      // Add debugging for recurring tasks
      if (taskData.isRecurring) {
        console.log(`Adding recurring task: ${taskData.title}`);
        console.log(`Frequency: ${taskData.frequency}`);
        console.log(`Start date: ${taskData.dueDate}`);
        console.log(`End date: ${taskData.recurringEndDate}`);
      }
      
      // Standardize the date format
      // Set to noon to avoid timezone issues
      const taskDate = new Date(taskData.dueDate);
      taskDate.setHours(12, 0, 0, 0);
      
      // Ensure we have a dueDateString in YYYY-MM-DD format
      const dueDateString = taskData.dueDateString || taskDate.toISOString().split('T')[0];
      
      console.log("Adding task with due date:", taskDate.toISOString(), "string:", dueDateString);
      
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskData,
          // Use standardized date formats
          dueDate: taskDate.toISOString(),
          dueDateString: dueDateString,
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
      const newTask = data.data;
      
      // Add the standardized dueDateString if it's not there
      if (newTask && !newTask.dueDateString && newTask.dueDate) {
        const newTaskDate = new Date(newTask.dueDate);
        newTask.dueDateString = newTaskDate.toISOString().split('T')[0];
      }
      
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
      
      // Add dueDateString if we're updating dueDate
      if (taskData.dueDate && !taskData.dueDateString) {
        const dueDate = new Date(taskData.dueDate);
        formattedData.dueDateString = dueDate.toISOString().split('T')[0];
      }
      
      // Try the update endpoint first
      const response = await fetch("/api/tasks/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Task update API error (${response.status}):`, errorText);
        
        // If this is a 405 Method Not Allowed, try POST instead
        if (response.status === 405) {
          console.log("PUT method failed, trying POST instead");
          const postResponse = await fetch("/api/tasks/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedData)
          });
          
          if (!postResponse.ok) {
            const postErrorText = await postResponse.text();
            console.error(`Task update POST API error (${postResponse.status}):`, postErrorText);
            throw new Error(`HTTP error! Status: ${postResponse.status}`);
          }
          
          const data = await postResponse.json();
          
          // Update the task in the local state
          setTasks((prevTasks) =>
            prevTasks.map((task) => (task._id === taskData.id ? { ...task, ...formattedData, ...data.data } : task))
          );
          
          toast.success("Task updated successfully");
          return true;
        }
        
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update the task in the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskData.id ? { ...task, ...formattedData, ...data.data } : task))
      );
      
      toast.success("Task updated successfully");
      return true;
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
      toast.error("Failed to update task");
      return false;
    } finally {
      setLoading(false);
    }
  };

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
        
        // Update local streak data
        updateLocalStreak();
        
        toast.success("Task completed! (offline mode)");
        return null;
      }
      
      console.log(`Completing task with ID: ${id}`);
      
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
      const nextInstance = data.nextInstance;
      
      console.log("Task update response:", data);
      
      // Update the completed task in state
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((t) => (t._id === id ? updatedTask : t));
        
        // Add next instance if it was created
        if (nextInstance) {
          console.log("Adding next instance to task list:", nextInstance);
          return [...updatedTasks, nextInstance];
        }
        
        return updatedTasks;
      });
      
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
      
      // Refresh user data to show updated streak
      refreshUserData();
      
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

  // Function to update streak locally when offline
  const updateLocalStreak = () => {
    try {
      // Get current streak data
      const streakData = JSON.parse(localStorage.getItem('userStreak') || '{"count": 0, "lastActive": null}');
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Convert lastActive to Date object if it exists
      let lastActive = null;
      if (streakData.lastActive) {
        lastActive = new Date(streakData.lastActive);
      }
      
      // If no previous activity or not today
      if (!lastActive || lastActive.toDateString() !== today.toDateString()) {
        // Create yesterday date for comparison
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If last active was yesterday, increment streak
        if (lastActive && lastActive.toDateString() === yesterday.toDateString()) {
          streakData.count += 1;
        } 
        // If last active was before yesterday, reset streak
        else if (!lastActive || lastActive < yesterday) {
          streakData.count = 1;
        }
        
        // Update last active date to today
        streakData.lastActive = today.toISOString();
        
        // Save updated streak data
        localStorage.setItem('userStreak', JSON.stringify(streakData));
        
        // Show streak notification
        if (streakData.count > 1) {
          toast.success(`🔥 Day ${streakData.count} streak! Keep it up!`, {
            icon: '🔥',
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error('Error updating local streak:', error);
    }
  };
  
  // Function to refresh user data after task completion
  const refreshUserData = async () => {
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const userData = await response.json();
        
        // If user has a streak > 1, show streak notification
        if (userData.data?.streak > 1) {
          toast.success(`🔥 ${userData.data.streak} day streak! Keep going!`, {
            icon: '🔥',
            duration: 3000
          });
        }
        
        // Dispatch user data update event
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('user-data-updated', { 
            detail: { userData: userData.data }
          }));
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
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
    
      // First ensure tasks is actually an array before filtering
      if (!Array.isArray(tasks)) {
        console.log("Tasks is not an array in getTasksForDate");
        return [];
      }
      
      // Format date string for consistent comparison
      const dateStr = startOfDay.toISOString().split('T')[0]; // YYYY-MM-DD
      
      return tasks.filter(task => {
        // Skip null or undefined tasks
        if (!task) return false;
        
        // First try to match using the dueDateString field
        if (task.dueDateString && task.dueDateString === dateStr) {
          return true;
        }
        
        // Fallback to date object comparison
        if (!task.dueDate) return false;
        
        // Parse the date safely (could be string or Date object)
        let taskDate: Date;
        try {
          taskDate = new Date(task.dueDate);
          // Normalize time to noon to avoid timezone issues
          taskDate.setHours(12, 0, 0, 0);
          const taskDateStr = taskDate.toISOString().split('T')[0];
          return taskDateStr === dateStr;
        } catch (e) {
          console.error('Invalid date format:', task.dueDate);
          return false;
        }
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
