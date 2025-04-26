'use client'

import { useEffect } from 'react'

// Function to initialize achievements
async function initializeAchievements() {
  try {
    // Call the initialization API
    const response = await fetch('/api/achievements/init')
    const data = await response.json()
    console.log('Achievement initialization:', data.success ? 'Success' : 'Failed')
  } catch (error) {
    console.error('Failed to initialize achievements:', error)
  }
}

// Component that will initialize achievements when mounted
export function InitializeAchievements() {
  useEffect(() => {
    // Only run in development or when specifically needed
    if (process.env.NODE_ENV === 'development') {
      initializeAchievements()
    }
  }, [])

  return null // This component doesn't render anything
} 