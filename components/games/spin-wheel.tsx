"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { GameWrapper } from "./game-wrapper"
import { toast } from "../ui/use-toast"

interface Segment {
  label: string
  color: string
  value: number
}

interface SpinWheelProps {
  onXPReward?: (value: number) => void
}

const segments: Segment[] = [
  { label: "5 XP", color: "#FFDDC1", value: 5 },
  { label: "10 XP", color: "#C1FFD7", value: 10 },
  { label: "15 XP", color: "#C1E1FF", value: 15 },
  { label: "7 XP", color: "#FFC1E1", value: 7 },
  { label: "20 XP", color: "#FFC1C1", value: 20 },
  { label: "3 XP", color: "#E1C1FF", value: 3 },
]

export function SpinWheel({ onXPReward }: SpinWheelProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [lastPlayedTime, setLastPlayedTime] = useState<number | null>(null)
  const [canPlay, setCanPlay] = useState(true)

  useEffect(() => {
    // Check local storage for last played time
    const lastPlayed = localStorage.getItem('spinWheelLastPlayed');
    if (lastPlayed) {
      const lastTime = parseInt(lastPlayed);
      setLastPlayedTime(lastTime);
      
      // Check if 24 hours have passed
      const now = Date.now();
      const hoursPassed = (now - lastTime) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        setCanPlay(false);
        const remainingHours = Math.ceil(24 - hoursPassed);
        toast({
          title: "Game Locked",
          description: `You can play again in ${remainingHours} hour${remainingHours > 1 ? 's' : ''}.`,
        });
      }
    }
  }, []);

  const updateUserStats = async (xp: number) => {
    try {
      const res = await fetch('/api/users/update-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          xp,
          gameType: 'spinWheel',
          plays: 1
        }),
      });
      if (!res.ok) throw new Error('Failed to update stats');
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const updateLeaderboard = async (xp: number) => {
    try {
      const res = await fetch('/api/users/leaderboard/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xpGained: xp,
          source: 'spin_wheel'
        }),
      });
      if (!res.ok) throw new Error('Failed to update leaderboard');
      
      // Dispatch a custom event to trigger graph update
      window.dispatchEvent(new CustomEvent('leaderboard-update'));
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  };

  const createSpinTask = async (totalXP: number) => {
    try {
      const res = await fetch('/api/tasks/create-game-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameType: 'spinWheel',
          title: 'Spin Wheel Challenge',
          description: `Earn ${totalXP + 5} XP in the Spin Wheel game`,
          xpReward: totalXP + 5,
          dueDate: new Date(Date.now() + 86400000) // Due in 1 day
        }),
      });
      if (!res.ok) throw new Error('Failed to create task');
    } catch (error) {
      console.error('Error creating spin task:', error);
    }
  };

  useEffect(() => {
    if (gameStarted && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) drawWheel(ctx, canvas.width, canvas.height)
    }
  }, [gameStarted, rotation])

  const createSegmentPath = (index: number, total: number, ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    const segmentSize = (2 * Math.PI) / total
    const startAngle = index * segmentSize + rotation * (Math.PI / 180)
    const endAngle = (index + 1) * segmentSize + rotation * (Math.PI / 180)

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()

    ctx.fillStyle = segments[index].color
    ctx.fill()
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.save()
    ctx.translate(centerX, centerY)
    const midAngle = startAngle + (endAngle - startAngle) / 2
    const textX = Math.cos(midAngle) * (radius * 0.7)
    const textY = Math.sin(midAngle) * (radius * 0.7)
    
    ctx.translate(textX, textY)
    ctx.fillStyle = "#000000"
    ctx.font = "bold 16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
    ctx.shadowBlur = 3
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    ctx.fillText(segments[index].label, 0, 0)
    ctx.restore()
  }

  const drawWheel = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 10

    ctx.clearRect(0, 0, width, height)

    for (let i = 0; i < segments.length; i++) {
      createSegmentPath(i, segments.length, ctx, centerX, centerY, radius)
    }

    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
    ctx.fillStyle = "#333"
    ctx.fill()
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(centerX, centerY - radius + 15)
    ctx.lineTo(centerX - 15, centerY - radius - 15)
    ctx.lineTo(centerX + 15, centerY - radius - 15)
    ctx.closePath()
    ctx.fillStyle = "#FF5722"
    ctx.fill()
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const handleSpin = () => {
    if (spinning || !canPlay) return

    setSpinning(true)
    setResult(null)

    const segmentSize = 360 / segments.length
    const extraSpins = 5 * 360
    const randomExtraAngle = Math.floor(Math.random() * 360)
    const finalAngle = extraSpins + randomExtraAngle

    const adjustedAngle = (360 - (finalAngle % 360) + 270) % 360
    const landedIndex = Math.floor(adjustedAngle / segmentSize)
    const selectedResult = segments[landedIndex].value

    let currentRotation = rotation
    let speed = 15
    const spinInterval = setInterval(() => {
      currentRotation += speed
      
      if (currentRotation >= finalAngle) {
        clearInterval(spinInterval)
        setSpinning(false)
        setResult(selectedResult)
        
        // Cap the score at 10 XP maximum
        const cappedXP = Math.min(selectedResult, 10);
        setScore(prev => prev + cappedXP)
        
        // Update user stats with capped XP
        updateUserStats(cappedXP)

        // Update leaderboard with capped XP
        updateLeaderboard(cappedXP)
        
        // Set the last played time in localStorage
        const now = Date.now();
        localStorage.setItem('spinWheelLastPlayed', now.toString());
        setLastPlayedTime(now);
        setCanPlay(false);

        if (onXPReward) {
          onXPReward(cappedXP)
        }

        toast({
          title: "Congratulations!",
          description: `You won ${selectedResult} XP (capped at 10 XP for leaderboard)! You can play again in 24 hours.`,
        })
      }

      if (currentRotation > finalAngle - 360) {
        speed = Math.max(speed * 0.99, 0.5)
      }

      setRotation(currentRotation % 360)
    }, 20)
  }

  const handleStartGame = () => {
    if (!canPlay) {
      const now = Date.now();
      const hoursPassed = lastPlayedTime ? (now - lastPlayedTime) / (1000 * 60 * 60) : 24;
      const remainingHours = Math.ceil(24 - hoursPassed);
      
      toast({
        title: "Game Locked",
        description: `You can play again in ${remainingHours} hour${remainingHours > 1 ? 's' : ''}.`,
      });
      return;
    }

    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setResult(null)
    setRotation(0)
  }

  const handleEndGame = () => {
    setGameOver(true)
    setGameStarted(false)
    createSpinTask(score)

    toast({
      title: "Game Complete!",
      description: `You earned ${score} XP!`,
    })
  }

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!lastPlayedTime) return null;
    
    const now = Date.now();
    const hoursPassed = (now - lastPlayedTime) / (1000 * 60 * 60);
    
    if (hoursPassed >= 24) {
      setCanPlay(true);
      return null;
    }
    
    const remainingHours = Math.ceil(24 - hoursPassed);
    return `Next spin available in ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
  }

  const timeRemaining = getTimeRemaining();

  const customControls = (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex justify-between">
        <Button 
          className="bg-[#4CAF50] hover:bg-[#45a049] text-white" 
          onClick={handleSpin} 
          disabled={spinning || !canPlay}
        >
          {spinning ? "Spinning..." : "Spin the Wheel"}
        </Button>

        <Button
          variant="outline"
          className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
          onClick={handleEndGame}
        >
          End Game
        </Button>
      </div>
      
      {timeRemaining && (
        <div className="text-center text-sm text-yellow-400 mt-2">
          {timeRemaining}
        </div>
      )}
    </div>
  )

  return (
    <GameWrapper
      title="Spin Wheel"
      description="Spin the wheel to earn XP rewards! (Once per day, max 10 XP for leaderboard)"
      gameStarted={gameStarted}
      gameOver={gameOver}
      score={score}
      onStart={handleStartGame}
      onEnd={handleEndGame}
      customControls={customControls}
    >
      <div className="relative">
        <canvas ref={canvasRef} width={300} height={300} className="border border-[#2a3343] rounded-full mx-auto" />
        
        {result !== null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#1a2332]/90 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-[#4cc9f0] mb-2">{result} XP</div>
              <p className="text-white text-xl">You won!</p>
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  )
}
