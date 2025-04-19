import { addDays, addWeeks, addMonths } from 'date-fns';

/**
 * Calculates the next occurrence date for a recurring task
 * @param {Date} currentDate - The current due date
 * @param {string} frequency - The recurrence frequency ('daily', 'weekly', 'biweekly', 'monthly')
 * @param {Date|null} endDate - Optional end date for recurring tasks
 * @returns {Date|null} - The next occurrence date or null if beyond end date
 */
export function getNextOccurrenceDate(currentDate, frequency, endDate = null) {
  let nextDate;
  
  switch (frequency) {
    case 'daily':
      nextDate = addDays(new Date(currentDate), 1);
      break;
    case 'weekly':
      nextDate = addWeeks(new Date(currentDate), 1);
      break;
    case 'biweekly':
      nextDate = addWeeks(new Date(currentDate), 2);
      break;
    case 'monthly':
      nextDate = addMonths(new Date(currentDate), 1);
      break;
    default:
      nextDate = addDays(new Date(currentDate), 1);
  }
  
  // If there's an end date and the next occurrence is after that date, return null
  if (endDate && nextDate > new Date(endDate)) {
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