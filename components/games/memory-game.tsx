"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

const emojis = ["🚀", "🌟", "🔥", "💎", "🎮", "🏆", "🎯", "🎲"]

interface MemoryCard {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

export function MemoryGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const { user, updateUser } = useAuth()

  const initializeGame = () => {
    // Create pairs of cards with emojis
    const cardPairs = [...emojis, ...emojis].map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }))

    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]]
    }

    setCards(cardPairs)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setGameOver(false)
    setGameStarted(true)
  }

  const handleCardClick = (id: number) => {
    // Ignore if already flipped or matched
    if (cards[id].flipped || cards[id].matched || flippedCards.length >= 2) {
      return
    }

    // Flip the card
    const updatedCards = [...cards]
    updatedCards[id].flipped = true
    setCards(updatedCards)

    // Add to flipped cards
    const newFlippedCards = [...flippedCards, id]
    setFlippedCards(newFlippedCards)

    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)

      const [firstId, secondId] = newFlippedCards
      if (cards[firstId].emoji === cards[secondId].emoji) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards]
          matchedCards[firstId].matched = true
          matchedCards[secondId].matched = true
          setCards(matchedCards)
          setFlippedCards([])
          setMatchedPairs(matchedPairs + 1)

          // Check if game is over
          if (matchedPairs + 1 === emojis.length) {
            handleGameOver()
          }
        }, 500)
      } else {
        // No match
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

  const handleGameOver = async () => {
    setGameOver(true)

    // Calculate XP earned based on moves
    const xpEarned = Math.max(10 - Math.floor(moves / 2), 1)

    try {
      // Save game score to the database
      const res = await fetch("/api/game-scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game: "memory",
          score: moves,
          xpEarned,
        }),
      })

      if (res.ok) {
        // Update user XP in the UI
        if (user) {
          updateUser({
            ...user,
            xp: user.xp + xpEarned,
          })
        }

        toast({
          title: "Game Complete!",
          description: `You earned ${xpEarned} XP!`,
        })
      }
    } catch (error) {
      console.error("Failed to save game score:", error)

      // Still show success message even if API call fails
      toast({
        title: "Game Complete!",
        description: `You earned ${xpEarned} XP! (Offline mode)`,
      })
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {!gameStarted || gameOver ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Memory Match</h3>
          <p className="text-gray-400">Find all matching pairs with the fewest moves!</p>

          {gameOver && (
            <div className="my-4">
              <h4 className="text-lg font-bold text-white">Game Complete!</h4>
              <p className="text-[#4cc9f0] text-2xl font-bold">{moves} moves</p>
              <p className="text-white">You earned {Math.max(10 - Math.floor(moves / 2), 1)} XP</p>
            </div>
          )}

          <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black" onClick={initializeGame}>
            {gameOver ? "Play Again" : "Start Game"}
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <Badge className="bg-[#4cc9f0] text-black">
              Pairs: {matchedPairs}/{emojis.length}
            </Badge>
            <Badge className="bg-[#2a3343]">Moves: {moves}</Badge>
          </div>

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
        </div>
      )}
    </div>
  )
}
