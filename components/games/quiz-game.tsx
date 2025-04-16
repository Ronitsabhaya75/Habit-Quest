"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const fullQuestionSet = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
  },
  {
    question: "What is the largest mammal?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: 1,
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: 2,
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
  },
  {
    question: "Which country is home to the kangaroo?",
    options: ["New Zealand", "South Africa", "Australia", "Brazil"],
    correctAnswer: 2,
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctAnswer: 3,
  },
  {
    question: "Which element has the atomic number 1?",
    options: ["Helium", "Hydrogen", "Oxygen", "Carbon"],
    correctAnswer: 1,
  },
  {
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
  },
  {
    question: "What is the capital of Japan?",
    options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
    correctAnswer: 2,
  },
]

export function QuizGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [xp, setXP] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [roundNumber, setRoundNumber] = useState(1)
  const [finalSummary, setFinalSummary] = useState(false)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [showStartConfirm, setShowStartConfirm] = useState(false)

  useEffect(() => {
    const savedXP = localStorage.getItem('quizXP')
    if (savedXP) {
      setXP(parseInt(savedXP))
    }
  }, [])

  const loadQuestions = () => {
    const questionCount = Math.floor(Math.random() * 3) + 6
    const shuffled = [...fullQuestionSet].sort(() => 0.5 - Math.random())
    setQuestions(shuffled.slice(0, questionCount))
    setCurrentIndex(0)
    setAnswered(false)
    setSelectedAnswer(null)
    setGameEnded(false)
    setCorrectCount(0)
    setShowSummary(false)
  }

  const handleAnswerSelect = (index) => {
    if (answered || gameEnded) return

    setSelectedAnswer(index)
    const currentQuestion = questions[currentIndex]

    if (index === currentQuestion.correctAnswer) {
      const newXP = xp + 10
      setXP(newXP)
      localStorage.setItem('quizXP', newXP.toString())
      setCorrectCount(prev => prev + 1)
    }

    setAnswered(true)

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setGameEnded(true)
      } else {
        setCurrentIndex(prev => prev + 1)
        setAnswered(false)
        setSelectedAnswer(null)
      }
    }, 1000)
  }

  const getEmoji = () => {
    const ratio = correctCount / questions.length
    if (ratio === 1) return "🏆 Perfect!"
    if (ratio >= 0.8) return "🎉 Great job!"
    if (ratio >= 0.5) return "👍 Good effort!"
    return "💡 Keep practicing!"
  }

  const handleNextRound = () => {
    setTotalCorrect(prev => prev + correctCount)
    if (roundNumber < 3) {
      setRoundNumber(prev => prev + 1)
      loadQuestions()
    } else {
      setFinalSummary(true)
    }
  }

  const handleReplay = () => {
    setRoundNumber(1)
    setXP(0)
    setTotalCorrect(0)
    setGameStarted(true)
    setFinalSummary(false)
    loadQuestions()
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-[#1a202c] p-4">
        <div className="text-center space-y-4 max-w-md">
          <h3 className="text-2xl font-bold text-white">Quiz Challenge</h3>
          <p className="text-gray-400">
            Test your knowledge across 3 rounds and earn XP! Answer questions correctly to level up.
          </p>
          <Button 
            className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black font-bold py-6 text-lg"
            onClick={() => setShowStartConfirm(true)}
          >
            Start Quiz
          </Button>
        </div>

        {showStartConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#2a3343] p-6 rounded-lg max-w-md border border-[#3a4353]">
              <h3 className="text-xl font-bold text-white mb-4">🚀 Ready to begin?</h3>
              <p className="text-gray-300 mb-6">
                This quiz includes 3 rounds of random questions. You'll earn XP for correct answers.
              </p>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  className="text-white border-[#3a4353] hover:bg-[#3a4353]"
                  onClick={() => setShowStartConfirm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black"
                  onClick={() => {
                    setGameStarted(true)
                    setShowStartConfirm(false)
                    loadQuestions()
                  }}
                >
                  Begin Challenge
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#1a202c] p-4 pt-10">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-white font-medium">Round {roundNumber}</span>
          <div className="flex items-center gap-2 text-[#4cc9f0]">
            <span>⭐</span>
            <span>{xp} XP</span>
          </div>
        </div>

        {!gameEnded ? (
          <Card className="bg-[#2a3343] border-[#3a4353]">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-white mb-2">
                Question {currentIndex + 1} of {questions.length}
              </h3>
              <h2 className="text-xl font-bold text-white mb-6">
                {questions[currentIndex]?.question}
              </h2>

              <RadioGroup value={selectedAnswer} className="space-y-3">
                {questions[currentIndex]?.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-2 p-3 rounded-md transition-all ${
                      answered 
                        ? index === questions[currentIndex].correctAnswer 
                          ? "bg-green-900/30 border border-green-500"
                          : selectedAnswer === index && selectedAnswer !== questions[currentIndex].correctAnswer
                          ? "bg-red-900/30 border border-red-500"
                          : "bg-[#3a4353]/30"
                        : selectedAnswer === index
                          ? "bg-[#3a4353]"
                          : "bg-[#3a4353]/30 hover:bg-[#3a4353]/50"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <RadioGroupItem
                      value={index}
                      id={`option-${index}`}
                      className={`${
                        answered && index === questions[currentIndex].correctAnswer 
                          ? "text-green-500" 
                          : answered && selectedAnswer === index 
                            ? "text-red-500"
                            : "text-[#4cc9f0]"
                      }`}
                      checked={selectedAnswer === index}
                    />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className={`text-white ${
                        answered && index === questions[currentIndex].correctAnswer 
                          ? "font-bold" 
                          : ""
                      }`}
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ) : !showSummary ? (
          <Card className="bg-[#2a3343] border-[#3a4353]">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Round {roundNumber} Complete!
              </h2>
              <p className="text-gray-300 mb-1">
                Correct Answers: {correctCount} / {questions.length}
              </p>
              <p className="text-gray-300 mb-4">
                XP Earned: {correctCount * 10}
              </p>
              <p className="text-xl text-[#4cc9f0] font-bold mb-6">
                {getEmoji()}
              </p>

              <Button 
                className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black w-full py-6 text-lg"
                onClick={() => {
                  setShowSummary(true)
                  handleNextRound()
                }}
              >
                {roundNumber < 3 ? 'Next Round' : 'See Final Results'}
              </Button>
            </CardContent>
          </Card>
        ) : finalSummary ? (
          <Card className="bg-[#2a3343] border-[#3a4353]">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Quiz Complete!
              </h2>
              <p className="text-gray-300 mb-1">
                Total Correct: {totalCorrect}
              </p>
              <p className="text-gray-300 mb-4">
                Total XP Earned: {xp}
              </p>
              <p className="text-xl text-[#4cc9f0] font-bold mb-6">
                🌟 Amazing Achievement!
              </p>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="text-white border-[#3a4353] hover:bg-[#3a4353] flex-1 py-6"
                  onClick={() => window.location.href = '/'}
                >
                  Return Home
                </Button>
                <Button 
                  className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black flex-1 py-6"
                  onClick={handleReplay}
                >
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}