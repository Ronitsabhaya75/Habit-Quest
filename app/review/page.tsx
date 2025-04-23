"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Star, Loader2 } from "lucide-react"
import { AppLayout } from "../../components/app-layout"

export default function Review() {
  const [name, setName] = useState<string>("")
  const [rating, setRating] = useState<number>(0)
  const [usageFrequency, setUsageFrequency] = useState<string>("")
  const [favoriteFeatures, setFavoriteFeatures] = useState<string>("")
  const [improvements, setImprovements] = useState<string>("")
  const [recommendation, setRecommendation] = useState<string>("")
  const [review, setReview] = useState<string>("")
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [completionPercentage, setCompletionPercentage] = useState<number>(0)

  // Calculate form completion percentage
  useEffect(() => {
    const fields = [
      name.trim() !== "",
      rating > 0,
      usageFrequency !== "",
      favoriteFeatures.trim() !== "",
      improvements.trim() !== "",
      recommendation !== "",
      review.trim() !== ""
    ];
    
    const completed = fields.filter(Boolean).length;
    setCompletionPercentage(Math.round((completed / fields.length) * 100));
  }, [name, rating, usageFrequency, favoriteFeatures, improvements, recommendation, review]);

  const handleRatingClick = (value: number): void => {
    setRating(value)
  }

  const handleRatingHover = (value: number): void => {
    setHoverRating(value)
  }

  const handleRatingLeave = (): void => {
    setHoverRating(0)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
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

    // Start loading state
    setLoading(true)
    setError("")

    // Prepare review data
    const reviewData = {
      name,
      rating,
      usageFrequency,
      favoriteFeatures,
      improvements,
      recommendation,
      review,
      timestamp: new Date().toISOString()
    }

    // Send review data to Google Sheets via API
    fetch('/api/reviews/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Clear form and show success
        setName("")
        setRating(0)
        setUsageFrequency("")
        setFavoriteFeatures("")
        setImprovements("")
        setRecommendation("")
        setReview("")
        setSubmitted(true)
        
        // Log success
        console.log("Review submitted successfully:", data)
      } else {
        // Show error
        setError(data.message || "Failed to submit review. Please try again.")
        console.error("Review submission error:", data)
      }
    })
    .catch(error => {
      console.error("Review submission error:", error)
      setError("Failed to submit review. Please try again later.")
    })
    .finally(() => {
      setLoading(false)
    })
  }

  return (
    <AppLayout title="HabitQuest Review" subtitle="Let us know what you think about HabitQuest">
      {/* Form Completion Progress */}
      {!submitted && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-[#B8FFF9] mb-1">
            <span>Form Completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-[rgba(21,38,66,0.6)] rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <Card className="bg-[rgba(11,26,44,0.8)] backdrop-blur-md border-[rgba(0,255,198,0.3)] shadow-[0_0_15px_rgba(0,255,198,0.15)] overflow-hidden transform hover:shadow-[0_0_25px_rgba(0,255,198,0.25)] transition-all duration-300">
        <CardHeader className="border-b border-[rgba(0,255,198,0.1)]">
          <CardTitle className="text-xl text-[#B8FFF9] flex items-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-current text-[#00FFF5]">
              <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24z" />
            </svg>
            Your Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-8">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-[#B8FFF9] text-base">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] h-12 transition-all focus:ring-2 focus:ring-[#00FFF5]/30 focus:border-[rgba(0,255,198,0.5)]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[#B8FFF9] text-base">Overall Rating</Label>
                    <div className="flex space-x-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          onMouseEnter={() => handleRatingHover(star)}
                          onMouseLeave={handleRatingLeave}
                          className="focus:outline-none transform transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`h-10 w-10 ${
                              star <= (hoverRating || rating) 
                                ? "fill-yellow-400 text-yellow-400 filter drop-shadow-[0_0_3px_rgba(250,204,21,0.7)]" 
                                : "text-[#B8FFF9] opacity-40"
                            } ${
                              star <= rating ? "animate-bounce-once" : ""
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="usage-frequency" className="text-[#B8FFF9] text-base">
                      How often do you use HabitQuest?
                    </Label>
                    <Select value={usageFrequency} onValueChange={setUsageFrequency}>
                      <SelectTrigger className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] h-12 transition-all focus:ring-2 focus:ring-[#00FFF5]/30 focus:border-[rgba(0,255,198,0.5)]">
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

                  <div className="space-y-3">
                    <Label htmlFor="recommendation" className="text-[#B8FFF9] text-base">
                      Would you recommend HabitQuest?
                    </Label>
                    <Select value={recommendation} onValueChange={setRecommendation}>
                      <SelectTrigger className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] h-12 transition-all focus:ring-2 focus:ring-[#00FFF5]/30 focus:border-[rgba(0,255,198,0.5)]">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent className="bg-[rgba(11,26,44,0.95)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9]">
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="favorite-features" className="text-[#B8FFF9] text-base">
                      What features do you like most?
                    </Label>
                    <Textarea
                      id="favorite-features"
                      placeholder="Tell us what you enjoy..."
                      value={favoriteFeatures}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFavoriteFeatures(e.target.value)}
                      className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] min-h-[100px] transition-all focus:ring-2 focus:ring-[#00FFF5]/30 focus:border-[rgba(0,255,198,0.5)]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="improvements" className="text-[#B8FFF9] text-base">
                      How can we improve?
                    </Label>
                    <Textarea
                      id="improvements"
                      placeholder="Suggestions for improvement..."
                      value={improvements}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImprovements(e.target.value)}
                      className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] min-h-[100px] transition-all focus:ring-2 focus:ring-[#00FFF5]/30 focus:border-[rgba(0,255,198,0.5)]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="additional-comments" className="text-[#B8FFF9] text-base">
                      Additional Comments
                    </Label>
                    <Textarea
                      id="additional-comments"
                      placeholder="Anything else to share?"
                      value={review}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReview(e.target.value)}
                      className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] min-h-[120px] transition-all focus:ring-2 focus:ring-[#00FFF5]/30 focus:border-[rgba(0,255,198,0.5)]"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm animate-pulse">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520] hover:brightness-110 font-semibold py-4 rounded-lg transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(0,255,198,0.4)] flex justify-center items-center text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Review
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] rounded-full flex items-center justify-center mb-6 animate-bounce-slow shadow-[0_0_15px_rgba(0,255,198,0.4)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-[#0d1520]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#00FFF5] mb-3 drop-shadow-[0_0_10px_rgba(0,255,245,0.3)]">Thank You!</h2>
              <p className="text-[#B8FFF9] text-center mb-8 max-w-md text-lg">
                Your feedback is important to us and will help improve HabitQuest for everyone. We appreciate your time!
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="bg-[rgba(0,166,255,0.2)] text-[#B8FFF9] border border-[rgba(0,166,255,0.3)] hover:bg-[rgba(0,166,255,0.3)] transform hover:scale-105 transition-all px-6 py-3 text-lg rounded-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Submit Another Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes bounce-once {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .animate-bounce-once {
          animation: bounce-once 1s;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
      `}</style>
    </AppLayout>
  )
}