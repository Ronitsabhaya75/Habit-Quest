"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ChessGame() {
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <div className="flex flex-col items-center space-y-6">
      {!gameStarted ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Chess</h3>
          <p className="text-gray-400">Challenge your strategic thinking with a game of chess.</p>
          <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black" onClick={() => setGameStarted(true)}>
            Start Game
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-8 gap-0 w-full max-w-md">
            {Array.from({ length: 64 }).map((_, index) => {
              const row = Math.floor(index / 8)
              const col = index % 8
              const isBlack = (row + col) % 2 === 1

              return (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center ${
                    isBlack ? "bg-[#2a3343]" : "bg-[#3a4353]"
                  }`}
                >
                  {getChessPiece(row, col)}
                </div>
              )
            })}
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
              onClick={() => setGameStarted(false)}
            >
              Restart
            </Button>
            <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">Make Move</Button>
          </div>
        </>
      )}
    </div>
  )
}

function getChessPiece(row: number, col: number) {
  // Initial chess board setup
  if (row === 0) {
    const pieces = ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]
    return <span className="text-2xl text-white">{pieces[col]}</span>
  }
  if (row === 1) {
    return <span className="text-2xl text-white">♟</span>
  }
  if (row === 6) {
    return <span className="text-2xl text-[#4cc9f0]">♟</span>
  }
  if (row === 7) {
    const pieces = ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]
    return <span className="text-2xl text-[#4cc9f0]">{pieces[col]}</span>
  }

  return null
}
