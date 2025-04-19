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

  // Add a new habit
  const addHabit = (habit) => {
    const newHabit = {
      ...habit,
      id: Date.now(),
      createdDate: new Date().toISOString(),
      completedDates: [],
    };
    
    const updatedHabits = [...habits, newHabit];
    saveHabits(updatedHabits);
    return newHabit;
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
    
    return updatedHabits.find(h => h.id === habitId);
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