"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from './use-toast'
import { useAuth } from '../context/auth-context'

export const useTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Fetch tasks from API
  const fetchTasks = useCallback(async (date) => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Build URL with optional date parameter
      let url = '/api/tasks'
      if (date) {
        const dateString = date instanceof Date 
          ? date.toISOString().split('T')[0] 
          : date
        url += `?date=${dateString}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTasks(data.data || [])
      } else {
        throw new Error(data.message || 'Failed to fetch tasks')
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])
  
  // Create new task
  const createTask = async (taskData) => {
    if (!user) return null
    
    try {
      setError(null)
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTasks(prev => [...prev, data.data])
        return data.data
      } else {
        throw new Error(data.message || 'Failed to create task')
      }
    } catch (err) {
      console.error('Error creating task:', err)
      setError(err.message)
      return null
    }
  }
  
  // Update task
  const updateTask = async (taskId, updateData) => {
    if (!user) return false
    
    try {
      setError(null)
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTasks(prev => 
          prev.map(task => task._id === taskId ? { ...task, ...data.data } : task)
        )
        return true
      } else {
        throw new Error(data.message || 'Failed to update task')
      }
    } catch (err) {
      console.error('Error updating task:', err)
      setError(err.message)
      return false
    }
  }
  
  // Delete task
  const deleteTask = async (taskId) => {
    if (!user) return false
    
    try {
      setError(null)
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTasks(prev => prev.filter(task => task._id !== taskId))
        return true
      } else {
        throw new Error(data.message || 'Failed to delete task')
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err.message)
      return false
    }
  }
  
  // Toggle task completion status
  const toggleTaskCompletion = async (taskId) => {
    const task = tasks.find(task => task._id === taskId)
    if (!task) return false
    
    return await updateTask(taskId, { completed: !task.completed })
  }
  
  // Load tasks on component mount or when user changes
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])
  
  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  }
} 