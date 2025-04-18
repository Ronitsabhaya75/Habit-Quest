"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { XP_VALUES } from "@/lib/xp-system"

export function SimpleGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameOver, setGameOver] = useState(false)
  const [targets, setTargets] = useState<{ id: number; x: number; y: number; size: number }[]>([])

  // Start the game
  const handleStartGame = () => {
    setGameStarted(true)
    setScore(0)
    setTimeLeft(30)
    setGameOver(false)
    generateTargets()
  }

  // Generate random targets
  const generateTargets = () => {
    const newTargets = []
    for (let i = 0; i < 5; i++) {
      newTargets.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 20 + 20
      })
    }
    setTargets(newTargets)
  }

  // Handle clicking a target
  const handleTargetClick = (id: number) => {
    setScore(score + 1)
    setTargets(targets.filter(target => target.id !== id))
    
    // Generate a new target
    const newTarget = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 20 + 20
    }
    
    setTargets([...targets.filter(target => target.id !== id), newTarget])
  }

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setGameOver(true)
            
            // Award XP
            toast({
              title: "Game Complete!",
              description: `You earned ${XP_VALUES.GAME_COMPLETION} XP!`,
            })
            
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [gameStarted, gameOver])

  return (
    <div className="flex flex-col items-center space-y-6">
      {!gameStarted || gameOver ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Target Clicker</h3>
          <p className="text-gray-400">Click as many targets as you can in 30 seconds!</p>
          
          {gameOver && (
            <div className="my-4">
              <h4 className="text-lg font-bold text-white">Game Over!</h4>
              <p className="text-[#4cc9f0] text-2xl font-bold">{score} targets</p>
              <p className="text-white">You earned {XP_VALUES.GAME_COMPLETION} XP</p>
            </div>
          )}
          
          <Button 
            className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black" 
            onClick={handleStartGame}
          >
            {gameOver ? "Play Again" : "Start Game"}
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <Badge className="bg-[#4cc9f0] text-black">Score: {score}</Badge>
            <Badge className={timeLeft <= 10 ? "bg-red-500" : "bg-[#2a3343]"}>Time: {timeLeft}s</Badge>
          </div>
          
          <div className="relative w-full h-[300px] bg-[#1a2332] rounded-lg border border-[#2a3343]">
            {targets.map(target => (
              <button
                key={target.id}
                className="absolute rounded-full bg-gradient-to-r from-[#4cc9f0] to-[#64B4FF] hover:from-[#64B4FF] hover:to-[#4cc9f0] transition-colors"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  width: `${target.size}px`,
                  height: `${target.size}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => handleTargetClick(target.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
