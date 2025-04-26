"use client"

import { useState, useEffect, ReactNode, FC } from "react"
import { Calendar } from "../../components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { format, startOfDay } from "date-fns"
import { useTask } from "../../components/task-context"
import { TaskList } from "../../components/task-list"

// Define types for NavItem props
interface NavItemProps {
  icon: ReactNode;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

// NavItem component with proper typing
const NavItem: FC<NavItemProps> = ({ icon, name, isActive, onClick }) => {
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <div className="text-gray-400 hover:text-white mb-1">
        {icon}
      </div>
      <span className="text-xs text-gray-400 hover:text-white">{name}</span>
      {isActive && (
        <div className="h-1 w-1 bg-[#4cc9f0] rounded-full mt-1"></div>
      )}
    </div>
  )
}

// SVG Icon components
const HomeIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

const GamepadIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"></line>
    <line x1="8" y1="10" x2="8" y2="14"></line>
    <circle cx="15" cy="13" r="1"></circle>
    <circle cx="18" cy="11" r="1"></circle>
    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
  </svg>
)

const CalendarIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)

const PlusIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const FitnessIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
  </svg>
)

const ShopIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
)

const StarIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4cc9f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
)

const SearchIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
)

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showChatbot, setShowChatbot] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Calendar")
  const { addTask, fetchTasks } = useTask()

  // Define the week days for the calendar header
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Refetch tasks when the component mounts or date changes
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleAddTask = async () => {
    if (newTaskTitle.trim() && date) {
      try {
        // Format date for the task
        const taskDate = startOfDay(date);
        
        // Add the task
        await addTask({
          title: newTaskTitle,
          dueDate: taskDate,
          xpReward: 20
        })
        
        // Clear the form and close dialog
        setNewTaskTitle("")
        setAddTaskDialogOpen(false)
        
        // Refetch tasks to ensure our new task shows up
        fetchTasks()
      } catch (error) {
        console.error("Error adding task:", error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Navigation Bar - Exact Match */}
      <header className="bg-[#0f1723] border-b border-[#1a2332] py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 mr-10">
            <h1 className="text-2xl font-bold">
              <span className="text-[#4cc9f0]">Habit</span>
              <span className="text-white">Quest</span>
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 flex justify-center">
            <div className="flex space-x-8">
              <NavItem icon={<HomeIcon />} name="Dashboard" isActive={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
              <NavItem icon={<GamepadIcon />} name="Mini Games" isActive={activeTab === "Mini Games"} onClick={() => setActiveTab("Mini Games")} />
              <NavItem icon={<CalendarIcon />} name="Calendar" isActive={activeTab === "Calendar"} onClick={() => setActiveTab("Calendar")} />
              <NavItem icon={<PlusIcon />} name="Habit Creation" isActive={activeTab === "Habit Creation"} onClick={() => setActiveTab("Habit Creation")} />
              <NavItem icon={<FitnessIcon />} name="Fitness" isActive={activeTab === "Fitness"} onClick={() => setActiveTab("Fitness")} />
              <NavItem icon={<ShopIcon />} name="Shop" isActive={activeTab === "Shop"} onClick={() => setActiveTab("Shop")} />
              <NavItem icon={<StarIcon />} name="Review" isActive={activeTab === "Review"} onClick={() => setActiveTab("Review")} />
            </div>
          </nav>
          
          {/* Search and Level */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon />
              </div>
              <Input
                type="text"
                placeholder="Search..."
                className="w-64 bg-[#1a2332] border-[#2a3343] rounded-full py-1 pl-10 text-sm text-gray-300"
              />
            </div>
            <div className="bg-[#4cc9f0] text-black font-medium py-1 px-4 rounded-full text-sm">
              Level 1
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Calendar Tracker</h1>
          <p className="text-gray-400">Manage your tasks and track your habits</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#1a2332]/80 border-[#2a3343]">
            <CardHeader>
              <CardTitle className="text-xl text-white">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button className="text-gray-400 hover:text-white">&lt;</button>
                <h2 className="text-lg font-medium">
                  {date ? format(date, "MMMM yyyy") : ""}
                </h2>
                <button className="text-gray-400 hover:text-white">&gt;</button>
              </div>
              
              {/* Week Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-sm text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Component */}
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border border-[#2a3343] bg-[#1a2332]"
              />
              
              <div className="mt-4 flex justify-between">
                <Button
                  variant="outline"
                  className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
                  onClick={() => setShowChatbot(!showChatbot)}
                >
                  {showChatbot ? "Hide Chatbot" : "Show Chatbot"}
                </Button>

                <Dialog open={addTaskDialogOpen} onOpenChange={setAddTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">
                      <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1a2332] border-[#2a3343] text-white">
                    <DialogHeader>
                      <DialogTitle>Add New Task for {date ? format(date, "MMM d, yyyy") : ""}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-name">Task Name</Label>
                        <Input 
                          id="task-name"
                          placeholder="Enter task name" 
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="bg-[#2a3343] border-[#3a4353] text-white" 
                        />
                      </div>
                      <Button 
                        className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black"
                        onClick={handleAddTask}
                      >
                        Add Task
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-[#1a2332]/80 border-[#2a3343]">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Tasks for {date ? format(date, "MMMM d, yyyy") : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showChatbot ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-[#2a3343] text-white">
                    <p>Hello! How can I help with your tasks today?</p>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask about your tasks or add a new one..."
                      className="bg-[#2a3343] border-[#3a4353] text-white"
                    />
                    <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">
                      Send
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Use the TaskList component to display tasks for the selected date */}
                  {date && <TaskList date={date} />}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          © 2025 HabitQuest. All rights reserved.
        </footer>
      </main>
    </div>
  )
}