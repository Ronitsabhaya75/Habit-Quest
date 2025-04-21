"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"

interface Achievement {
  id: number
  name: string
  description: string
  progress: number
  xpReward: number
  completed: boolean
}

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchAchievements() {
      try {
        setLoading(true)
        setError(false)

        const res = await fetch("/api/achievements")

        if (!res.ok) {
          console.error("Achievements fetch failed with status:", res.status)
          setError(true)
          // Use placeholder data instead of showing an error
          setAchievements(generatePlaceholderData())
          return
        }

        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Achievements API returned non-JSON response:", contentType)
          setError(true)
          // Use placeholder data instead of showing an error
          setAchievements(generatePlaceholderData())
          return
        }

        const data = await res.json()
        if (data.success) {
          setAchievements(data.data)
        } else {
          setError(true)
          // Use placeholder data instead of showing an error
          setAchievements(generatePlaceholderData())
        }
      } catch (error) {
        console.error("Achievements error:", error)
        setError(true)
        // Use placeholder data instead of showing an error
        setAchievements(generatePlaceholderData())
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [])

  // Generate placeholder data if the API fails
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
    ]
  }

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

  // If no achievements yet, show sample data
  const achievementsData = achievements.length > 0 ? achievements : generatePlaceholderData()

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-amber-400 text-xs mb-2 italic">
          * Using sample data. Achievements will update when connection is restored.
        </div>
      )}

      {achievementsData.map((achievement) => (
        <div key={achievement.id} className="space-y-2">
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
              className={`h-2 flex-1 ${achievement.completed ? "bg-green-900/30" : "bg-[#2a3343]"}`}
            />
            <span className="text-white text-xs">{achievement.progress}%</span>
          </div>
        </div>
      ))}

      <Button className="w-full mt-4 bg-[#2a3343] hover:bg-[#3a4353] text-white">View All Achievements</Button>
    </div>
  )
}
