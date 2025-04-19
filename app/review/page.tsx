"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SharedLayout from "@/components/shared-layout"
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
    <SharedLayout>
      <div className="px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#00FFF5] drop-shadow-[0_0_10px_rgba(0,255,245,0.3)]">HabitQuest Review</h1>
          <p className="text-[#B8FFF9] opacity-80">Let us know what you think about HabitQuest</p>
        </div>

        <Card className="bg-[rgba(11,26,44,0.8)] backdrop-blur-md border-[rgba(0,255,198,0.3)] shadow-[0_0_15px_rgba(0,255,198,0.15)] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-[#B8FFF9]">Your Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#B8FFF9]">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#B8FFF9]">Overall Rating</Label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-[#B8FFF9] opacity-40"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage-frequency" className="text-[#B8FFF9]">
                    How often do you use HabitQuest?
                  </Label>
                  <Select value={usageFrequency} onValueChange={setUsageFrequency}>
                    <SelectTrigger className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9]">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="bg-[rgba(11,26,44,0.95)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9]">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="rarely">Rarely</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favorite-features" className="text-[#B8FFF9]">
                    What features do you like most?
                  </Label>
                  <Textarea
                    id="favorite-features"
                    placeholder="Tell us what you enjoy..."
                    value={favoriteFeatures}
                    onChange={(e) => setFavoriteFeatures(e.target.value)}
                    className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="improvements" className="text-[#B8FFF9]">
                    How can we improve?
                  </Label>
                  <Textarea
                    id="improvements"
                    placeholder="Suggestions for improvement..."
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendation" className="text-[#B8FFF9]">
                    Would you recommend HabitQuest?
                  </Label>
                  <Select value={recommendation} onValueChange={setRecommendation}>
                    <SelectTrigger className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9]">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="bg-[rgba(11,26,44,0.95)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9]">
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional-comments" className="text-[#B8FFF9]">
                    Additional Comments
                  </Label>
                  <Textarea
                    id="additional-comments"
                    placeholder="Anything else to share?"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] min-h-[120px]"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520] hover:brightness-110 font-semibold py-3 rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                >
                  Submit Review
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-[#0d1520]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#00FFF5] mb-2">Thank You!</h2>
                <p className="text-[#B8FFF9] text-center mb-6 max-w-md">
                  Your feedback is important to us and will help improve HabitQuest for everyone.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-[rgba(0,166,255,0.2)] text-[#B8FFF9] border border-[rgba(0,166,255,0.3)] hover:bg-[rgba(0,166,255,0.3)]"
                >
                  Submit Another Review
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SharedLayout>
  )
}
