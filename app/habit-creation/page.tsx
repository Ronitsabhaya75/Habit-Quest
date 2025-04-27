"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Progress } from "../../components/ui/progress"
import { format } from "date-fns"
import { 
  CalendarIcon, 
  Rocket, 
  Droplet, 
  Timer, 
  Flame, 
  BookOpen, 
  Zap,
  Home,
  Gamepad2,
  Plus,
  ShoppingBag,
  Star,
  Search,
  Volume2,
  VolumeX,
  Activity
} from 'lucide-react'
import { cn } from "../../lib/utils"
import { useToast } from "../../components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useTask } from "../../components/task-context"
import { useRouter } from 'next/navigation'

// Example habits suggestions for rotating placeholders
const habitSuggestions = [
  { text: "Morning Meditation 🧘", icon: <Timer className="h-4 w-4" /> },
  { text: "Drink more water 💧", icon: <Droplet className="h-4 w-4" /> },
  { text: "Daily walk 🚶‍♂️", icon: <BookOpen className="h-4 w-4" /> },
  { text: "Learn something new 🧠", icon: <BookOpen className="h-4 w-4" /> },
  { text: "30 minutes of exercise 💪", icon: <Flame className="h-4 w-4" /> },
];

// Motivational quotes
const motivationalQuotes = [
  "Every habit starts with a single click.",
  "Small habits, big results.",
  "Today's habits shape tomorrow's achievements.",
  "The best time to start was yesterday. The next best time is now.",
  "Consistency turns actions into habits."
];

// Habit nodes (stars) data for background
const habitNodes = Array.from({ length: 15 }, (_, i) => ({
  x: `${Math.random() * 90 + 5}%`,
  y: `${Math.random() * 90 + 5}%`,
  size: Math.random() * 3 + 1,
  delay: i * 1.5, // staggered delay
}));

// Orbit paths data (animated constellation paths)
const orbitPaths = [
  {
    path: "M50,50 C150,20 250,120 350,50 S450,120 550,100 T650,150",
    duration: 20,
    dashArray: 800,
    delay: 0,
    strokeWidth: 1,
    opacity: 0.3
  },
  {
    path: "M150,150 C200,50 350,200 450,100 S500,250 600,200",
    duration: 25,
    dashArray: 500,
    delay: 5,
    strokeWidth: 0.8,
    opacity: 0.2
  },
  {
    path: "M50,250 Q150,350 250,250 T450,300 T650,250",
    duration: 30,
    dashArray: 600,
    delay: 10,
    strokeWidth: 1.2,
    opacity: 0.25
  }
];

// Progress tracker stars - positions for each step (0-100%)
const progressStarPositions = [
  { x: 0, y: 0 },    // 0% - starting point
  { x: 20, y: -10 }, // 20%
  { x: 40, y: -5 },  // 40%
  { x: 60, y: -15 }, // 60%
  { x: 80, y: -5 },  // 80%
  { x: 100, y: 0 }   // 100% - ending point
];

export default function HabitCreation() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [formProgress, setFormProgress] = useState(0)
  const [habitName, setHabitName] = useState("")
  const [habitDescription, setHabitDescription] = useState("")
  const [frequency, setFrequency] = useState("")
  const [reminder, setReminder] = useState("yes")
  const [currentSuggestion, setCurrentSuggestion] = useState(0)
  const [currentQuote, setCurrentQuote] = useState(0)
  const [playMusic, setPlayMusic] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showParticleBurst, setShowParticleBurst] = useState(false)
  const [randomNodePulse, setRandomNodePulse] = useState(-1)
  const { toast } = useToast()
  const { addTask } = useTask()
  const router = useRouter()
  
  // Audio reference for background music
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Random habit node pulse effect every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRandomNodePulse(Math.floor(Math.random() * habitNodes.length));
      setTimeout(() => setRandomNodePulse(-1), 2000); // Reset after animation
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
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

  // Rotate through habit suggestions every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % habitSuggestions.length)
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Calculate form progress
  useEffect(() => {
    let progress = 0
    if (habitName) progress += 25
    if (habitDescription) progress += 20
    if (startDate) progress += 15
    if (endDate) progress += 15
    if (frequency) progress += 15
    if (reminder) progress += 10
    setFormProgress(progress)
  }, [habitName, habitDescription, startDate, endDate, frequency, reminder])

  // Get progress tracker star position based on current progress
  const getProgressStarPosition = (progress: number) => {
    const segment = Math.floor(progress / 20); // Which 20% segment we're in
    const remainder = progress % 20; // How far into that segment
    
    if (segment >= 5) return progressStarPositions[5]; // At 100%
    
    // Linear interpolation between current segment and next
    const currentPos = progressStarPositions[segment];
    const nextPos = progressStarPositions[segment + 1];
    const ratio = remainder / 20;
    
    return {
      x: currentPos.x + (nextPos.x - currentPos.x) * ratio,
      y: currentPos.y + (nextPos.y - currentPos.y) * ratio
    };
  };
  
  const progressStarPos = getProgressStarPosition(formProgress);

  const saveHabitToDatabase = async () => {
    try {
      if (!startDate || !endDate) {
        toast({
          title: "Missing Dates",
          description: "Please select start and end dates for your habit",
          variant: "destructive",
        })
        return null
      }

      // Create the habit object
      const habitData = {
        name: habitName,
        description: habitDescription,
        startDate: startDate,
        endDate: endDate,
        frequency: frequency,
        reminder: reminder === "yes",
      }

      // Save the habit to the database
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(habitData),
      })

      if (!response.ok) {
        throw new Error("Failed to create habit")
      }

      const data = await response.json()
      return data.habit
    } catch (error) {
      console.error("Error saving habit:", error)
      toast({
        title: "Error",
        description: "Failed to save habit. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  const createHabitTasks = async (habit: any) => {
    try {
      // For now, let's add a task for today if the start date is today or in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const startDay = new Date(habit.startDate)
      startDay.setHours(0, 0, 0, 0)
      
      // Create the initial task for today if applicable
      if (startDay <= today) {
        await addTask({
          title: habit.name,
          description: habit.description,
          dueDate: new Date(), // today
          xpReward: 30, // default XP for habits
          isHabit: true, // mark as a habit task
          isRecurring: true, // habits are recurring
          frequency: habit.frequency as "daily" | "weekly" | "biweekly" | "monthly",
          recurringEndDate: new Date(habit.endDate)
        })
      }
    } catch (error) {
      console.error("Error creating habit tasks:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Show particle burst animation
    setShowParticleBurst(true)
    setIsGenerating(true)
    
    try {
      // Import the XP_VALUES from lib/xp-system
      const { XP_VALUES } = await import("../../lib/xp-system")

      // Save the habit to the database
      const savedHabit = await saveHabitToDatabase()
      
      if (savedHabit) {
        // Create tasks for this habit
        await createHabitTasks(savedHabit)
        
        // Show success message with XP and sparkle effect
        toast({
          title: "Habit Mission Launched! 🚀",
          description: `You earned ${XP_VALUES.HABIT_CREATION} XP for creating a new habit.`,
          className: "bg-[#1a2332] border-[#4cc9f0] text-white",
        })

        // Reset form
        setHabitName("")
        setHabitDescription("")
        setStartDate(undefined)
        setEndDate(undefined)
        setFrequency("")
        setFormProgress(0)
        
        // Navigate to calendar to see the new habit task
        setTimeout(() => {
          router.push('/calendar')
        }, 2000)
      }
    } catch (error) {
      console.error("Error creating habit:", error)
      toast({
        title: "Mission Failed",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Hide particle burst and stop generating state
      setTimeout(() => {
        setIsGenerating(false)
        setShowParticleBurst(false)
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C2A] text-white flex flex-col overflow-hidden">
      {/* Header/Navigation */}
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
                  <a href="/breakthrough-game" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1 nav-link">
                    <Gamepad2 size={20} />
                    <span className="text-xs mt-1">Mini Games</span>
                  </a>
                </li>
                <li>
                  <a href="/calendar" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1 nav-link">
                    <CalendarIcon size={20} />
                    <span className="text-xs mt-1">Calendar</span>
                  </a>
                </li>
                <li>
                  <a href="/habit-creation" className="flex flex-col items-center text-[#4ADEDE] border-b-2 border-[#4ADEDE] py-1 active-nav-link">
                    <Plus size={20} className="glow-icon" />
                    <span className="text-xs mt-1">Habit Creation</span>
                  </a>
                </li>
                <li>
                  <a href="/fitness" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1 nav-link">
                    <Activity size={20} />
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
        {/* Enhanced cosmic background */}
        <div className="cosmic-background">
          {/* Base gradient background */}
          <div className="nebula-background"></div>
          
          {/* NEW: Orbit Pulse Grid (Animated Constellation Paths) */}
          <svg className="orbit-paths-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {orbitPaths.map((orbitPath, index) => (
              <path
                key={`orbit-path-${index}`}
                d={orbitPath.path}
                fill="none"
                stroke="#4ADEDE"
                strokeWidth={orbitPath.strokeWidth}
                strokeLinecap="round"
                opacity={orbitPath.opacity}
                style={{
                  strokeDasharray: orbitPath.dashArray,
                  strokeDashoffset: orbitPath.dashArray,
                  animation: `dashMotion ${orbitPath.duration}s linear infinite`,
                  animationDelay: `${orbitPath.delay}s`
                }}
                className="animated-path"
              />
            ))}
          </svg>
          
          {/* NEW: Habit Node Glow Burst */}
          <div className="habit-nodes-container">
            {habitNodes.map((node, index) => (
              <div
                key={`habit-node-${index}`}
                className={`habit-node ${randomNodePulse === index ? 'active-pulse' : ''}`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: `${node.size * 2}px`,
                  height: `${node.size * 2}px`,
                  animationDelay: `${node.delay}s`,
                  '--i': index
                } as React.CSSProperties}
              />
            ))}
          </div>
          
          {/* Subtle Starfield */}
          <div className="stars-layer stars-small"></div>
          
          {/* NEW: Growth Rings Ripple Background */}
          <div className="growth-rings-container">
            <div className="growth-ring" style={{ animationDelay: '0s' }}></div>
            <div className="growth-ring" style={{ animationDelay: '2s' }}></div>
            <div className="growth-ring" style={{ animationDelay: '4s' }}></div>
            <div className="growth-ring" style={{ animationDelay: '6s' }}></div>
          </div>
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
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-white mb-2 animate-fadeIn cosmic-title"
            >
              Habit Creation
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-400 max-w-lg animate-slideUp cosmic-subtitle"
            >
              Create new habits to track and launch your personal growth journey
            </motion.p>
          </div>

          {/* XP Badge */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="mb-6 flex items-center justify-center"
          >
            <div className="bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] p-0.5 rounded-lg">
              <div className="bg-[#1a2332]/90 px-4 py-2 rounded-lg flex items-center">
                <Zap className="w-5 h-5 mr-2 text-[#4ADEDE]" />
                <span className="text-white font-medium">Earn +30 XP by completing this habit!</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="card-container relative"
          >
            <Card className="cosmic-card">
              {/* Progress bar */}
              <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0]" style={{ width: `${formProgress}%` }}></div>
              
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-white flex items-center">
                    <Rocket className="w-5 h-5 mr-2 text-[#4ADEDE] glow-icon" />
                    Launch Your Habit Mission
                  </CardTitle>
                  <div className="text-sm text-gray-400">
                    Progress: {formProgress}%
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="habit-name" className="text-white flex items-center cosmic-label">
                      <Rocket className="w-4 h-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                      Habit Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="habit-name"
                        value={habitName}
                        onChange={(e) => setHabitName(e.target.value)}
                        placeholder={habitSuggestions[currentSuggestion].text}
                        className="cosmic-input"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4ADEDE]">
                        {habitSuggestions[currentSuggestion].icon}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="habit-description" className="text-white flex items-center cosmic-label">
                      <BookOpen className="w-4 h-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                      Description
                    </Label>
                    <Textarea
                      id="habit-description"
                      value={habitDescription}
                      onChange={(e) => setHabitDescription(e.target.value)}
                      placeholder="Describe your habit journey..."
                      className="cosmic-input min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center cosmic-label">
                        <CalendarIcon className="w-4 h-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                        Start Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal cosmic-select",
                              !startDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#4ADEDE]" />
                            {startDate ? format(startDate, "PPP") : "Select launch date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1a2332] border-[#2a3343]">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            className="rounded-md border border-[#2a3343] bg-[#1a2332]"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white flex items-center cosmic-label">
                        <CalendarIcon className="w-4 h-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                        End Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal cosmic-select",
                              !endDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#4ADEDE]" />
                            {endDate ? format(endDate, "PPP") : "Select mission end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1a2332] border-[#2a3343]">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            className="rounded-md border border-[#2a3343] bg-[#1a2332]"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white flex items-center cosmic-label">
                      <Timer className="w-4 h-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                      Frequency
                    </Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className="cosmic-select">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3343] text-white">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Biweekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white flex items-center cosmic-label">
                      <Zap className="w-4 h-4 mr-2 text-[#4ADEDE] glow-icon-sm" />
                      Reminder
                    </Label>
                    <RadioGroup value={reminder} onValueChange={setReminder} className="flex space-x-4">
                      <div className="flex items-center space-x-2 p-2 rounded-md transition-all hover:bg-[#2a3343]/60 cosmic-radio">
                        <RadioGroupItem value="yes" id="reminder-yes" className="text-[#4ADEDE]" />
                        <Label htmlFor="reminder-yes" className="text-white">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md transition-all hover:bg-[#2a3343]/60 cosmic-radio">
                        <RadioGroupItem value="no" id="reminder-no" className="text-[#4ADEDE]" />
                        <Label htmlFor="reminder-no" className="text-white">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="text-center text-sm text-gray-400 italic my-4">
                    "{motivationalQuotes[currentQuote]}"
                  </div>

                  {/* Progress container with tracking stars */}
                  <div className="space-y-2 relative">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Mission readiness</span>
                      <span>{formProgress}%</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={formProgress} 
                        className="h-2 bg-[#2a3343] cosmic-progress" 
                      />
                      
                      {/* NEW: Mission Tracker Star (Progress Marker) */}
                      <div 
                        className="mission-tracker-star"
                        style={{
                          left: `${progressStarPos.x}%`,
                          top: `${progressStarPos.y}px`,
                          opacity: formProgress > 0 ? 1 : 0
                        }}
                      >
                        ✨
                      </div>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    {/* NEW: Habit Launch Button with Countdown Glow */}
                    <Button 
                      type="submit"
                      disabled={formProgress < 100 || isGenerating}
                      className={`w-full relative overflow-hidden group launch-button ${
                        formProgress === 100 && !isGenerating
                          ? "active"
                          : ""
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <span className="animate-pulse">Launching Your Habit Mission</span>
                          <div className="launch-flames">
                            <span className="flame">🔥</span>
                            <span className="flame">🔥</span>
                            <span className="flame">🔥</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span>{formProgress === 100 ? "Launch Habit Mission" : `Complete Your Mission Details (${formProgress}%)`}</span>
                          <span className="button-glow"></span>
                        </>
                      )}
                    </Button>
                    
                    {/* Particle burst on submit */}
                    <AnimatePresence>
                      {showParticleBurst && (
                        <div className="particle-container">
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={`particle-${i}`}
                              className="particle"
                              initial={{ 
                                x: 0, 
                                y: 0, 
                                opacity: 1,
                                scale: Math.random() * 0.5 + 0.5
                              }}
                              animate={{ 
                                x: (Math.random() - 0.5) * 200, 
                                y: (Math.random() - 0.5) * 200, 
                                opacity: 0,
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: Math.random() * 1 + 1 }}
                              style={{
                                backgroundColor: i % 2 === 0 ? "#4ADEDE" : "#7F5AF0",
                                width: `${Math.random() * 8 + 4}px`,
                                height: `${Math.random() * 8 + 4}px`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Companion Character */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="fixed bottom-8 right-8 md:block hidden"
          >
            <div className="bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] p-0.5 rounded-lg">
              <div className="bg-[#1a2332]/90 p-4 rounded-lg max-w-xs">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Habit Assistant</p>
                    <p className="text-sm text-gray-300 mt-1">Starting small is the key! Try committing to just 2 minutes per day and build from there.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CSS for cosmic animations and styling */}
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
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        /* NEW: Animated constellation paths */
        @keyframes dashMotion {
          to { stroke-dashoffset: 0; }
        }
        
        /* NEW: Habit node star pulse */
        @keyframes starPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.6); opacity: 1; }
        }
        
        /* NEW: Launch button pulse */
        @keyframes launchPulse {
          0% { box-shadow: 0 0 0 0 rgba(127, 90, 240, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(127, 90, 240, 0); }
          100% { box-shadow: 0 0 0 0 rgba(127, 90, 240, 0); }
        }
        
        /* NEW: Growth rings ripple */
        @keyframes ripple {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        
        /* NEW: Flame animation for launch */
        @keyframes flameWobble {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes flameFade {
          0% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(20px) scale(0.5); }
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
        
        @keyframes stars {
          0% { background-position: 0 0; }
          100% { background-position: 100% 100%; }
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
        
        /* NEW: Orbit paths SVG */
        .orbit-paths-svg {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        
        .animated-path {
          filter: drop-shadow(0 0 3px rgba(74, 222, 222, 0.4));
        }
        
        /* NEW: Habit nodes (stars) */
        .habit-nodes-container {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        
        .habit-node {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at center, #fff, #4ADEDE);
          filter: drop-shadow(0 0 3px #4ADEDE);
          opacity: 0.3;
          animation: starPulse 6s ease-in-out infinite;
          animation-delay: calc(var(--i) * 1.5s);
        }
        
        .habit-node.active-pulse {
          animation: starPulse 2s ease-in-out;
          opacity: 1;
          z-index: 2;
        }
        
        /* NEW: Growth rings */
        .growth-rings-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
          pointer-events: none;
        }
        
        .growth-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 300px;
          height: 300px;
          border: 1px solid rgba(74, 222, 222, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: ripple 8s ease-out infinite;
          opacity: 0;
        }
        
        /* Starfield layers (subtle) */
        .stars-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-repeat: repeat;
          opacity: 0.3;
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
        
        /* Card container with relative positioning for growth rings */
        .card-container {
          position: relative;
          z-index: 2;
        }
        
        .cosmic-card {
          background-color: rgba(19, 20, 41, 0.8);
          border: 1px solid rgba(42, 51, 67, 0.8);
          backdrop-filter: blur(10px);
          transition: all 0.4s ease;
          box-shadow: 0 0 15px rgba(74, 222, 222, 0.2), 0 0 30px rgba(127, 90, 240, 0.1);
          position: relative;
          overflow: hidden;
          z-index: 2;
        }
        
        .cosmic-card:hover {
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
          height: 6px;
          background-color: #2a3343;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .cosmic-progress > div {
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
          box-shadow: 0 0 10px #4ADEDE, 0 0 20px rgba(127, 90, 240, 0.5);
        }
        
        /* NEW: Mission tracker star */
        .mission-tracker-star {
          position: absolute;
          font-size: 16px;
          filter: drop-shadow(0 0 3px #4ADEDE);
          transition: all 0.5s ease;
          transform: translateY(-50%);
        }
        
        /* NEW: Launch button with countdown pulse */
        .launch-button {
          background: #2a3343;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          text-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
        }
        
        .launch-button.active {
          background: linear-gradient(90deg, #4ADEDE, #7F5AF0);
          animation: launchPulse 1.5s infinite;
        }
        
        .launch-button.active:hover {
          box-shadow: 0 0 15px #4ADEDE, 0 0 30px rgba(127, 90, 240, 0.7);
        }
        
        /* NEW: Launch flames */
        .launch-flames {
          position: absolute;
          bottom: -15px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        
        .flame {
          font-size: 22px;
          animation: flameWobble 0.5s ease-in-out infinite alternate, 
                     flameFade 2s ease-in-out infinite;
        }
        
        .flame:nth-child(2) {
          animation-delay: 0.1s;
          font-size: 26px;
        }
        
        .flame:nth-child(3) {
          animation-delay: 0.2s;
        }
        
        .button-glow {
          position: absolute;
          inset: 0;
          background: transparent;
          opacity: 0;
          z-index: -1;
        }
        
        .launch-button.active .button-glow {
          opacity: 1;
          animation: buttonGlow 2s infinite;
        }
        
        /* Particle burst effect */
        .particle-container {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          z-index: 10;
          pointer-events: none;
        }
        
        .particle {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 0 4px currentColor);
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
        
        .glow-icon {
          filter: drop-shadow(0 0 3px #4ADEDE);
          animation: glow 3s infinite;
        }
        
        .glow-icon-sm {
          filter: drop-shadow(0 0 2px #4ADEDE);
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
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-in-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  )
}