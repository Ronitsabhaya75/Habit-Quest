"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

const wheelItems = [
  { label: "5 XP", color: "#4cc9f0", value: 5 },
  { label: "2 XP", color: "#3a4353", value: 2 },
  { label: "7 XP", color: "#4cc9f0", value: 7 },
  { label: "1 XP", color: "#3a4353", value: 1 },
  { label: "10 XP", color: "#4cc9f0", value: 10 },
  { label: "3 XP", color: "#3a4353", value: 3 },
  { label: "8 XP", color: "#4cc9f0", value: 8 },
  { label: "0 XP", color: "#3a4353", value: 0 },
]

export function SpinWheel() {
  const [gameStarted, setGameStarted] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [spinSpeed, setSpinSpeed] = useState(0)

  useEffect(() => {
    if (gameStarted && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        drawWheel(ctx, canvas.width, canvas.height, rotation)
      }
    }
  }, [gameStarted, rotation])

  useEffect(() => {
    if (spinning) {
      const spinInterval = setInterval(() => {
        setRotation((prev) => (prev + spinSpeed) % 360)
        setSpinSpeed((prev) => {
          if (prev > 0.1) {
            return prev * 0.99
          } else {
            clearInterval(spinInterval)
            setSpinning(false)

            // Calculate result based on final rotation
            const segmentSize = 360 / wheelItems.length
            const normalizedRotation = (360 - rotation) % 360
            const segmentIndex = Math.floor(normalizedRotation / segmentSize)
            setResult(wheelItems[segmentIndex].value)

            return 0
          }
        })
      }, 20)

      return () => clearInterval(spinInterval)
    }
  }, [spinning, spinSpeed])

  const handleSpin = () => {
    if (!spinning) {
      setSpinning(true)
      setSpinSpeed(10 + Math.random() * 10)
      setResult(null)
    }
  }

  const drawWheel = (ctx: CanvasRenderingContext2D, width: number, height: number, rotation: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 10

    ctx.clearRect(0, 0, width, height)

    // Draw wheel segments
    const segmentSize = (2 * Math.PI) / wheelItems.length

    for (let i = 0; i < wheelItems.length; i++) {
      const startAngle = i * segmentSize + rotation * (Math.PI / 180)
      const endAngle = (i + 1) * segmentSize + rotation * (Math.PI / 180)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = wheelItems[i].color
      ctx.fill()

      // Draw text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + segmentSize / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px Arial"
      ctx.fillText(wheelItems[i].label, radius - 10, 5)
      ctx.restore()
    }

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI)
    ctx.fillStyle = "#1a2332"
    ctx.fill()
    ctx.strokeStyle = "#4cc9f0"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw pointer
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - radius - 10)
    ctx.lineTo(centerX - 10, centerY - radius + 10)
    ctx.lineTo(centerX + 10, centerY - radius + 10)
    ctx.closePath()
    ctx.fillStyle = "#4cc9f0"
    ctx.fill()
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {!gameStarted ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Spin Wheel</h3>
          <p className="text-gray-400">Spin the wheel and try your luck!</p>
          <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black" onClick={() => setGameStarted(true)}>
            Start Game
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <canvas ref={canvasRef} width={300} height={300} className="border border-[#2a3343] rounded-full" />
            {result !== null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-[#1a2332]/90 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#4cc9f0]">{result} XP</div>
                  <p className="text-white">You won!</p>
                </div>
              </div>
            )}
          </div>

          <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black" onClick={handleSpin} disabled={spinning}>
            {spinning ? "Spinning..." : "Spin"}
          </Button>
        </>
      )}
    </div>
  )
}
