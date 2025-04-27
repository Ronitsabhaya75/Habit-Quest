"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { MainLayout } from "../../components/main-layout"
import { Button } from "../../components/ui/button"
import { ChessGame } from "../../components/games/chess-game"
import { QuizGame } from "../../components/games/quiz-game"
import { WordScrambler } from "../../components/games/word-scrambler"
import { SpinWheel } from "../../components/games/spin-wheel"
import { HabitChallengeCenter } from "../../components/games/habit-challenge-center"
import { PacmanGame } from "../../components/games/pacman-game"
import { MemoryGame } from "../../components/games/memory-game"
import { Badge } from "../../components/ui/badge"
import { Search } from "lucide-react"

export default function BreakthroughGame() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  
  const games = [
    {
      id: "chess",
      name: "Chess",
      description: "Test your strategic thinking",
      component: ChessGame,
      icon: "♟️",
      difficulty: "hard"
    },
    {
      id: "quiz",
      name: "Quiz Game",
      description: "Test your knowledge",
      component: QuizGame,
      icon: "❓",
      difficulty: "easy"
    },
    {
      id: "wordscrambler",
      name: "Word Scrambler",
      description: "Unscramble words quickly",
      component: WordScrambler,
      icon: "🔤",
      difficulty: "medium"
    },
    {
      id: "spinwheel",
      name: "Spin Wheel",
      description: "Try your luck",
      component: SpinWheel,
      icon: "🎡",
      difficulty: "easy"
    },
    {
          id: "habit-challenge",
          name: "Habit Challenge Center",
          description: "Build habits through challenges",
          component: HabitChallengeCenter,
          icon: "🌟",
          difficulty: "medium"
        },
    {
      id: "pacman",
      name: "Pacman",
      description: "Classic arcade game",
      component: PacmanGame,
      icon: "🟡",
      difficulty: "medium"
    },
    {
      id: "memory",
      name: "Memory Match",
      description: "Find matching pairs",
      component: MemoryGame,
      icon: "🧠",
      difficulty: "medium"
    },
  ]
  
  const GameComponent = activeGame ? games.find((game) => game.id === activeGame)?.component : null
  
  return (
    <MainLayout>
      <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Breakthrough Games</h1>
          <p className="text-gray-400">Play games to earn XP and break through your limits</p>
        </div>
        
        {!activeGame ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card
                key={game.id}
                className="bg-[#1a2332]/80 border-[#2a3343] hover:border-[#4cc9f0]/50 transition-all cursor-pointer"
                onClick={() => setActiveGame(game.id)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{game.icon}</span>
                    <CardTitle className="text-xl text-white">{game.name}</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">Difficulty:</span>
                    <Badge
                      className={
                        game.difficulty === "easy"
                          ? "bg-green-500"
                          : game.difficulty === "hard"
                            ? "bg-red-500"
                            : "bg-[#4cc9f0]"
                      }
                    >
                      {game.difficulty}
                    </Badge>
                  </div>
                  <Button className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">Play Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-[#1a2332]/80 border-[#2a3343]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{games.find((game) => game.id === activeGame)?.icon}</span>
                <CardTitle className="text-xl text-white">{games.find((game) => game.id === activeGame)?.name}</CardTitle>
              </div>
              <Button
                variant="outline"
                className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
                onClick={() => setActiveGame(null)}
              >
                Back to Games
              </Button>
            </CardHeader>
            <CardContent>{GameComponent && <GameComponent />}</CardContent>
          </Card>
        )}
      </main>
    </MainLayout>
  )
}
