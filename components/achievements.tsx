"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Trophy } from "lucide-react"

// Define the structure for an achievement
interface Achievement {
  id: number
  name: string
  description: string
  progress: number
  xpReward: number
  completed: boolean
}

export function Achievements() {
  // Local state to store achievement data, loading state, and error state
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visibleAchievements, setVisibleAchievements] = useState(4) // Show 4 by default
  const [shouldRefresh, setShouldRefresh] = useState(false)

  // Add event listener for achievement unlocks
  useEffect(() => {
    const handleAchievementUnlocked = () => {
      // Trigger a refresh of achievements
      setShouldRefresh(prev => !prev);
    };

    // Listen for the custom event
    window.addEventListener('achievement-unlocked', handleAchievementUnlocked);
    
    // Clean up
    return () => {
      window.removeEventListener('achievement-unlocked', handleAchievementUnlocked);
    };
  }, []);

  // Fetch achievements when the component mounts or when achievements are unlocked
  useEffect(() => {
    async function fetchAchievements() {
      try {
        setLoading(true)
        setError(false)

        const res = await fetch("/api/achievements")

        // If API call fails, show placeholder data
        if (!res.ok) {
          console.error("Achievements fetch failed with status:", res.status)
          setError(true)
          setAchievements(generatePlaceholderData())
          return
        }

        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Achievements API returned non-JSON response:", contentType)
          setError(true)
          setAchievements(generatePlaceholderData())
          return
        }

        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setAchievements(data.data)
        } else {
          console.error("Invalid achievements data structure:", data)
          setError(true)
          setAchievements(generatePlaceholderData())
        }
      } catch (error) {
        console.error("Achievements error:", error)
        setError(true)
        setAchievements(generatePlaceholderData())
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [shouldRefresh])

  // Generate placeholder data to use when the API fails or returns nothing
  const generatePlaceholderData = (): Achievement[] => {
    return [
      {
        id: 1,
        name: "First Steps",
        description: "Complete your first task",
        progress: 100,
        xpReward: 10,
        completed: true,
      },
      {
        id: 2,
        name: "Habit Starter",
        description: "Create your first habit",
        progress: 75,
        xpReward: 20,
        completed: false,
      },
      {
        id: 3,
        name: "Game Master",
        description: "Play all mini games",
        progress: 50,
        xpReward: 30,
        completed: false,
      },
      {
        id: 4,
        name: "Streak Keeper",
        description: "Maintain a 7-day streak",
        progress: 30,
        xpReward: 50,
        completed: false,
      },
      {
        id: 5,
        name: "Task Champion",
        description: "Complete 5 tasks in a day",
        progress: 20,
        xpReward: 40,
        completed: false,
      },
    ]
  }

  // Function to handle "View All Achievements" button click
  const viewAllAchievements = () => {
    // Check if we're already showing all achievements
    if (visibleAchievements === achievements.length) {
      // If we're already showing all, collapse to show only 4
      setVisibleAchievements(4);
    } else {
      // Show all achievements
      setVisibleAchievements(achievements.length);
    }
  }

  // Show loading animation while data is being fetched
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="space-y-2 animate-pulse">
            <div className="flex justify-between items-start">
              <div>
                <div className="h-4 w-32 bg-gray-600 rounded mb-2"></div>
                <div className="h-3 w-48 bg-gray-600 rounded"></div>
              </div>
              <div className="h-4 w-12 bg-gray-600 rounded"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 flex-1 bg-gray-600 rounded"></div>
              <div className="h-3 w-8 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Fallback to placeholder data if achievements array is empty
  const achievementsData = achievements.length > 0 ? achievements : generatePlaceholderData()

  // Show only the first N achievements based on visibleAchievements state
  const displayedAchievements = achievementsData.slice(0, visibleAchievements)

  return (
    <div className="space-y-4">
      {/* Header with icon */}
      <div className="flex items-center mb-2">
        <Trophy className="text-[#4cc9f0] w-5 h-5 mr-2" />
        <h3 className="text-xl font-medium text-white">Achievements</h3>
      </div>
      
      {/* Show warning if sample data is being used due to an error */}
      {error && (
        <div className="text-amber-400 text-xs mb-2 italic">
          * Using sample data. Achievements will update when connection is restored.
        </div>
      )}

      {/* Display achievements or empty state */}
      {achievementsData.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          No achievements yet. Complete tasks and build habits to earn achievements!
        </div>
      ) : (
        <div className="space-y-4">
          {/* Render each achievement */}
          {displayedAchievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`space-y-2 p-2 rounded-md hover:bg-[#2a3343] transition-colors ${
                achievement.completed ? "border-l-2 border-green-500" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium flex items-center">
                    {achievement.completed && <span className="text-green-400 mr-2">✓</span>}
                    {achievement.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{achievement.description}</p>
                </div>
                <span className="text-[#4cc9f0] font-bold px-2 py-1 bg-[#2a3343] rounded-md text-sm">
                  {achievement.xpReward} XP
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress
                  value={achievement.progress}
                  max={100}
                  className={`h-2 flex-1 ${
                    achievement.completed 
                    ? "bg-green-900/30 [&>div]:bg-green-500" 
                    : "bg-[#2a3343] [&>div]:bg-[#4cc9f0]"
                  }`}
                />
                <span className="text-white text-xs">{achievement.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Button to toggle view all/collapse achievements */}
      <Button 
        className="w-full bg-[#2a3343] hover:bg-[#3a4353] text-white" 
        onClick={viewAllAchievements}
      >
        {visibleAchievements < achievementsData.length 
          ? "View All Achievements" 
          : "Show Less"}
      </Button>
    </div>
  )
}
