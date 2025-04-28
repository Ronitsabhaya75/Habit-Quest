"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Star, Loader2, Volume2, VolumeX } from "lucide-react"
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
  const [formIsComplete, setFormIsComplete] = useState<boolean>(false)
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false)
  
  // Refs for audio
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const submitSoundRef = useRef<HTMLAudioElement | null>(null)
  const starSoundRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio elements
  useEffect(() => {
    bgMusicRef.current = new Audio('/sounds/cosmic-ambient.mp3')
    bgMusicRef.current.loop = true
    bgMusicRef.current.volume = 0.2
    
    submitSoundRef.current = new Audio('/sounds/rocket-launch.mp3')
    submitSoundRef.current.volume = 0.3
    
    starSoundRef.current = new Audio('/sounds/star-ding.mp3')
    starSoundRef.current.volume = 0.15
    
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause()
      }
    }
  }, [])

  // Toggle background music
  const toggleAudio = () => {
    if (audioEnabled) {
      if (bgMusicRef.current) bgMusicRef.current.pause()
    } else {
      if (bgMusicRef.current) bgMusicRef.current.play().catch(e => console.log("Audio play prevented:", e))
    }
    setAudioEnabled(!audioEnabled)
  }

  // Play star sound
  const playStarSound = () => {
    if (audioEnabled && starSoundRef.current) {
      starSoundRef.current.currentTime = 0
      starSoundRef.current.play().catch(e => console.log("Audio play prevented:", e))
    }
  }

  // Play submit sound
  const playSubmitSound = () => {
    if (audioEnabled && submitSoundRef.current) {
      submitSoundRef.current.currentTime = 0
      submitSoundRef.current.play().catch(e => console.log("Audio play prevented:", e))
    }
  }

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
    const percentage = Math.round((completed / fields.length) * 100);
    setCompletionPercentage(percentage);
    setFormIsComplete(percentage === 100);
  }, [name, rating, usageFrequency, favoriteFeatures, improvements, recommendation, review]);

  const handleRatingClick = (value: number): void => {
    setRating(value)
    playStarSound()
    
    // Create star pulse animation
    const starElement = document.getElementById(`star-${value}`);
    if (starElement) {
      starElement.classList.add('animate-pulse-star');
      setTimeout(() => {
        starElement.classList.remove('animate-pulse-star');
      }, 700);
    }
    
    // Create sparkle effect
    for (let i = 0; i < 8; i++) {
      createSparkle(value);
    }
  }

  const createSparkle = (starIndex: number) => {
    const starElement = document.getElementById(`star-${starIndex}`);
    if (!starElement) return;
    
    const rect = starElement.getBoundingClientRect();
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    
    // Random position around the star
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30;
    const xOffset = Math.cos(angle) * distance;
    const yOffset = Math.sin(angle) * distance;
    
    // Set sparkle position relative to star
    sparkle.style.left = `${rect.left + rect.width/2 + xOffset}px`;
    sparkle.style.top = `${rect.top + rect.height/2 + yOffset}px`;
    
    // Random size and animation delay
    const size = 2 + Math.random() * 4;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.animationDelay = `${Math.random() * 0.3}s`;
    
    document.body.appendChild(sparkle);
    
    // Remove sparkle after animation completes
    setTimeout(() => {
      sparkle.remove();
    }, 1000);
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

    // Play submit sound
    playSubmitSound()
    
    // Create rocket launch effect with multiple shooting stars
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createShootingStar();
      }, i * 100);
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

    // Send review data to API
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

  const createShootingStar = () => {
    const shootingStar = document.createElement('div');
    shootingStar.classList.add('shooting-star');
    
    // Random position and angle
    const startX = Math.random() * window.innerWidth;
    const angle = -15 - (Math.random() * 30); // between -45 and -15 degrees
    
    shootingStar.style.setProperty('--start-x', `${startX}px`);
    shootingStar.style.setProperty('--angle', `${angle}deg`);
    
    document.getElementById('cosmic-background')?.appendChild(shootingStar);
    
    // Remove after animation completes
    setTimeout(() => {
      shootingStar.remove();
    }, 2000);
  }

  return (
    <AppLayout title="HabitQuest Review" subtitle="Let us know what you think about HabitQuest">
      {/* Cosmic Background */}
      <div id="cosmic-background" className="fixed inset-0 overflow-hidden bg-[#0B0C2A] z-0">
        {/* Nebula Background */}
        <div className="nebula-background absolute inset-0 opacity-40"></div>
        
        {/* Stars Layer */}
        <div className="stars-layer absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={`star-sm-${i}`} 
              className="star star-small"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={`star-md-${i}`} 
              className="star star-medium"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={`star-lg-${i}`} 
              className="star star-large"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Dark Matter Mist */}
        <div className="dark-matter-mist absolute inset-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={`mist-${i}`} 
              className="mist-cloud"
              style={{
                top: `${(i * 25) + Math.random() * 10}%`,
                left: `${(i * 25) + Math.random() * 10}%`,
                animationDelay: `${i * 7}s`
              }}
            />
          ))}
        </div>
        
        {/* Grid Overlay */}
        <div className="grid-overlay absolute inset-0 opacity-10"></div>
        
        {/* XP Orbs */}
        <div className="xp-orbs-container absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={`orb-${i}`} 
              className="xp-orb"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${10 + Math.random() * 20}s`,
                animationDelay: `${Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Audio Controls */}
      <button 
        onClick={toggleAudio}
        className={`fixed top-6 right-6 z-50 bg-opacity-50 bg-[#131429] p-3 rounded-full border border-[#4ADEDE] text-white transition-all duration-300 hover:bg-opacity-80 hover:shadow-glow-sm`}
        aria-label={audioEnabled ? "Mute background music" : "Play background music"}
      >
        {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Title with Cosmic Styling */}
        <h1 className="cosmic-title text-3xl font-bold text-center mb-2 text-white">
          HabitQuest Review
        </h1>
        <p className="cosmic-text text-center mb-10 text-gray-300">
          Let us know what you think about your journey through the cosmos
        </p>

        {/* Form Completion Progress */}
        {!submitted && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-white mb-1">
              <span>Form Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="cosmic-progress-container h-2 w-full bg-[rgba(19,20,41,0.7)] rounded-full overflow-hidden"
                 style={{ 
                   boxShadow: `0 0 ${Math.min(12, completionPercentage/10)}px rgba(74,222,222,${completionPercentage/100 * 0.5})`
                 }}>
              <div 
                className="cosmic-progress-bar h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Review Form Card */}
        <div className="cosmic-card-container mb-10 transition-all duration-500">
          <Card className="cosmic-card bg-[rgba(19,20,41,0.8)] backdrop-blur-md border-[rgba(74,222,222,0.3)] overflow-hidden relative transition-all duration-300"
                style={{ 
                  boxShadow: formIsComplete 
                    ? `0 0 20px rgba(74,222,222,0.4), 0 0 40px rgba(74,222,222,0.2)` 
                    : `0 0 15px rgba(74,222,222,0.15)`
                }}>
            <CardHeader className="border-b border-[rgba(74,222,222,0.1)]">
              <CardTitle className="cosmic-label text-xl text-white flex items-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-current text-[#4ADEDE]">
                  <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24z" />
                </svg>
                Your Cosmic Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="cosmic-label text-base">
                          Your Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                          className="cosmic-input bg-[rgba(15,16,35,0.8)] border-[rgba(74,222,222,0.3)] text-white h-12 transition-all focus:ring-2 focus:ring-[#4ADEDE]/30 focus:border-[rgba(74,222,222,0.5)]"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="cosmic-label text-base">Overall Rating</Label>
                        <div className="flex space-x-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              id={`star-${star}`}
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
                                    ? "fill-[#FFD700] text-[#FFD700] filter drop-shadow-[0_0_3px_rgba(255,215,0,0.7)]" 
                                    : "text-white opacity-40"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="usage-frequency" className="cosmic-label text-base">
                          How often do you use HabitQuest?
                        </Label>
                        <Select value={usageFrequency} onValueChange={setUsageFrequency}>
                          <SelectTrigger className="cosmic-input bg-[rgba(15,16,35,0.8)] border-[rgba(74,222,222,0.3)] text-white h-12 transition-all focus:ring-2 focus:ring-[#4ADEDE]/30 focus:border-[rgba(74,222,222,0.5)]">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent className="bg-[rgba(19,20,41,0.95)] border-[rgba(74,222,222,0.3)] text-white">
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="rarely">Rarely</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="recommendation" className="cosmic-label text-base">
                          Would you recommend HabitQuest?
                        </Label>
                        <Select value={recommendation} onValueChange={setRecommendation}>
                          <SelectTrigger className="cosmic-input bg-[rgba(15,16,35,0.8)] border-[rgba(74,222,222,0.3)] text-white h-12 transition-all focus:ring-2 focus:ring-[#4ADEDE]/30 focus:border-[rgba(74,222,222,0.5)]">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent className="bg-[rgba(19,20,41,0.95)] border-[rgba(74,222,222,0.3)] text-white">
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
                        <Label htmlFor="favorite-features" className="cosmic-label text-base">
                          What features do you like most?
                        </Label>
                        <Textarea
                          id="favorite-features"
                          placeholder="Tell us what you enjoy..."
                          value={favoriteFeatures}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFavoriteFeatures(e.target.value)}
                          className="cosmic-input bg-[rgba(15,16,35,0.8)] border-[rgba(74,222,222,0.3)] text-white min-h-[100px] transition-all focus:ring-2 focus:ring-[#4ADEDE]/30 focus:border-[rgba(74,222,222,0.5)]"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="improvements" className="cosmic-label text-base">
                          How can we improve?
                        </Label>
                        <Textarea
                          id="improvements"
                          placeholder="Suggestions for improvement..."
                          value={improvements}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImprovements(e.target.value)}
                          className="cosmic-input bg-[rgba(15,16,35,0.8)] border-[rgba(74,222,222,0.3)] text-white min-h-[100px] transition-all focus:ring-2 focus:ring-[#4ADEDE]/30 focus:border-[rgba(74,222,222,0.5)]"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="additional-comments" className="cosmic-label text-base">
                          Additional Comments
                        </Label>
                        <Textarea
                          id="additional-comments"
                          placeholder="Anything else to share?"
                          value={review}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReview(e.target.value)}
                          className="cosmic-input bg-[rgba(15,16,35,0.8)] border-[rgba(74,222,222,0.3)] text-white min-h-[120px] transition-all focus:ring-2 focus:ring-[#4ADEDE]/30 focus:border-[rgba(74,222,222,0.5)]"
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
                    className={`cosmic-button w-full text-white font-semibold py-4 rounded-lg transform hover:-translate-y-1 transition-all duration-300 flex justify-center items-center text-lg ${formIsComplete ? "cosmic-button-ready" : ""}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Launching Feedback...
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
                  <div className="w-20 h-20 bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] rounded-full flex items-center justify-center mb-6 animate-bounce-slow shadow-glow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="cosmic-title text-3xl font-bold text-white mb-3">Transmission Received!</h2>
                  <p className="cosmic-text text-center mb-8 max-w-md text-lg text-gray-300">
                    Your cosmic feedback has been successfully transmitted to the HabitQuest galaxy. Thank you for helping us improve!
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="cosmic-button-alt bg-[rgba(74,222,222,0.2)] text-white border border-[rgba(74,222,222,0.3)] hover:bg-[rgba(74,222,222,0.3)] transform hover:scale-105 transition-all px-6 py-3 text-lg rounded-lg shadow-glow-sm"
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
                    Send Another Transmission
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add custom CSS for animations and cosmic theme */}
      <style jsx global>{`
        /* Cosmic Background Elements */
        .nebula-background {
          background: radial-gradient(circle at center, 
            rgba(127, 90, 240, 0.2), 
            rgba(74, 222, 222, 0.1) 40%, 
            rgba(11, 12, 42, 0) 70%);
          animation: nebulaRotate 120s linear infinite;
          z-index: 0;
        }
        
        /* Stars */
        .star {
          position: absolute;
          border-radius: 50%;
          background-color: #ffffff;
          animation: twinkle 3s ease-in-out infinite;
        }
        
        .star-small {
          width: 1px;
          height: 1px;
          box-shadow: 0 0 2px 1px rgba(255, 255, 255, 0.6);
        }
        
        .star-medium {
          width: 2px;
          height: 2px;
          box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.7);
        }
        
        .star-large {
          width: 3px;
          height: 3px;
          box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.8);
        }
        
        /* Dark Matter Mist */
        .mist-cloud {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, 
            rgba(127, 90, 240, 0.05), 
            rgba(11, 12, 42, 0) 70%);
          filter: blur(20px);
          animation: mistMove 30s linear infinite;
        }
        
        /* Grid Overlay */
        .grid-overlay {
          background-image: 
            linear-gradient(to right, rgba(74, 222, 222, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(74, 222, 222, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        /* XP Orbs */
        .xp-orb {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: radial-gradient(circle, 
            rgba(74, 222, 222, 1) 20%, 
            rgba(127, 90, 240, 0.8) 100%);
          box-shadow: 0 0 10px 2px rgba(74, 222, 222, 0.6);
          opacity: 0.7;
          animation: orbFloat linear infinite;
        }
        
        /* Sparkles */
        .sparkle {
          position: fixed;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: radial-gradient(circle, 
            rgba(255, 215, 0, 1) 20%, 
            rgba(255, 215, 0, 0.3) 70%);
          box-shadow: 0 0 5px 1px rgba(255, 215, 0, 0.8);
          pointer-events: none;
          z-index: 100;
          animation: sparkleAnim 0.8s forwards;
        }
        
        /* Shooting Stars */
        .shooting-star {
          position: absolute;
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(74, 222, 222, 0.5), 
            rgba(74, 222, 222, 1), 
            rgba(127, 90, 240, 1));
          transform: rotate(var(--angle, -35deg));
          left: var(--start-x, 50%);
          top: -10px;
          border-radius: 100%;
          filter: drop-shadow(0 0 6px rgba(74, 222, 222, 0.8));
          animation: shootingStar 2s ease-out forwards;
          z-index: 10;
          pointer-events: none;
        }
        
        .shooting-star::before {
          content: '';
          position: absolute;
          top: -3px;
          right: 0;
          width: 10px;
          height: 10px;
          background: radial-gradient(circle, 
            rgba(74, 222, 222, 1) 0%, 
            rgba(127, 90, 240, 0.5) 70%, 
            transparent 100%);
          border-radius: 50%;
          filter: blur(1px);
        }
        
        /* Cosmic Card Styling */
        .cosmic-card-container {
          transform-style: preserve-3d;
        }
        
        .cosmic-card {
          transform-style: preserve-3d;
          animation: float 6s ease-in-out infinite;
          border: 1px solid rgba(74, 222, 222, 0.3);
        }
        
        .cosmic-card:hover {
          border-color: rgba(74, 222, 222, 0.6);
          box-shadow: 0 0 20px rgba(74, 222, 222, 0.4);
          transform: translateY(-5px);
        }
        
        /* Cosmic Text Styling */
        .cosmic-title {
          background: linear-gradient(to right, #4ADEDE, #7F5AF0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 10px rgba(74, 222, 222, 0.5);
          letter-spacing: 0.5px;
        }
        
        .cosmic-label {
          color: #ffffff;
          text-shadow: 0 0 5px rgba(74, 222, 222, 0.3);
          font-weight: 500;
        }
        
        .cosmic-text {
          color: #e1e1e6;
        }
        
        /* Cosmic Input Styling */
        .cosmic-input:focus {
          box-shadow: 0 0 0 2px rgba(19, 20, 41, 0.8), 0 0 0 4px rgba(74, 222, 222, 0.3);
          border-color: rgba(74, 222, 222, 0.6);
        }
        
        /* Cosmic Button Styling */
        .cosmic-button {
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
          box-shadow: 0 4px 15px rgba(74, 222, 222, 0.3);
          transition: all 0.3s ease;
        }
        
        .cosmic-button:hover {
          box-shadow: 0 6px 20px rgba(74, 222, 222, 0.5);
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0, #4ADEDE);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        
        .cosmic-button-ready {
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0, #4ADEDE);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
          box-shadow: 0 0 15px rgba(74, 222, 222, 0.6);
        }
        
        .cosmic-button-alt {
          transition: all 0.3s ease;
        }
        
        .cosmic-button-alt:hover {
          box-shadow: 0 0 15px rgba(74, 222, 222, 0.4);
        }
        
        /* Cosmic Progress Bar */
        .cosmic-progress-container {
          border: 1px solid rgba(74, 222, 222, 0.2);
        }
        
        .cosmic-progress-bar {
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
          animation: pulse 2s infinite;
          background-size: 200% 100%;
        }
        
        /* Animations */
        @keyframes float {
          0% { transform: translateY(0px) rotateX(0deg) rotateZ(0deg); }
          50% { transform: translateY(-10px) rotateX(2deg) rotateZ(-0.5deg); }
          100% { transform: translateY(0px) rotateX(0deg) rotateZ(0deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes nebulaRotate {
          0% { transform: rotate(0deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1.1); }
        }
        
        @keyframes mistMove {
          0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(100px, 50px) scale(1.5); opacity: 0.3; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
        }
        
        @keyframes orbFloat {
          0% { transform: translate(0, 0); opacity: 0.7; }
          30% { opacity: 0.3; }
          70% { opacity: 0.7; }
          100% { transform: translate(0, -500px); opacity: 0; }
        }
        
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes sparkleAnim {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
        
        @keyframes shootingStar {
          0% { transform: rotate(var(--angle)) translateX(0) scale(0.3); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: rotate(var(--angle)) translateX(150vw) scale(0.3); opacity: 0; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        /* Shadow utilities */
        .shadow-glow-sm {
          box-shadow: 0 0 10px rgba(74, 222, 222, 0.4);
        }
        
        .shadow-glow-md {
          box-shadow: 0 0 20px rgba(74, 222, 222, 0.5), 0 0 40px rgba(74, 222, 222, 0.3);
        }
        
        @keyframes pulse-star {
          0% { transform: scale(1); filter: drop-shadow(0 0 3px rgba(255,215,0,0.7)); }
          50% { transform: scale(1.2); filter: drop-shadow(0 0 8px rgba(255,215,0,1)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 3px rgba(255,215,0,0.7)); }
        }
        
        .animate-pulse-star {
          animation: pulse-star 0.6s ease-in-out;
        }
      `}</style>
    </AppLayout>
  )
}
