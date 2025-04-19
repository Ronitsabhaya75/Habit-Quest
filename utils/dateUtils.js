import { addDays, addWeeks, addMonths } from 'date-fns';

/**
 * Safely parses a date string or Date object into a valid Date object
 * @param {string|Date} dateInput - The date input to parse
 * @returns {Date} - A valid Date object
 */
export function safelyParseDate(dateInput) {
  if (!dateInput) return null;
  
  try {
    // If it's already a Date object
    if (dateInput instanceof Date) {
      return new Date(dateInput);
    }
    
    // If it's an ISO string or other string format
    return new Date(dateInput);
  } catch (error) {
    console.error("Date parsing error:", error);
    // Fallback to current date
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
  // Safely parse dates
  const parsedCurrentDate = safelyParseDate(currentDate);
  const parsedEndDate = endDate ? safelyParseDate(endDate) : null;
  
  if (!parsedCurrentDate) {
    console.error("Invalid current date provided:", currentDate);
    return null;
  }
  
  let nextDate;
  
  try {
    switch (frequency) {
      case 'daily':
        nextDate = addDays(parsedCurrentDate, 1);
        break;
      case 'weekly':
        nextDate = addWeeks(parsedCurrentDate, 1);
        break;
      case 'biweekly':
        nextDate = addWeeks(parsedCurrentDate, 2);
        break;
      case 'monthly':
        nextDate = addMonths(parsedCurrentDate, 1);
        break;
      default:
        nextDate = addDays(parsedCurrentDate, 1);
    }
  } catch (error) {
    console.error("Error calculating next date:", error);
    // Default to tomorrow if calculation fails
    nextDate = addDays(new Date(), 1);
  }
  
  // If there's an end date and the next occurrence is after that date, return null
  if (parsedEndDate && nextDate > parsedEndDate) {
    return null;
  }
  
  return nextDate;
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
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
} 