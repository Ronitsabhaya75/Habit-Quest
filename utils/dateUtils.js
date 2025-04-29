import { addDays, addWeeks, addMonths } from 'date-fns';

/**
 * Safely parses a date string or Date object into a valid Date object
 * @param {string|Date} dateInput - The date input to parse
 * @returns {Date} - A valid Date object
 */
export function safelyParseDate(dateInput) {
  if (!dateInput) return new Date();
  
  try {
    // If it's already a Date object, return a clone to avoid mutation
    if (dateInput instanceof Date) return new Date(dateInput);
    
    // Otherwise parse the string
    return new Date(dateInput);
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date();
  }
}

/**
 * Calculates the next occurrence date for a recurring task
 * @param {Date|string} currentDate - The current due date
 * @param {string} frequency - The recurrence frequency ('daily', 'weekly', 'biweekly', 'monthly')
 * @param {Date|string|null} endDate - Optional end date for recurring tasks
 * @returns {Date|null} - The next occurrence date or null if beyond end date
 */
export function getNextOccurrenceDate(currentDate, frequency, endDate = null) {
  // Parse dates safely
  const current = safelyParseDate(currentDate);
  const end = endDate ? safelyParseDate(endDate) : null;
  
  // Set all dates to start of day to avoid time comparison issues
  current.setHours(0, 0, 0, 0);
  if (end) end.setHours(0, 0, 0, 0);
  
  // Calculate next date based on frequency
  let next;
  
  switch (frequency) {
    case 'daily':
      next = new Date(current);
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next = new Date(current);
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next = new Date(current);
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next = new Date(current);
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      // Default to daily if frequency is unknown
      console.warn(`Unknown frequency: ${frequency}, defaulting to daily`);
      next = new Date(current);
      next.setDate(next.getDate() + 1);
  }
  
  // Check if next date exceeds end date
  if (end && next > end) {
    console.log(`Next occurrence date ${next.toISOString()} exceeds end date ${end.toISOString()}`);
    return null;
  }
  
  return next;
}

/**
 * Checks if a recurring task should generate a new instance based on its end date
 * @param {Object} task - The task object
 * @returns {boolean} - True if a new instance should be created
 */
export function shouldCreateNextInstance(task) {
  if (!task.isRecurring) {
    return false;
  }
  
  // Validate task object
  if (!task.dueDate) {
    console.error("Task missing dueDate:", task);
    return false;
  }
  
  if (!task.recurringEndDate) {
    return true; // No end date means it recurs indefinitely
  }
  
  const nextDate = getNextOccurrenceDate(
    task.dueDate,
    task.frequency || 'daily',
    task.recurringEndDate
  );
  
  return nextDate !== null;
}

/**
 * Formats a date as YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export function formatDateForAPI(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Checks if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if dates are the same day
 */
export function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  
  const d1 = safelyParseDate(date1);
  const d2 = safelyParseDate(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Generates all occurrence dates between start and end date based on frequency
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @param {string} frequency - The recurrence frequency ('daily', 'weekly', 'biweekly', 'monthly')
 * @returns {Array<Date>} - Array of all occurrence dates
 */
export function generateOccurrenceDates(startDate, endDate, frequency) {
  // Parse dates safely
  const start = safelyParseDate(startDate);
  const end = safelyParseDate(endDate);
  
  // Set all dates to start of day to avoid time comparison issues
  start.setHours(12, 0, 0, 0);
  end.setHours(12, 0, 0, 0);
  
  // Ensure start is before end
  if (start > end) return [];
  
  const dates = [];
  let current = new Date(start);
  
  // Add the start date as the first occurrence
  dates.push(new Date(current));
  
  // Add subsequent dates until we reach or exceed the end date
  while (true) {
    const next = getNextOccurrenceDate(current, frequency);
    if (!next || next > end) break;
    
    dates.push(next);
    current = next;
  }
  
  return dates;
}

/**
 * Creates a task object from a habit with proper recurring settings
 * @param {Object} habit - The habit object
 * @returns {Object} - Task object ready to be saved
 */
export function createTaskFromHabit(habit, userId) {
  // Ensure dates are properly formatted
  const startDate = safelyParseDate(habit.startDate);
  const endDate = habit.endDate ? safelyParseDate(habit.endDate) : null;
  
  // Set to noon to avoid timezone issues
  startDate.setHours(12, 0, 0, 0);
  if (endDate) endDate.setHours(12, 0, 0, 0);
  
  // Create the task object
  const taskData = {
    title: habit.title || habit.name,
    description: habit.description,
    dueDate: startDate,
    user: userId,
    completed: false,
    completedAt: null,
    xpReward: habit.xpReward || 30,
    isHabit: true,
    isRecurring: true,
    frequency: habit.frequency || 'daily',
    recurringEndDate: endDate,
    dueDateString: formatDateForAPI(startDate)
  };
  
  console.log(`Creating habit task with frequency: ${taskData.frequency}, due date: ${taskData.dueDate}`);
  
  return taskData;
}