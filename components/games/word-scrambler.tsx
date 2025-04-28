/* 
 * Word Scrambler Component Documentation
 * --------------------------------------
 * 1. Dual-mode vocabulary game (Scrambled Words/Missing Letters) with 3 rounds of 5 questions
 * 2. Presents words as either randomly ordered letters or with alternating blanks based on mode
 * 3. Awards 10 XP per correct answer with mode-specific tracking in localStorage
 * 4. Features 30 self-improvement vocabulary words with meanings as hints
 * 5. Allows 3 attempts per word with progressive hint system (meaning shown after first try)
 * 6. Built with shadcn/ui components in dark theme with responsive styling
 * 7. Includes utility functions for word scrambling, letter masking, and array shuffling
 * 8. Provides immediate feedback for correct/incorrect answers with visual indicators
 * 9. Offers reset options for individual mode XP or all accumulated XP
 * 10. Automatically advances after correct answers or when attempt limit is reached
 * 11. Features custom tab styling to highlight active mode selection
 * 12. Displays game stats (Round, Question, Score, XP) using Badge components
 * 13. Handles different game states (playing, round transition, game complete)
 * 14. Continues game seamlessly when switching modes rather than resetting
 * 15. Wrapped in GameWrapper component for consistent UI across different word games
 */
"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { GameWrapper } from "./game-wrapper"
import { toast } from "../ui/use-toast"
import { Book, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

// Array of word objects used across modes
const scrambledWords = [
  { word: "FOCUS", meaning: "The center of interest or activity." },
  { word: "DISCIPLINE", meaning: "Training to act in accordance with rules." },
  { word: "HABIT", meaning: "A regular practice, especially one that is hard to give up." },
  { word: "ROUTINE", meaning: "A sequence of actions regularly followed." },
  { word: "GOAL", meaning: "The object of a person's ambition or effort." },
  { word: "MINDFULNESS", meaning: "The quality of being conscious or aware of something." },
  { word: "EXERCISE", meaning: "Activity requiring physical effort." },
  { word: "JOURNALING", meaning: "The act of writing in a journal." },
  { word: "GRATITUDE", meaning: "The quality of being thankful." },
  { word: "CONSISTENCY", meaning: "Conformity in the application of something." },
  { word: "POSITIVITY", meaning: "The practice of being positive." },
  { word: "PLANNING", meaning: "The process of making plans." },
  { word: "READING", meaning: "The action or skill of reading written or printed matter." },
  { word: "HYDRATION", meaning: "The process of causing something to absorb water." },
  { word: "NUTRITION", meaning: "The process of providing or obtaining food." },
  { word: "WALKING", meaning: "The activity of going for walks." },
  { word: "LEARNING", meaning: "The acquisition of knowledge or skills." },
  { word: "SLEEP", meaning: "A condition of body and mind which typically recurs for several hours every night." },
  { word: "REFLECTION", meaning: "Serious thought or consideration." },
  { word: "MEDITATION", meaning: "The action of meditating." },
  { word: "VISUALIZATION", meaning: "The formation of a mental image." },
  { word: "AFFIRMATION", meaning: "The action or process of affirming something." },
  { word: "DECLUTTERING", meaning: "Removing unnecessary items from an untidy place." },
  { word: "ORGANIZATION", meaning: "The action of organizing something." },
  { word: "ACCOUNTABILITY", meaning: "The fact of being responsible for actions." },
  { word: "BREATHING", meaning: "The process of taking air into and expelling it from the lungs." },
  { word: "STRUCTURE", meaning: "The arrangement of and relations between parts." },
  { word: "BALANCE", meaning: "An even distribution of weight enabling someone to remain upright." },
  { word: "SELFCARE", meaning: "The practice of taking action to preserve health." },
  { word: "PRACTICE", meaning: "Repeated exercise in an activity." },
]

// Function to create "Missing Letters" version of words
const generateMissingLetters = (word: string): string => {
  return word.split("").map((char, i) => (i % 2 === 0 ? char : "_")).join("")
}

// Shuffles array elements randomly
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Create scrambled version of a word
const scrambleWord = (word: string): string => {
  const wordArray = word.split("")
  for (let i = wordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]]
  }
  return wordArray.join("")
}

type WordItem = {
  word: string
  meaning: string
  display?: string
}

export function WordScrambler() {
  const [gameMode, setGameMode] = useState<"scrambled" | "missing">("scrambled")
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [round, setRound] = useState(1)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState<WordItem[]>([])
  const [currentWord, setCurrentWord] = useState("")
  const [displayWord, setDisplayWord] = useState("")
  const [userGuess, setUserGuess] = useState("")
  const [message, setMessage] = useState("")
  const [showMeaning, setShowMeaning] = useState(false)
  const [showWordInfo, setShowWordInfo] = useState(false)
  const [score, setScore] = useState(0)
  const [scrambledXP, setScrambledXP] = useState(0)
  const [missingXP, setMissingXP] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false)
  const [showRoundMessage, setShowRoundMessage] = useState(false)

  const totalRounds = 3
  const questionsPerRound = 5
  const totalQuestions = totalRounds * questionsPerRound

  // Initialize game state
  useEffect(() => {
    if (typeof window !== "undefined") {
      setScrambledXP(parseInt(localStorage.getItem("scrambledXP") || "0"))
      setMissingXP(parseInt(localStorage.getItem("missingXP") || "0"))
    }
  }, [])

  // Prepare new game when gameStarted changes
  useEffect(() => {
    if (gameStarted) {
      prepareGameSet()
    }
  }, [gameStarted, gameMode])

  // Set up the current word when the question index changes
  useEffect(() => {
    if (currentSet.length > 0 && questionIndex < currentSet.length) {
      setCurrentWord(currentSet[questionIndex].word)
      
      if (gameMode === "scrambled") {
        let scrambled = scrambleWord(currentSet[questionIndex].word)
        // Make sure the scrambled word is different from the original
        while (scrambled === currentSet[questionIndex].word) {
          scrambled = scrambleWord(currentSet[questionIndex].word)
        }
        setDisplayWord(scrambled)
      } else {
        // Missing letters mode
        setDisplayWord(currentSet[questionIndex].display || "")
      }
    }
  }, [questionIndex, currentSet, gameMode])

  // Prepare a randomized set of words for the game
  const prepareGameSet = () => {
    const randomized = shuffleArray(scrambledWords).slice(0, totalQuestions)
    
    if (gameMode === "missing") {
      const missingWordsSet = randomized.map(item => ({
        ...item,
        display: generateMissingLetters(item.word)
      }))
      setCurrentSet(missingWordsSet)
    } else {
      setCurrentSet(randomized)
    }
    
    setQuestionIndex(0)
    setRound(1)
    setScore(0)
    resetQuestionState()
  }

  const resetQuestionState = () => {
    setUserGuess("")
    setMessage("")
    setShowMeaning(false)
    setShowWordInfo(false)
    setAttempts(0)
    setMaxAttemptsReached(false)
  }

  const handleStartGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setShowRoundMessage(false)
  }

  const handleEndGame = () => {
    setGameOver(true)
    setGameStarted(false)
    
    // Calculate total XP earned in this session
    const earnedXP = Math.min(score * 10, 100) // Cap at 100 XP per game
    
    // Update user stats with the earned XP
    updateUserStats(earnedXP)
  }

  const updateUserStats = async (xp: number) => {
    try {
      const res = await fetch('/api/users/update-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          xp,
          gameType: 'wordScrambler',
          mode: gameMode,
          correctWords: score
        }),
      });
      
      if (!res.ok) throw new Error('Failed to update stats');
      
      toast({
        title: "XP Updated!",
        description: `You earned ${xp} XP for the leaderboard!`,
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const createWordGameTask = async (totalScore: number) => {
    try {
      const res = await fetch('/api/tasks/create-game-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameType: 'wordScrambler',
          title: 'Word Master Challenge',
          description: `Score ${totalScore + 2} or more in the next word game`,
          xpReward: totalScore + 5,
          dueDate: new Date(Date.now() + 86400000 * 2) // Due in 2 days
        }),
      });
      
      if (!res.ok) throw new Error('Failed to create task');
    } catch (error) {
      console.error('Error creating word game task:', error);
    }
  };

  const handleModeChange = (mode: "scrambled" | "missing") => {
    setGameMode(mode)
    // Only reset the game if it's already started
    if (gameStarted) {
      // Instead of ending the game, restart it with new mode
      prepareGameSet()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (maxAttemptsReached || showMeaning) return
    
    if (userGuess.toUpperCase() === currentWord) {
      setMessage("✅ Correct!")
      setShowMeaning(true)
      setScore(score + 1)
      
      // Award XP
      if (gameMode === "scrambled") {
        const newXP = scrambledXP + 10
        setScrambledXP(newXP)
        localStorage.setItem("scrambledXP", newXP.toString())
      } else {
        const newXP = missingXP + 10
        setMissingXP(newXP)
        localStorage.setItem("missingXP", newXP.toString())
      }
      
      // Update total XP
      const totalXP = (gameMode === "scrambled" ? scrambledXP + 10 : scrambledXP) + 
                      (gameMode === "missing" ? missingXP + 10 : missingXP)
      localStorage.setItem("totalWordGameXP", totalXP.toString())
      
      toast({
        title: "Correct!",
        description: "You earned 10 XP!",
      })
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      // Show only meaning after first incorrect attempt
      setShowWordInfo(true)
      
      if (newAttempts >= 3) {
        setMessage(`❌ Incorrect! The correct word is: ${currentWord}`)
        setShowMeaning(true)
        setMaxAttemptsReached(true)
      } else {
        setMessage(`❌ Try Again! (${newAttempts}/3 attempts)`)
      }
    }
  }

  const handleNext = () => {
    const nextIndex = questionIndex + 1
    
    // Check if we're moving to the next round
    if (nextIndex % questionsPerRound === 0 && nextIndex < totalQuestions) {
      setShowRoundMessage(true)
      setRound(round + 1)
      
      // Automatically move to next question after a delay
      setTimeout(() => {
        setShowRoundMessage(false)
        moveToNextQuestion(nextIndex)
      }, 2000)
    } 
    // Check if game is complete
    else if (nextIndex >= totalQuestions) {
      // Game complete
      handleEndGame()
      
      // Award final XP based on score
      const earnedXP = Math.min(score * 10, 100)
      updateUserStats(earnedXP)
      createWordGameTask(score)
      
      toast({
        title: "Game Complete!",
        description: `You've completed all rounds with ${score} correct answers. Total earned: ${earnedXP} XP!`,
      })
    } 
    // Regular next question
    else {
      moveToNextQuestion(nextIndex)
    }
  }

  const moveToNextQuestion = (nextIndex: number) => {
    setQuestionIndex(nextIndex)
    resetQuestionState()
  }

  const resetXP = () => {
    if (gameMode === "scrambled") {
      localStorage.setItem("scrambledXP", "0")
      setScrambledXP(0)
    } else {
      localStorage.setItem("missingXP", "0")
      setMissingXP(0)
    }
    toast({
      title: `${gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} XP Reset`,
      description: "XP has been reset to 0",
    })
  }

  const resetTotalXP = () => {
    localStorage.setItem("scrambledXP", "0")
    localStorage.setItem("missingXP", "0")
    localStorage.setItem("totalWordGameXP", "0")
    setScrambledXP(0)
    setMissingXP(0)
    toast({
      title: "All XP Reset",
      description: "All XP has been reset to 0",
    })
  }

  const totalXP = scrambledXP + missingXP

  // Render the game content
  const renderGameContent = () => {
    if (showRoundMessage) {
      return (
        <div className="text-center py-8">
          <h3 className="text-2xl font-bold text-green-500 mb-4">
            🎉 Round {round - 1} Complete!
          </h3>
          <p className="text-lg text-gray-300">Get ready for Round {round}...</p>
        </div>
      )
    }

    if (gameOver) {
      return (
        <div className="text-center py-8">
          <h3 className="text-2xl font-bold text-green-500 mb-4">
            🎉 All Rounds Completed!
          </h3>
          <p className="text-lg text-gray-300 mb-4">
            You got {score} out of {totalQuestions} words correct!
          </p>
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={() => {
                setGameOver(false)
                handleStartGame()
              }}
              className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black"
            >
              Play Again
            </Button>
          </div>
        </div>
      )
    }

    return (
      <>
        <div className="text-center mb-6">
          <h3 className="text-lg text-gray-400 mb-2">
            {gameMode === "scrambled" 
              ? "Unscramble this word:" 
              : "Fill in the missing letters:"}
          </h3>
          <div className="text-3xl font-bold tracking-wider text-white">{displayWord}</div>
          
          {message && (
            <div className={`mt-4 text-lg ${message.includes("✅") ? "text-green-400" : "text-red-400"}`}>
              {message}
            </div>
          )}
        </div>

        {showWordInfo && (
          <div className="bg-[#1f2937] p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <Book className="mr-2 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-300">{currentSet[questionIndex]?.meaning}</p>
              </div>
            </div>
          </div>
        )}

        {showMeaning ? (
          <Button 
            onClick={handleNext} 
            className="w-full mt-4 bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black"
          >
            Next Word
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              placeholder="Enter your guess"
              className="bg-[#1a2332] border-[#3a4353] text-white text-center text-xl"
              autoComplete="off"
              autoFocus
              disabled={maxAttemptsReached}
            />

            <Button 
              type="submit" 
              className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black"
              disabled={maxAttemptsReached}
            >
              Check
            </Button>
            
            {attempts > 0 && (
              <div className="flex items-center justify-center text-amber-400 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Attempt {attempts}/3</span>
              </div>
            )}
          </form>
        )}
        
        <div className="flex justify-between mt-6">
          <Button 
            onClick={resetXP} 
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            Reset {gameMode} XP
          </Button>
          <Button 
            onClick={resetTotalXP} 
            variant="outline" 
            size="sm"
            className="text-xs bg-red-900 hover:bg-red-800"
          >
            Reset All XP
          </Button>
        </div>
      </>
    )
  }

  return (
    <GameWrapper
      title="Word Scrambler & Missing Game"
      description={`Test your vocabulary skills with ${gameMode === "scrambled" ? "Scrambled Words" : "Missing Letters"}!`}
      gameStarted={gameStarted}
      gameOver={gameOver}
      score={score}
      onStart={handleStartGame}
      onEnd={handleEndGame} 
    >
      {/* Mode selection tabs*/}
      <Tabs 
        value={gameMode} 
        className="w-full mb-4"
        onValueChange={(value) => handleModeChange(value as "scrambled" | "missing")}
      >
        <TabsList className="grid w-full grid-cols-2 bg-[#4cc9f0]/20">
          <TabsTrigger 
            value="scrambled"
            className={`${gameMode === "scrambled" ? "bg-[#4cc9f0] text-black" : "text-white"} font-medium`}
          >
            Scrambled
          </TabsTrigger>
          <TabsTrigger 
            value="missing"
            className={`${gameMode === "missing" ? "bg-[#4cc9f0] text-black" : "text-white"} font-medium`}
          >
            Missing Letters
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Game stats*/}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <Badge className="bg-[#2a3343] px-3 py-1 text-sm font-medium">Round: {round}/{totalRounds}</Badge>
        <Badge className="bg-[#2a3343] px-3 py-1 text-sm font-medium">Question: {questionIndex % questionsPerRound + 1}/{questionsPerRound}</Badge>
        <Badge className="bg-[#2a3343] px-3 py-1 text-sm font-medium">Score: {score}</Badge>
        <Badge className="bg-[#2a3343] px-3 py-1 text-sm font-medium">
          {gameMode === "scrambled" ? "Scrambled" : "Missing"} XP: {gameMode === "scrambled" ? scrambledXP : missingXP}
        </Badge>
        <Badge className="bg-[#2a3343] px-3 py-1 text-sm font-medium">Total XP: {totalXP}</Badge>
      </div>

      <Card className="bg-[#2a3343] border-[#3a4353]">
        <CardContent className="pt-6">
          {renderGameContent()}
        </CardContent>
      </Card>
    </GameWrapper>
  )
}
