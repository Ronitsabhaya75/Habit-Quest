"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { FitnessPlan } from "../../components/fitness-plan"
import { DietPlan } from "../../components/diet-plan"
import { Slider } from "../../components/ui/slider"
import { Progress } from "../../components/ui/progress"
import { 
  Volume2, 
  VolumeX, 
  Dumbbell, 
  Scale, 
  Ruler, 
  Calendar, 
  Activity, 
  Award, 
  Home, 
  Gamepad2, 
  Plus,
  ShoppingBag,
  Star,
  Search
} from "lucide-react"

// Define proper types for formData
interface FormData {
  name: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  fitnessGoal: string;
  [key: string]: string | number; // Index signature for dynamic access
}

export default function Fitness() {
  const [showForm, setShowForm] = useState(true)
  const [activeTab, setActiveTab] = useState("workout")
  const [formProgress, setFormProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [playMusic, setPlayMusic] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    weight: 70,
    height: 175,
    age: 30,
    gender: "male",
    activityLevel: "",
    fitnessGoal: ""
  })
  
  // Store form data in context or local storage for component access
  useEffect(() => {
    // This stores the form data in localStorage so the components can access it
    // without direct prop passing
    if (!showForm) {
      localStorage.setItem('fitnessUserData', JSON.stringify(formData))
    }
  }, [showForm, formData])
  
  // Properly typed audio reference
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Toggle background music
  useEffect(() => {
    if (audioRef.current) {
      if (playMusic) {
        audioRef.current.play().catch((e: Error) => console.log("Audio play failed:", e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [playMusic])
  
  // Calculate form progress whenever form data changes
  useEffect(() => {
    const requiredFields = ['name', 'weight', 'height', 'age', 'gender', 'activityLevel', 'fitnessGoal']
    const filledFields = requiredFields.filter(field => 
      formData[field] !== "" && formData[field] !== undefined
    )
    setFormProgress(Math.round((filledFields.length / requiredFields.length) * 100))
  }, [formData])
  
  // Properly typed input change handler
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Properly typed submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    
    // Simulate loading time for the animation
    setTimeout(() => {
      setIsGenerating(false)
      setShowForm(false)
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-[#0B0C2A] text-white flex flex-col overflow-hidden">
      {/* New Navigation Bar based on the images */}
      <header className="border-b border-[#1e293b] relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold cosmic-text">
                <span className="text-[#4ADEDE]">Habit</span>Quest
              </h1>
            </div>
            
            {/* Main Navigation */}
            <nav className="flex-1 flex justify-center">
              <ul className="flex space-x-10">
                <li>
                  <a href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1 nav-link">
                    <Home size={20} />
                    <span className="text-xs mt-1">Dashboard</span>
                  </a>
                </li>
                <li>
                  <a href="/mini-games" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1 nav-link">
                    <Gamepad2 size={20} />
                    <span className="text-xs mt-1">Mini Games</span>
                  </a>
                </li>
                <li>
                  <a href="/calendar" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1 nav-link">
                    <Calendar size={20} />
                    <span className="text-xs mt-1">Calendar</span>
                  </a>
                </li>
                <li>
                  <a href="/habit-creation" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1 nav-link">
                    <Plus size={20} />
                    <span className="text-xs mt-1">Habit Creation</span>
                  </a>
                </li>
                <li>
                  <a href="/fitness" className="flex flex-col items-center text-[#4ADEDE] border-b-2 border-[#4ADEDE] py-1 active-nav-link">
                    <Activity size={20} className="glow-icon" />
                    <span className="text-xs mt-1">Fitness</span>
                  </a>
                </li>
                <li>
                  <a href="/shop" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1 nav-link">
                    <ShoppingBag size={20} />
                    <span className="text-xs mt-1">Shop</span>
                  </a>
                </li>
                <li>
                  <a href="/review" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1 nav-link">
                    <Star size={20} />
                    <span className="text-xs mt-1">Review</span>
                  </a>
                </li>
              </ul>
            </nav>
            
            {/* Right Side Items */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search..."
                  className="bg-[#131429] border-[#2a3343] text-white pl-10 w-48 h-9 rounded-full search-input"
                />
              </div>
              <div className="bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-black px-4 py-1 rounded-full text-sm font-medium level-badge">
                Level 1
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative min-h-screen overflow-hidden flex-1">
        {/* Enhanced background with cosmic elements */}
        <div className="cosmic-background">
          {/* Base gradient background */}
          <div className="nebula-background"></div>
          
          {/* Animated starfield layers */}
          <div className="stars-layer stars-small"></div>
          <div className="stars-layer stars-medium"></div>
          <div className="stars-layer stars-large"></div>
          
          {/* Shooting stars */}
          <div className="shooting-stars">
            <div className="shooting-star"></div>
            <div className="shooting-star"></div>
            <div className="shooting-star"></div>
          </div>
          
          {/* Dark matter mist */}
          <div className="dark-matter-mist"></div>
          
          {/* Grid overlay */}
          <div className="grid-overlay"></div>
        </div>
        
        {/* Background music (hidden audio element) */}
        <audio 
          ref={audioRef}
          src="/sounds/motivational-background.mp3" 
          loop 
          className="hidden"
        />
        
        {/* Music toggle button */}
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setPlayMusic(!playMusic)}
            className="text-white hover:bg-[#2a3343]/50 transition-all music-btn"
          >
            {playMusic ? <Volume2 className="h-5 w-5 glow-icon" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>
        
        <div className="relative z-1 max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold text-white mb-2 animate-fadeIn cosmic-title">
              Cosmic Fitness Journey
            </h1>
            <p className="text-gray-400 max-w-lg animate-slideUp cosmic-subtitle">
              Chart your course through the universe of health and wellness with personalized fitness and diet plans
            </p>
          </div>

          {showForm ? (
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center justify-center">
                  <span className="mr-2">Your Fitness Profile</span>
                  <Activity className="h-5 w-5 text-[#4ADEDE] animate-pulse glow-icon" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Name input */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white flex items-center cosmic-label">
                      <span className="mr-2">Your Name</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      className="cosmic-input"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  {/* Weight slider */}
                  <div className="space-y-4">
                    <Label htmlFor="weight" className="text-white flex items-center cosmic-label">
                      <Scale className="h-4 w-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                      <span>Weight (kg): {formData.weight}</span>
                    </Label>
                    <Slider
                      id="weight"
                      min={30}
                      max={150}
                      step={1}
                      value={[formData.weight]}
                      onValueChange={(value) => handleInputChange('weight', value[0])}
                      className="py-4 cosmic-slider"
                    />
                  </div>

                  {/* Height slider */}
                  <div className="space-y-4">
                    <Label htmlFor="height" className="text-white flex items-center cosmic-label">
                      <Ruler className="h-4 w-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                      <span>Height (cm): {formData.height}</span>
                    </Label>
                    <Slider
                      id="height"
                      min={120}
                      max={220}
                      step={1}
                      value={[formData.height]}
                      onValueChange={(value) => handleInputChange('height', value[0])}
                      className="py-4 cosmic-slider"
                    />
                  </div>

                  {/* Age slider */}
                  <div className="space-y-4">
                    <Label htmlFor="age" className="text-white flex items-center cosmic-label">
                      <Calendar className="h-4 w-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                      <span>Age: {formData.age}</span>
                    </Label>
                    <Slider
                      id="age"
                      min={16}
                      max={80}
                      step={1}
                      value={[formData.age]}
                      onValueChange={(value) => handleInputChange('age', value[0])}
                      className="py-4 cosmic-slider"
                    />
                  </div>

                  {/* Gender selection with enhanced styling */}
                  <div className="space-y-3">
                    <Label className="text-white cosmic-label">Gender</Label>
                    <RadioGroup 
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2 p-2 rounded-md transition-all hover:bg-[#2a3343]/60 cosmic-radio">
                        <RadioGroupItem value="male" id="gender-male" className="text-[#4ADEDE]" />
                        <Label htmlFor="gender-male" className="text-white">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md transition-all hover:bg-[#2a3343]/60 cosmic-radio">
                        <RadioGroupItem value="female" id="gender-female" className="text-[#4ADEDE]" />
                        <Label htmlFor="gender-female" className="text-white">
                          Female
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md transition-all hover:bg-[#2a3343]/60 cosmic-radio">
                        <RadioGroupItem value="other" id="gender-other" className="text-[#4ADEDE]" />
                        <Label htmlFor="gender-other" className="text-white">
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Activity level with icon */}
                  <div className="space-y-3">
                    <Label className="text-white flex items-center cosmic-label">
                      <Dumbbell className="h-4 w-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                      <span>Activity Level</span>
                    </Label>
                    <Select 
                      value={formData.activityLevel}
                      onValueChange={(value) => handleInputChange('activityLevel', value)}
                    >
                      <SelectTrigger className="cosmic-select">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#131429] border-[#2a3343] text-white">
                        <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                        <SelectItem value="light">Lightly active (light exercise 1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                        <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                        <SelectItem value="very-active">Very active (very hard exercise daily)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fitness goal with icon */}
                  <div className="space-y-3">
                    <Label className="text-white flex items-center cosmic-label">
                      <Award className="h-4 w-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                      <span>Fitness Goal</span>
                    </Label>
                    <Select
                      value={formData.fitnessGoal}
                      onValueChange={(value) => handleInputChange('fitnessGoal', value)}
                    >
                      <SelectTrigger className="cosmic-select">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#131429] border-[#2a3343] text-white">
                        <SelectItem value="lose">Lose weight</SelectItem>
                        <SelectItem value="maintain">Maintain weight</SelectItem>
                        <SelectItem value="gain">Gain weight</SelectItem>
                        <SelectItem value="muscle">Build muscle</SelectItem>
                        <SelectItem value="endurance">Improve endurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Profile completion</span>
                      <span>{formProgress}%</span>
                    </div>
                    <Progress 
                      value={formProgress} 
                      className="h-2 bg-[#2a3343] cosmic-progress" 
                    />
                  </div>

                  {/* Submit button with animations */}
                  <Button 
                    type="submit" 
                    disabled={formProgress < 100 || isGenerating}
                    className={`w-full relative overflow-hidden group cosmic-button ${
                      formProgress === 100 && !isGenerating
                        ? "active"
                        : ""
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-pulse">Generating Your Cosmic Fitness Plan</span>
                        <div className="absolute inset-0 -z-10">
                          <div className="rocket absolute left-0 animate-rocketFlight">🚀</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <span>{formProgress === 100 ? "Launch Your Fitness Journey" : `Complete Your Profile (${formProgress}%)`}</span>
                        <span className="button-glow"></span>
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="animate-fadeIn">
              {formData.name && (
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-[#4ADEDE] animate-pulse greeting-text">
                    {getPersonalizedGreeting(formData)}
                  </h2>
                </div>
              )}
              
              <Tabs defaultValue="workout" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-[#2a3343] mb-4 cosmic-tabs">
                  <TabsTrigger
                    value="workout"
                    className={`transition-all duration-300 cosmic-tab ${activeTab === "workout" ? "active" : ""}`}
                  >
                    Workout Plan
                  </TabsTrigger>
                  <TabsTrigger 
                    value="diet" 
                    className={`transition-all duration-300 cosmic-tab ${activeTab === "diet" ? "active" : ""}`}
                  >
                    Diet Plan
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="workout" className="animate-slideUp">
                  <Card className="cosmic-card">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex items-center">
                        <Dumbbell className="h-5 w-5 mr-2 text-[#4ADEDE] glow-icon" />
                        Your Personalized Workout Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FitnessPlan />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="diet" className="animate-slideUp">
                  <Card className="cosmic-card">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex items-center">
                        <Scale className="h-5 w-5 mr-2 text-[#4ADEDE] glow-icon" />
                        Your Personalized Diet Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DietPlan />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  className="cosmic-edit-button"
                  onClick={() => setShowForm(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS for enhanced animations and styling */}
      <style jsx global>{`
        /* Base animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        
        @keyframes rocketFlight {
          0% { transform: translateX(-100%) translateY(0) rotate(45deg); }
          100% { transform: translateX(500%) translateY(-100px) rotate(45deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        
        @keyframes shooting {
          0% { 
            transform: translateX(0) translateY(0) rotate(45deg);
            opacity: 1;
          }
          70% { opacity: 1; }
          100% { 
            transform: translateX(var(--travel-distance)) translateY(var(--travel-distance)) rotate(45deg);
            opacity: 0;
          }
        }
        
        @keyframes mist {
          0%, 100% { transform: translateX(0) translateY(0); opacity: 0.03; }
          25% { transform: translateX(10px) translateY(-10px); opacity: 0.05; }
          50% { transform: translateX(15px) translateY(5px); opacity: 0.07; }
          75% { transform: translateX(-5px) translateY(10px); opacity: 0.04; }
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 2px #4ADEDE) drop-shadow(0 0 6px rgba(127, 90, 240, 0.6)); }
          50% { filter: drop-shadow(0 0 5px #4ADEDE) drop-shadow(0 0 15px rgba(127, 90, 240, 0.8)); }
        }
        
        @keyframes buttonGlow {
          0%, 100% { box-shadow: 0 0 10px #4ADEDE, 0 0 20px rgba(127, 90, 240, 0.5); }
          50% { box-shadow: 0 0 15px #4ADEDE, 0 0 30px rgba(127, 90, 240, 0.7); }
        }
        
        /* Base styles */
        body {
          background-color: #0B0C2A;
          color: white;
          overflow-x: hidden;
        }
        
        /* Cosmic background */
        .cosmic-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 0;
        }
        
        .nebula-background {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, #2d2a55, #0f0c29, #000000);
          opacity: 0.8;
        }
        
        /* Starfield layers */
        .stars-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-repeat: repeat;
          opacity: 0.7;
        }
        
        .stars-small {
          background-image: 
            radial-gradient(1px 1px at 20px 30px, white, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 40px 70px, white, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 40px, white, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 160px 120px, white, rgba(0,0,0,0));
          background-size: 200px 200px;
          animation: stars 150s linear infinite;
        }
        
        .stars-medium {
          background-image: 
            radial-gradient(1.5px 1.5px at 150px 150px, white, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 200px 220px, white, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 300px 300px, white, rgba(0,0,0,0));
          background-size: 400px 400px;
          animation: stars 200s linear infinite;
        }
        
        .stars-large {
          background-image: 
            radial-gradient(2px 2px at 300px 200px, white, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 400px 400px, white, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 600px 600px, white, rgba(0,0,0,0));
          background-size: 600px 600px;
          animation: stars 250s linear infinite reverse;
        }
        
        /* Shooting stars */
        .shooting-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        
        .shooting-star {
          position: absolute;
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
          opacity: 0;
        }
        
        .shooting-star:nth-child(1) {
          top: 20%;
          left: 10%;
          --travel-distance: 300px;
          animation: shooting 4s linear infinite;
          animation-delay: 0s;
          transform-origin: right;
        }
        
        .shooting-star:nth-child(2) {
          top: 30%;
          left: 60%;
          --travel-distance: 200px;
          animation: shooting 5s linear infinite;
          animation-delay: 2.5s;
          transform-origin: right;
        }
        
        .shooting-star:nth-child(3) {
          top: 70%;
          left: 20%;
          --travel-distance: 250px;
          animation: shooting 6s linear infinite;
          animation-delay: 5s;
          transform-origin: right;
        }
        
        /* Dark matter mist */
        .dark-matter-mist {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 30% 40%, 
            rgba(127, 90, 240, 0.05), 
            rgba(0, 0, 0, 0) 30%
          ), radial-gradient(
            circle at 70% 60%, 
            rgba(74, 222, 222, 0.05), 
            rgba(0, 0, 0, 0) 30%
          );
          filter: blur(20px);
          animation: mist 15s ease-in-out infinite;
          opacity: 0.05;
        }
        
        /* Grid overlay */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(74, 222, 222, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(74, 222, 222, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.2;
        }
        
        /* Element styling */
        .cosmic-card {
          background-color: rgba(19, 20, 41, 0.8);
          border: 1px solid rgba(42, 51, 67, 0.8);
          backdrop-filter: blur(10px);
          transform: translateY(0);
          transition: all 0.4s ease;
          box-shadow: 0 0 15px rgba(74, 222, 222, 0.2), 0 0 30px rgba(127, 90, 240, 0.1);
        }
        
        .cosmic-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0 20px rgba(74, 222, 222, 0.4), 0 0 40px rgba(127, 90, 240, 0.2);
        }
        
        .cosmic-title {
          text-shadow: 0 0 10px #4ADEDE, 0 0 20px rgba(127, 90, 240, 0.5);
          letter-spacing: 1px;
        }
        
        .cosmic-subtitle {
          text-shadow: 0 0 5px rgba(127, 90, 240, 0.5);
        }
        
        .cosmic-text {
          text-shadow: 0 0 5px #4ADEDE;
        }
        
        .cosmic-label {
          text-shadow: 0 0 3px rgba(74, 222, 222, 0.5);
        }
        
        .cosmic-input {
          background-color: #2a3343;
          border: 1px solid #3a4353;
          color: white;
          transition: all 0.3s;
          box-shadow: 0 0 0 rgba(74, 222, 222, 0);
        }
        
        .cosmic-input:focus, .cosmic-input:hover {
          border-color: #4ADEDE;
          box-shadow: 0 0 5px rgba(74, 222, 222, 0.5);
        }
        
        .cosmic-progress {
          height: 8px;
          background-color: #2a3343;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .cosmic-progress > div {
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
          box-shadow: 0 0 10px #4ADEDE, 0 0 20px rgba(127, 90, 240, 0.5);
        }
        
        .cosmic-slider [role="slider"] {
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
          box-shadow: 0 0 5px #4ADEDE, 0 0 10px rgba(127, 90, 240, 0.5);
          transform: scale(1.2);
          transition: all 0.2s;
        }
        
        .cosmic-slider [role="slider"]:hover {
          transform: scale(1.4);
          box-shadow: 0 0 10px #4ADEDE, 0 0 20px rgba(127, 90, 240, 0.7);
        }
        
        .cosmic-slider > span {
          background: rgba(74, 222, 222, 0.3);
        }
        
        .cosmic-slider > span > span {
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
        }
        
        .cosmic-button {
          background: #2a3343;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          text-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
        }
        
        .cosmic-button.active {
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
          box-shadow: 0 0 10px #4ADEDE, 0 0 20px rgba(127, 90, 240, 0.5);
        }
        
        .cosmic-button.active:hover {
          box-shadow: 0 0 15px #4ADEDE, 0 0 30px rgba(127, 90, 240, 0.7);
          transform: translateY(-2px);
        }
        
        .button-glow {
          position: absolute;
          inset: 0;
          background: transparent;
          opacity: 0;
          z-index: -1;
        }
        
        .cosmic-button.active .button-glow {
          opacity: 1;
          animation: buttonGlow 2s infinite;
        }
        
        .cosmic-button.active:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          opacity: 0;
          transform: translateX(-100%);
        }
        
        .cosmic-button.active:hover:before {
          animation: shimmer 1.5s infinite;
        }
        
        .cosmic-select {
          background-color: #2a3343;
          border: 1px solid #3a4353;
          color: white;
          transition: all 0.3s;
        }
        
        .cosmic-select:hover, .cosmic-select:focus {
          border-color: #4ADEDE;
          box-shadow: 0 0 5px rgba(74, 222, 222, 0.5);
        }
        
        .cosmic-radio {
          transition: all 0.3s;
        }
        
        .cosmic-radio:hover {
          background: rgba(74, 222, 222, 0.1);
          box-shadow: 0 0 5px rgba(74, 222, 222, 0.3);
        }
        
        .cosmic-tabs {
          border-radius: 8px;
          overflow: hidden;
          padding: 2px;
          background: #2a3343;
          border: 1px solid #3a4353;
        }
        
        .cosmic-tab {
          color: white;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        
        .cosmic-tab.active {
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
          color: black;
          font-weight: 500;
          box-shadow: 0 0 10px rgba(74, 222, 222, 0.5);
        }
        
        .cosmic-edit-button {
          background-color: #2a3343;
          border: 1px solid #3a4353;
          color: white;
          transition: all 0.3s;
        }
        
        .cosmic-edit-button:hover {
          background-color: #3a4353;
          border-color: #4ADEDE;
          box-shadow: 0 0 10px rgba(74, 222, 222, 0.5);
          transform: translateY(-2px);
        }
        
        .glow-icon {
          filter: drop-shadow(0 0 3px #4ADEDE);
          animation: glow 3s infinite;
        }
        
        .glow-icon-sm {
          filter: drop-shadow(0 0 2px #4ADEDE);
        }
        
        .greeting-text {
          text-shadow: 0 0 10px #4ADEDE, 0 0 15px rgba(127, 90, 240, 0.7);
          animation: pulse 3s infinite;
        }
        
        .level-badge {
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 5px rgba(74, 222, 222, 0.5), 0 0 10px rgba(127, 90, 240, 0.3);
        }
        
        .level-badge:after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            transparent, 
            rgba(255, 255, 255, 0.1), 
            transparent
          );
          transform: rotate(30deg);
          animation: shimmer 3s infinite;
        }
        
        .search-input {
          transition: all 0.3s;
        }
        
        .search-input:focus {
          box-shadow: 0 0 0 1px #4ADEDE, 0 0 5px rgba(74, 222, 222, 0.5);
          border-color: #4ADEDE;
        }
        
        .active-nav-link {
          position: relative;
        }
        
        .active-nav-link:after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
          box-shadow: 0 0 5px #4ADEDE;
        }
        
        .nav-link {
          position: relative;
        }
        
        .nav-link:hover:after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          right: 50%;
          height: 2px;
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
          transition: all 0.3s;
          opacity: 0.5;
        }
        
        .nav-link:hover:after {
          left: 0;
          right: 0;
        }
        
        .music-btn {
          border-radius: 50%;
          transition: all 0.3s;
        }
        
        .music-btn:hover {
          background: rgba(74, 222, 222, 0.1);
          transform: scale(1.1);
        }
        
        @keyframes stars {
          0% { background-position: 0 0; }
          100% { background-position: 100% 100%; }
        }
        
        /* Rocket emoji */
        .rocket {
          font-size: 24px;
          filter: drop-shadow(0 0 5px rgba(74, 222, 222, 0.7));
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-in-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        
        .animate-rocketFlight {
          animation: rocketFlight 2s ease-in-out;
        }
        
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  )
}

// Helper function to generated personalized greeting based on user data
function getPersonalizedGreeting(userData: FormData) {
  const { name, fitnessGoal } = userData
  
  const goalMessages: {[key: string]: string} = {
    lose: `Ready to shed those stars, ${name}? Your weight loss journey begins!`,
    maintain: `Keep orbiting steady, ${name}! Your maintenance plan is ready.`,
    gain: `Time to expand your universe, ${name}! Let's build your mass.`,
    muscle: `Becoming a cosmic powerhouse, ${name}? Your muscle building plan awaits!`,
    endurance: `Preparing for the long voyage, ${name}? Your endurance program is set!`,
  }
  
  return goalMessages[fitnessGoal] || `Welcome to your cosmic fitness journey, ${name}!`
}