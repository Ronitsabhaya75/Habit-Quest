"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { SimpleGame } from "@/components/games/simple-game"
import { MemoryGame } from "@/components/games/memory-game"
import { QuizGame } from "@/components/games/quiz-game"
import { SpinWheel } from "@/components/games/spin-wheel"
import { WordScrambler } from "@/components/games/word-scrambler"

export default function MiniGames() {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  const games = [
    { id: "simple", name: "Target Clicker", description: "Test your reflexes", component: SimpleGame },
    { id: "memory", name: "Memory Match", description: "Find matching pairs", component: MemoryGame },
    { id: "quiz", name: "Quiz Game", description: "Test your knowledge", component: QuizGame },
    { id: "spinwheel", name: "Spin Wheel", description: "Try your luck", component: SpinWheel },
    { id: "wordscrambler", name: "Word Scrambler", description: "Unscramble the words", component: WordScrambler },
  ]

  const GameComponent = activeGame ? games.find((game) => game.id === activeGame)?.component : null

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Mini Games</h1>
        <p className="text-gray-400">Play games to earn XP (10 XP per game)</p>
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
                <CardTitle className="text-xl text-white">{game.name}</CardTitle>
                <CardDescription className="text-gray-400">{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">Play Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[#1a2332]/80 border-[#2a3343]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-white">{games.find((game) => game.id === activeGame)?.name}</CardTitle>
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
    </MainLayout>
  )
}
