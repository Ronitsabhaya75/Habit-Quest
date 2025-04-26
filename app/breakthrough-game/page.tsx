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
import Link from "next/link"

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
    <div className="min-h-screen bg-[#0f172a] text-white">
      <header className="border-b border-[#2a3343] p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">HabitQuest</h1>
          
          <div className="hidden md:flex items-center justify-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2a3343]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
              </div>
              <span className="text-sm ml-1">Dashboard</span>
            </Link>

            <Link href="/breakthrough-game" className="flex items-center space-x-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2a3343]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <span className="text-sm ml-1">Mini Game</span>
            </Link>
            
            <Link href="/habits" className="flex items-center space-x-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2a3343]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <span className="text-sm ml-1">Habit Creation</span>
            </Link>
            
            <Link href="/fitness" className="flex items-center space-x-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2a3343]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              </div>
              <span className="text-sm ml-1">Fitness</span>
            </Link>
            
            <Link href="/shop" className="flex items-center space-x-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2a3343]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <span className="text-sm ml-1">Shop</span>
            </Link>
            
            <Link href="/review" className="flex items-center space-x-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2a3343]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <span className="text-sm ml-1">Review</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search..."
                className="py-2 pl-10 pr-4 bg-[#2a3343] rounded-full w-64 focus:outline-none focus:ring-1 focus:ring-[#4cc9f0]"
              />
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4cc9f0] text-black text-sm font-medium">
              U
            </div>
          </div>
        </div>
      </header>
      
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
      
      <footer className="border-t border-[#2a3343] p-4 text-center text-gray-400 text-sm">
        © 2025 HabitQuest. All rights reserved.
      </footer>
    </div>
  )
}
