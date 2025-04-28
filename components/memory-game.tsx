"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { GameWrapper } from "./game-wrapper"
import { Shuffle } from "lucide-react"
import { toast } from "../ui/use-toast"

export function MemoryGame() {
  // Game state management
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)

  // Initialize the game with a fixed set of cards
  const initializeGame = () => {
    // Emoji pairs to be matched
    const emojis = ["🚀", "🌟", "🔥", "💎", "🎮", "🏆", "🎯", "🎲"]

    // Create card pairs (each emoji appears twice)
    const cardPairs = [...emojis, ...emojis].map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }))

    // Shuffle cards using Fisher–Yates algorithm
    const shuffledCards = [...cardPairs];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]]
    }

    // Set initial state
    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setScore(0)
    setGameStarted(true)
    setGameOver(false)
  }

  // Handle card click logic
  const handleCardClick = (id: number) => {
    // Prevent clicking on already flipped/matched or too many cards
    if (
      flippedCards.length >= 2 || 
      cards[id].flipped || 
      cards[id].matched
    ) {
      return
    }

    // Flip the selected card
    const updatedCards = [...cards]
    updatedCards[id].flipped = true
    setCards(updatedCards)

    // Track flipped cards
    const newFlippedCards = [...flippedCards, id]
    setFlippedCards(newFlippedCards)

    // If two cards are flipped, check for match
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1) // Increment move count

      const [firstId, secondId] = newFlippedCards
      
      // Check if the two flipped cards match
      if (cards[firstId].emoji === cards[secondId].emoji) {
        // It's a match!
        setTimeout(() => {
          const matchedCards = [...cards]
          matchedCards[firstId].matched = true
          matchedCards[secondId].matched = true
          setCards(matchedCards)
          setFlippedCards([])
          setMatchedPairs(matchedPairs + 1)
          setScore(score + 10)

          // Check if all pairs are matched
          if (matchedPairs + 1 === cards.length / 2) {
            handleGameOver()
          }
        }, 500)
      } else {
        // Not a match - flip back after delay
        setTimeout(() => {
          const resetCards = [...cards]
          resetCards[firstId].flipped = false
          resetCards[secondId].flipped = false
          setCards(resetCards)
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  // End game logic
  const handleGameOver = () => {
    setGameOver(true)
    setGameStarted(false)

    // Calculate final score based on efficiency
    const finalScore = Math.max(100 - moves * 5, 10) // Prevent score going below 10
    setScore(finalScore)

    // Calculate XP based on performance
    const earnedXP = Math.min(Math.floor(finalScore / 10), 10)

    // Display completion message
    toast({
      title: "Memory Game Complete!",
      description: `You earned ${earnedXP} XP!`,
    })
  }

  // Control bar rendered above the game grid
  const customControls = (
    <div className="mt-4 flex justify-between">
      <Badge className="bg-[#2a3343]">Moves: {moves}</Badge>
      <Badge className="bg-[#4cc9f0] text-black">
        Pairs: {matchedPairs}/{cards.length / 2}
      </Badge>
      <Button
        variant="outline"
        className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
        onClick={handleGameOver}
      >
        End Game
      </Button>
    </div>
  )

  // Final JSX rendered inside GameWrapper component
  return (
    <GameWrapper
      title="Memory Match"
      description="Find all matching pairs with the fewest moves!"
      gameStarted={gameStarted}
      gameOver={gameOver}
      score={score}
      onStart={initializeGame}
      onEnd={handleGameOver}
      customControls={customControls}
    >
      {/* Game grid */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <button
            key={card.id}
            className={`aspect-square flex items-center justify-center text-2xl rounded-md transition-all duration-300 ${
              card.flipped || card.matched
                ? "bg-[#4cc9f0] transform rotate-y-180"
                : "bg-[#2a3343] hover:bg-[#3a4353]"
            }`}
            onClick={() => handleCardClick(card.id)}
            disabled={card.matched}
          >
            {card.flipped || card.matched ? card.emoji : ""}
          </button>
        ))}
      </div>
    </GameWrapper>
  )
} 