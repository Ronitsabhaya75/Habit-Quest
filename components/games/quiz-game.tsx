"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const quizQuestions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
  },
  {
    question: "What is the largest mammal?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: "Blue Whale",
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: "Leonardo da Vinci",
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: "Au",
  },
]

export function QuizGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const handleStartGame = () => {
    setGameStarted(true)
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer("")
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNextQuestion = () => {
    // Check if answer is correct
    if (selectedAnswer === quizQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }

    const nextQuestion = currentQuestion + 1
    if (nextQuestion < quizQuestions.length) {
      setCurrentQuestion(nextQuestion)
      setSelectedAnswer("")
    } else {
      setShowResult(true)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {!gameStarted ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Quiz Game</h3>
          <p className="text-gray-400">Test your knowledge with this quiz!</p>
          <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black" onClick={handleStartGame}>
            Start Quiz
          </Button>
        </div>
      ) : showResult ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Quiz Complete!</h3>
          <p className="text-gray-400">
            You scored {score} out of {quizQuestions.length}
          </p>
          <div className="text-2xl font-bold text-[#4cc9f0]">
            {score >= 4 ? "Excellent!" : score >= 3 ? "Good job!" : "Keep practicing!"}
          </div>
          <p className="text-white">You earned {Math.min(score * 2, 10)} XP</p>
          <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black" onClick={handleStartGame}>
            Play Again
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="mb-4 flex justify-between items-center">
            <span className="text-white">
              Question {currentQuestion + 1}/{quizQuestions.length}
            </span>
            <span className="text-[#4cc9f0]">Score: {score}</span>
          </div>

          <Card className="bg-[#2a3343] border-[#3a4353]">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-white mb-4">{quizQuestions[currentQuestion].question}</h3>

              <RadioGroup value={selectedAnswer} className="space-y-3">
                {quizQuestions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={`option-${index}`}
                      className="text-[#4cc9f0]"
                      onClick={() => handleAnswerSelect(option)}
                    />
                    <Label htmlFor={`option-${index}`} className="text-white">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="mt-4 flex justify-end">
            <Button
              className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black"
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
            >
              {currentQuestion === quizQuestions.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
