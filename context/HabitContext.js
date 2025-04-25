"use client"

import { createContext, useContext, useState, useEffect } from 'react';

const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [progress, setProgress] = useState({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load habits from localStorage on component mount
    const storedHabits = localStorage.getItem('habits');
    const storedProgress = localStorage.getItem('habitProgress');
    const storedStreak = localStorage.getItem('streak');
    
    if (storedHabits) {
      try {
        setHabits(JSON.parse(storedHabits));
      } catch (error) {
        console.error('Error parsing stored habits:', error);
      }
    }
    
    if (storedProgress) {
      try {
        setProgress(JSON.parse(storedProgress));
      } catch (error) {
        console.error('Error parsing stored progress:', error);
      }
    }
    
    if (storedStreak) {
      try {
        setStreak(parseInt(storedStreak, 10));
      } catch (error) {
        console.error('Error parsing stored streak:', error);
      }
    }
  }, []);

  // Function to save habits to localStorage
  const saveHabits = (updatedHabits) => {
    localStorage.setItem('habits', JSON.stringify(updatedHabits));
    setHabits(updatedHabits);
  };

  // Function to save progress to localStorage
  const saveProgress = (updatedProgress) => {
    localStorage.setItem('habitProgress', JSON.stringify(updatedProgress));
    setProgress(updatedProgress);
  };

  // Add a new habit and create corresponding task
  const addHabit = async (habit) => {
    const newHabit = {
      ...habit,
      id: Date.now(),
      createdDate: new Date().toISOString(),
      completedDates: [],
    };
    
    const updatedHabits = [...habits, newHabit];
    saveHabits(updatedHabits);
    
    // Create a corresponding task entry in the tasks system
    try {
      // Create today's task for this habit
      await createTaskForHabit(newHabit);
      
      console.log('Habit task created successfully');
    } catch (error) {
      console.error('Failed to create task for habit:', error);
    }
    
    return newHabit;
  };
  
  // Helper function to create a task for a habit
  const createTaskForHabit = async (habit) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${habit.name || 'Daily Habit'} 💪`,
          description: habit.description || 'Complete your daily habit',
          dueDate: new Date().toISOString(), // Today
          xpReward: habit.xpReward || 30,
          isHabit: true,
          isRecurring: true,
          frequency: habit.frequency || 'daily',
          recurringEndDate: habit.endDate || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating task for habit:', error);
      throw error;
    }
  };

  // Complete a habit for today
  const completeHabit = async (habitId) => {
    const todayKey = new Date().toISOString().split('T')[0];
    
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId && !habit.completedDates.includes(todayKey)) {
        return {
          ...habit,
          completedDates: [...habit.completedDates, todayKey]
        };
      }
      return habit;
    });
    
    saveHabits(updatedHabits);
    
    // Update progress
    await updateProgress('habits', 30);
    
    // Check and update streak
    updateStreak();
    
    // Find the corresponding task for this habit and mark it as completed
    try {
      const habitToComplete = updatedHabits.find(h => h.id === habitId);
      if (habitToComplete) {
        await completeHabitTask(habitToComplete);
      }
    } catch (error) {
      console.error('Failed to complete habit task:', error);
    }
    
    return updatedHabits.find(h => h.id === habitId);
  };
  
  // Helper function to complete the corresponding task for a habit
  const completeHabitTask = async (habit) => {
    try {
      // Get today's tasks
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/tasks?date=${today}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success || !data.data) {
        throw new Error('Invalid response from tasks API');
      }
      
      // Find the task that corresponds to this habit
      const habitTask = data.data.find(task => 
        task.isHabit && 
        task.title.includes(habit.name || 'Daily Habit')
      );
      
      if (habitTask) {
        // Complete the task
        await fetch(`/api/tasks/${habitTask._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completed: true,
          }),
        });
      }
    } catch (error) {
      console.error('Error completing habit task:', error);
    }
  };

  // Update streak
  const updateStreak = () => {
    // Calculate current streak based on continuous days of habit completion
    const today = new Date();
    let currentStreak = 0;
    
    for (let i = 0; i < 30; i++) { // Check up to 30 days back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = checkDate.toISOString().split('T')[0];
      
      // Check if at least one habit was completed on this day
      const hasCompletedHabit = habits.some(habit => 
        habit.completedDates.includes(dateKey)
      );
      
      if (hasCompletedHabit) {
        currentStreak++;
      } else if (i > 0) { // Don't break on the first day (today)
        break;
      }
    }
    
    localStorage.setItem('streak', currentStreak.toString());
    setStreak(currentStreak);
    return currentStreak;
  };

  // Get current streak
  const getStreak = () => {
    return streak;
  };

  // Update progress for a category
  const updateProgress = async (category, points) => {
    const updatedProgress = {
      ...progress,
      [category]: (progress[category] || 0) + points
    };
    
    saveProgress(updatedProgress);
    return updatedProgress;
  };

  // Get progress for a specific date or category
  const getCategoryProgress = (date) => {
    // Return total progress for now
    return Object.values(progress).reduce((sum, p) => sum + p, 0);
  };

  return (
    <HabitContext.Provider value={{
      habits,
      progress,
      addHabit,
      completeHabit,
      updateProgress,
      getStreak,
      getCategoryProgress,
      streak,
      setStreak,
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabit = () => useContext(HabitContext); 