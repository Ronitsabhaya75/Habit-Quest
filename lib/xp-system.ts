// XP values for different activities
export const XP_VALUES = {
  GAME_COMPLETION: 10,
  TASK_COMPLETION: 10,
  HABIT_CREATION: 20,
}

// Function to calculate level based on XP
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

// Function to calculate progress to next level
export function calculateLevelProgress(xp: number): number {
  return xp % 100
}
