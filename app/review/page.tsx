"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MainLayout } from "@/components/main-layout"
import { Star, Send } from "lucide-react"

export default function Review() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (rating > 0) {
      setSubmitted(true)
    }
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Review</h1>
        <p className="text-gray-400">Let us know what you think about HabitQuest</p>
      </div>

      <Card className="bg-[#1a2332]/80 border-[#2a3343]">
        <CardHeader>
          <CardTitle className="text-xl text-white">Your Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-white">How would you rate your experience?</p>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-white">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-white">Tell us more about your experience</p>
                <Textarea
                  placeholder="Share your thoughts..."
                  className="bg-[#2a3343] border-[#3a4353] text-white min-h-[150px]"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black"
                onClick={handleSubmit}
                disabled={rating === 0}
              >
                <Send className="mr-2 h-4 w-4" /> Submit Feedback
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white">Thank You!</h3>
              <p className="text-gray-400 text-center">
                Your feedback has been submitted successfully. We appreciate your input and will use it to improve
                HabitQuest.
              </p>
              <Button
                className="mt-4 bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black"
                onClick={() => {
                  setRating(0)
                  setFeedback("")
                  setSubmitted(false)
                }}
              >
                Submit Another Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  )
}
