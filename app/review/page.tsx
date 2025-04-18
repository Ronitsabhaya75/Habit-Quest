"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainLayout } from "@/components/main-layout"
import { Star } from "lucide-react"

export default function Review() {
  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [usageFrequency, setUsageFrequency] = useState("")
  const [favoriteFeatures, setFavoriteFeatures] = useState("")
  const [improvements, setImprovements] = useState("")
  const [recommendation, setRecommendation] = useState("")
  const [review, setReview] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !name.trim() ||
      rating === 0 ||
      !usageFrequency ||
      !favoriteFeatures.trim() ||
      !improvements.trim() ||
      !recommendation ||
      !review.trim()
    ) {
      setError("Please fill out all fields.")
      return
    }

    // Simulate form submission
    console.log("Review Submitted:", {
      name,
      rating,
      usageFrequency,
      favoriteFeatures,
      improvements,
      recommendation,
      review,
    })

    // Clear form and show success
    setName("")
    setRating(0)
    setUsageFrequency("")
    setFavoriteFeatures("")
    setImprovements("")
    setRecommendation("")
    setReview("")
    setSubmitted(true)
    setError("")
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">HabitQuest Review</h1>
        <p className="text-gray-400">Let us know what you think about HabitQuest</p>
      </div>

      <Card className="bg-[#1a2332]/80 border-[#2a3343]">
        <CardHeader>
          <CardTitle className="text-xl text-white">Your Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#2a3343] border-[#3a4353] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Overall Rating</Label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage-frequency" className="text-white">
                  How often do you use HabitQuest?
                </Label>
                <Select value={usageFrequency} onValueChange={setUsageFrequency}>
                  <SelectTrigger className="bg-[#2a3343] border-[#3a4353] text-white">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3343] text-white">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="favorite-features" className="text-white">
                  What features do you like most?
                </Label>
                <Textarea
                  id="favorite-features"
                  placeholder="Tell us what you enjoy..."
                  value={favoriteFeatures}
                  onChange={(e) => setFavoriteFeatures(e.target.value)}
                  className="bg-[#2a3343] border-[#3a4353] text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvements" className="text-white">
                  How can we improve?
                </Label>
                <Textarea
                  id="improvements"
                  placeholder="Suggestions for improvement..."
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="bg-[#2a3343] border-[#3a4353] text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendation" className="text-white">
                  Would you recommend HabitQuest?
                </Label>
                <Select value={recommendation} onValueChange={setRecommendation}>
                  <SelectTrigger className="bg-[#2a3343] border-[#3a4353] text-white">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3343] text-white">
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="maybe">Maybe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-comments" className="text-white">
                  Additional Comments
                </Label>
                <Textarea
                  id="additional-comments"
                  placeholder="Anything else to share?"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="bg-[#2a3343] border-[#3a4353] text-white min-h-[120px]"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00FFC6] to-[#4A90E2] text-black font-semibold py-3 rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                Submit Review
              </Button>
            </form>
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
