"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { MainLayout } from "../../components/main-layout"
import { Textarea } from "../../components/ui/textarea"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Rocket, Droplet, Timer, Flame, BookOpen, Zap } from 'lucide-react'
import { cn } from "../../lib/utils"
import { useToast } from "../../components/ui/use-toast"
import { motion } from "framer-motion"

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
  const { toast } = useToast()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Import the XP_VALUES from lib/xp-system
      const { XP_VALUES } = await import("../../lib/xp-system")

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

    } catch (error) {
      console.error("Error creating habit:", error)
      toast({
        title: "Mission Failed",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout>
      {/* Animated cosmic background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#020617]"></div>
        <div className="stars-container">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
      </div>

      <div className="mb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-white"
        >
          Habit Creation
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400"
        >
          Create new habits to track and launch your personal growth
        </motion.p>
      </div>

      {/* XP Badge */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="mb-6 flex items-center justify-center"
      >
        <div className="bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] p-0.5 rounded-lg">
          <div className="bg-[#1a2332]/90 px-4 py-2 rounded-lg flex items-center">
            <Zap className="w-5 h-5 mr-2 text-[#4cc9f0]" />
            <span className="text-white font-medium">Earn +30 XP by completing this habit!</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card className="bg-[#1a2332]/80 backdrop-blur-sm border-[#2a3343] shadow-xl relative overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#4cc9f0] to-[#4361ee]" style={{ width: `${formProgress}%` }}></div>
          
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-white flex items-center">
                <Rocket className="w-5 h-5 mr-2 text-[#4cc9f0]" />
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
                <Label htmlFor="habit-name" className="text-white flex items-center">
                  <Rocket className="w-4 h-4 mr-2 text-[#4cc9f0]" />
                  Habit Name
                </Label>
                <div className="relative">
                  <Input
                    id="habit-name"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    placeholder={habitSuggestions[currentSuggestion].text}
                    className="bg-[#2a3343] border-[#3a4353] text-white transition-all hover:border-[#4cc9f0] focus:border-[#4cc9f0] focus:ring-[#4cc9f0]/20 focus:ring-2"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4cc9f0]">
                    {habitSuggestions[currentSuggestion].icon}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="habit-description" className="text-white flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-[#4cc9f0]" />
                  Description
                </Label>
                <Textarea
                  id="habit-description"
                  value={habitDescription}
                  onChange={(e) => setHabitDescription(e.target.value)}
                  placeholder="Describe your habit journey..."
                  className="bg-[#2a3343] border-[#3a4353] text-white min-h-[100px] transition-all hover:border-[#4cc9f0] focus:border-[#4cc9f0] focus:ring-[#4cc9f0]/20 focus:ring-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-[#4cc9f0]" />
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#2a3343] border-[#3a4353] text-white hover:border-[#4cc9f0] hover:bg-[#2a3343]/80 transition-all",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[#4cc9f0]" />
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
                  <Label className="text-white flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-[#4cc9f0]" />
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#2a3343] border-[#3a4353] text-white hover:border-[#4cc9f0] hover:bg-[#2a3343]/80 transition-all",
                          !endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[#4cc9f0]" />
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
                <Label className="text-white flex items-center">
                  <Timer className="w-4 h-4 mr-2 text-[#4cc9f0]" />
                  Frequency
                </Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="bg-[#2a3343] border-[#3a4353] text-white hover:border-[#4cc9f0] focus:border-[#4cc9f0] transition-all">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3343] text-white">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-[#4cc9f0]" />
                  Reminder
                </Label>
                <RadioGroup value={reminder} onValueChange={setReminder} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="reminder-yes" className="text-[#4cc9f0]" />
                    <Label htmlFor="reminder-yes" className="text-white">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="reminder-no" className="text-[#4cc9f0]" />
                    <Label htmlFor="reminder-no" className="text-white">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="text-center text-sm text-gray-400 italic my-4">
                "{motivationalQuotes[currentQuote]}"
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="w-full bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] hover:from-[#4cc9f0]/90 hover:to-[#4361ee]/90 text-black font-medium shadow-lg shadow-[#4cc9f0]/20 border-0"
                  type="submit"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch Habit Mission
                </Button>
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
        <div className="bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] p-0.5 rounded-lg">
          <div className="bg-[#1a2332]/90 p-4 rounded-lg max-w-xs">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] flex items-center justify-center">
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

      {/* Add CSS for animated starfield */}
      <style jsx global>{`
        .stars-container {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        @keyframes animateStars {
          from { transform: translateY(0); }
          to { transform: translateY(2000px); }
        }
        
        .stars, .stars2, .stars3 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: block;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          opacity: 0.2;
          animation: animateStars 150s linear infinite;
        }
        
        .stars2 {
          background-image: 
            radial-gradient(1px 1px at 25px 5px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 80px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 125px 20px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 190px 130px, #ddd, rgba(0,0,0,0));
          background-size: 300px 300px;
          animation-duration: 200s;
        }
        
        .stars3 {
          background-image: 
            radial-gradient(1px 1px at 10px 10px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 150px 150px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 60px 170px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 175px 180px, #fff, rgba(0,0,0,0));
          background-size: 250px 250px;
          animation-duration: 175s;
          animation-delay: -25s;
        }
      `}</style>
    </MainLayout>
  )
}