"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RefreshCcw, LogOut, Rocket, Award, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { PerformanceChart } from "@/components/performance-chart"
import { Leaderboard } from "@/components/leaderboard"
import { Achievements } from "@/components/achievements"
import { TodaysTasks } from "@/components/todays-tasks"
import { MainLayout } from "@/components/main-layout"
import { useAuth } from "@/context/auth-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  const router = useRouter()
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const { user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [completionRate, setCompletionRate] = useState({
    rate: 0,
    target: 90,
    change: 0,
  })

  useEffect(() => {
    setMounted(true)

    // Fetch completion rate data
    // This would normally come from an API
    const fetchCompletionRate = async () => {
      try {
        // Placeholder for API call
        // const res = await fetch('/api/stats/completion-rate');
        // const data = await res.json();
        // setCompletionRate(data);

        // For now, using placeholder data
        setCompletionRate({
          rate: 85,
          target: 90,
          change: 5,
        })
      } catch (error) {
        console.error("Failed to fetch completion rate:", error)
      }
    }

    fetchCompletionRate()
  }, [])

  if (!mounted) return null

  // Calculate XP needed for next level
  const currentLevel = user?.level || 1
  const currentXP = user?.xp || 0
  const xpForCurrentLevel = (currentLevel - 1) * 100
  const xpForNextLevel = currentLevel * 100
  const xpProgress = ((currentXP - xpForCurrentLevel) / 100) * 100
  const xpNeeded = Math.max(0, xpForNextLevel - currentXP)

  // Calculate streak data
  const currentStreak = user?.streak || 0
  const maxStreak = 14
  const daysToMaxStreak = Math.max(0, maxStreak - currentStreak)

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {user?.username || "User"}! 👋</h1>
          <p className="text-gray-400">
            You have {currentXP} XP total and a {currentStreak}-day streak!
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-transparent hover:bg-[#2a3343] text-white border-[#2a3343]"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-[#111827] border-[#2a3343]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-white flex items-center">
              <Rocket className="mr-2 h-5 w-5 text-[#4cc9f0]" /> Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">Level {currentLevel}</div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-gray-400">{currentXP} XP</span>
              <span className="text-gray-400">{xpForNextLevel} XP</span>
            </div>
            <Progress value={xpProgress} max={100} className="h-2 bg-[#2a3343]" />
            <div className="mt-4 text-sm text-gray-400">{xpNeeded} XP needed for next level</div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#2a3343]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-white flex items-center">
              <Award className="mr-2 h-5 w-5 text-[#4cc9f0]" /> Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">{currentStreak} Days</div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-gray-400">Current</span>
              <span className="text-gray-400">{maxStreak} Days</span>
            </div>
            <Progress value={currentStreak} max={maxStreak} className="h-2 bg-[#2a3343]" />
            <div className="mt-4 text-sm text-gray-400">{daysToMaxStreak} days to max streak bonus</div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#2a3343]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-white flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-[#4cc9f0]" /> Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">{completionRate.rate}%</div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-gray-400">This Week</span>
              <span className="text-gray-400">Target: {completionRate.target}%</span>
            </div>
            <Progress value={completionRate.rate} max={100} className="h-2 bg-[#2a3343]" />
            <div className="mt-4 text-sm text-gray-400">{completionRate.change}% increase from last week</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="bg-[#111827] border-[#2a3343]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl text-white">Progress Overview</CardTitle>
              <div className="flex items-center space-x-2">
                <Tabs value={chartType} onValueChange={(value) => setChartType(value as "line" | "bar")}>
                  <TabsList className="bg-[#2a3343]">
                    <TabsTrigger
                      value="line"
                      className={chartType === "line" ? "bg-[#4cc9f0] text-black" : "text-white"}
                    >
                      Line
                    </TabsTrigger>
                    <TabsTrigger value="bar" className={chartType === "bar" ? "bg-[#4cc9f0] text-black" : "text-white"}>
                      Bar
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon" className="text-white">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PerformanceChart type={chartType} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-[#111827] border-[#2a3343] h-full">
            <CardHeader>
              <CardTitle className="text-xl text-white">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Leaderboard />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-[#111827] border-[#2a3343]">
          <CardHeader>
            <CardTitle className="text-xl text-white">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <Achievements />
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#2a3343]">
          <CardHeader>
            <CardTitle className="text-xl text-white">Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TodaysTasks />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
