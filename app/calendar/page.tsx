"use client"

import { useState, useEffect, ReactNode, FC, useRef } from "react"
import { Calendar } from "../../components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Plus, Gamepad2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { format, startOfDay, isToday } from "date-fns"
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
    <a href={`/${name.toLowerCase().replace(' ', '-')}`} className="flex flex-col items-center cursor-pointer">
      <div className="text-gray-400 hover:text-white mb-1">
        {icon}
      </div>
      <span className="text-xs text-gray-400 hover:text-white">{name}</span>
      {isActive && (
        <div className="h-1 w-1 bg-[#4cc9f0] rounded-full mt-1"></div>
      )}
    </a>
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

// Constellation background component
const ConstellationBackground: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let points: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      connections: number[];
      opacity: number;
      isPlanet: boolean;
      lastBlink: number;
      blinkInterval: number;
      planetColor: string;
    }> = [];

    // Resize handler for canvas
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initPoints();
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    // Initialize constellation points
    const initPoints = () => {
      const numPoints = Math.floor(canvas.width * canvas.height / 15000); // Adjust density as needed
      points = [];
      
      for (let i = 0; i < numPoints; i++) {
        // Regular stars
        points.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.05, // Slow movement
          vy: (Math.random() - 0.5) * 0.05,
          radius: Math.random() * 1.5 + 0.5, // Varying star sizes
          color: Math.random() > 0.7 ? '#CCE7F6' : '#FFFFFF', // Mix of white and light blue
          connections: [],
          opacity: Math.random() * 0.4 + 0.6, // Varying opacity
          isPlanet: false,
          lastBlink: 0,
          blinkInterval: 0,
          planetColor: ''
        });
      }
      
      // Add a few planets (will blink occasionally)
      const numPlanets = Math.floor(numPoints * 0.01); // 1% of stars are planets
      for (let i = 0; i < numPlanets; i++) {
        const planetColors = ['#FFC107', '#9C27B0', '#FF5722', '#8BC34A', '#03A9F4'];
        points.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.02, // Even slower for planets
          vy: (Math.random() - 0.5) * 0.02,
          radius: Math.random() * 2 + 1.5, // Slightly bigger
          color: '#FFFFFF', // Base color
          connections: [],
          opacity: 0.8,
          isPlanet: true,
          lastBlink: 0,
          blinkInterval: Math.random() * 10000 + 10000, // Blink every 10-20 seconds
          planetColor: planetColors[Math.floor(Math.random() * planetColors.length)]
        });
      }
      
      // Establish connections (constellation lines)
      connectPoints();
    };
    
    // Function to establish connections between points
    const connectPoints = () => {
      // For each point, connect to 2-4 nearby points
      points.forEach((point, i) => {
        if (point.isPlanet) return; // Planets don't form connections
        
        const distances: Array<{index: number, distance: number}> = [];
        
        // Calculate distance to all other points
        points.forEach((otherPoint, j) => {
          if (i !== j && !otherPoint.isPlanet) {
            const dx = point.x - otherPoint.x;
            const dy = point.y - otherPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            distances.push({ index: j, distance });
          }
        });
        
        // Sort by distance
        distances.sort((a, b) => a.distance - b.distance);
        
        // Connect to closest 2-4 points
        const numConnections = Math.floor(Math.random() * 3) + 2; // 2-4 connections
        const maxDist = canvas.width * 0.15; // Max connection distance
        
        for (let j = 0; j < Math.min(numConnections, distances.length); j++) {
          if (distances[j].distance < maxDist) {
            point.connections.push(distances[j].index);
          }
        }
      });
    };
    
    // Draw nebula clouds (subtle background effect)
    const drawNebulaClouds = () => {
      if (!ctx || !canvas) return;
      
      // Create a few nebula clouds
      const numClouds = 5;
      
      ctx.save();
      for (let i = 0; i < numClouds; i++) {
        const x = (canvas.width / numClouds) * i + Math.sin(Date.now() * 0.0001 + i) * 50;
        const y = canvas.height / 2 + Math.cos(Date.now() * 0.0001 + i) * 50;
        const radius = Math.min(canvas.width, canvas.height) * (0.2 + Math.sin(Date.now() * 0.0001 + i * 2) * 0.1);
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const purpleBlue = Math.random() > 0.5 ? '#4B0082' : '#0B0C2A';
        gradient.addColorStop(0, purpleBlue);
        gradient.addColorStop(1, 'rgba(11, 12, 42, 0)');
        
        ctx.globalAlpha = 0.03; // Very subtle
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };
    
    // Main animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = 'rgba(11, 12, 42, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw nebula clouds
      drawNebulaClouds();
      
      // Update and draw stars
      points.forEach((point, i) => {
        // Update position
        point.x += point.vx;
        point.y += point.vy;
        
        // Bounce off edges
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1;
        
        // Mouse interaction (gentle repulsion)
        const dx = point.x - mouseRef.current.x;
        const dy = point.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) { // Mouse influence radius
          const force = 0.2 / distance;
          point.vx += dx * force;
          point.vy += dy * force;
          
          // Limit velocity
          const speed = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
          if (speed > 0.2) {
            point.vx = (point.vx / speed) * 0.2;
            point.vy = (point.vy / speed) * 0.2;
          }
        }
        
        // Draw connections (constellation lines)
        ctx.strokeStyle = 'rgba(74, 222, 222, 0.15)'; // Faint blue glow
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        
        point.connections.forEach(connectionIndex => {
          const connectedPoint = points[connectionIndex];
          const dx = point.x - connectedPoint.x;
          const dy = point.y - connectedPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only draw if points are close enough
          const maxDistance = canvas.width * 0.15;
          if (distance < maxDistance) {
            // Line opacity based on distance
            const opacity = 0.15 * (1 - distance / maxDistance);
            ctx.strokeStyle = `rgba(74, 222, 222, ${opacity})`;
            
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(connectedPoint.x, connectedPoint.y);
            ctx.stroke();
          }
        });
        
        // Draw the point
        if (point.isPlanet) {
          // Handle planet blinking
          const now = Date.now();
          if (now - point.lastBlink > point.blinkInterval) {
            point.opacity = 1; // Briefly brighten
            point.lastBlink = now;
            setTimeout(() => {
              if (points[i]) points[i].opacity = 0.8; // Return to normal
            }, 300);
          }
          
          // Draw planet with glow
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, point.radius * 3
          );
          gradient.addColorStop(0, point.planetColor);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.globalAlpha = point.opacity * 0.7;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.radius * 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw planet core
          ctx.globalAlpha = point.opacity;
          ctx.fillStyle = point.planetColor;
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw star
          ctx.globalAlpha = point.opacity;
          ctx.fillStyle = point.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw subtle glow around stars
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, point.radius * 2
          );
          gradient.addColorStop(0, point.color);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.globalAlpha = point.opacity * 0.3;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.globalAlpha = 1;
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Initialize
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="constellation-background" />;
};

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showChatbot, setShowChatbot] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false)
  const [showTaskAddedAnimation, setShowTaskAddedAnimation] = useState(false)
  const [highlightBeam, setHighlightBeam] = useState(false)
  const { addTask, fetchTasks } = useTask()

  // Define the week days for the calendar header
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Refetch tasks when the date changes or component mounts
  useEffect(() => {
    if (date) {
      // Format the date as YYYY-MM-DD for consistent API querying
      const dateStr = format(date, 'yyyy-MM-dd');
      fetchTasks(dateStr);
    }
  }, [date, fetchTasks]) 

  const handleAddTask = async () => {
    if (newTaskTitle.trim() && date) {
      try {
        // Normalize the date to avoid timezone issues
        const taskDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          12, 0, 0 // Set to noon to avoid date crossing issues
        );
        
        // Format date string in YYYY-MM-DD format for the API
        const dateStr = format(taskDate, 'yyyy-MM-dd');
        console.log("Adding task for date:", dateStr);
        
        // Add the task
        await addTask({
          title: newTaskTitle,
          dueDate: taskDate,
          dueDateString: dateStr,
          xpReward: 20
        })
        
        // Show the animation
        setShowTaskAddedAnimation(true)
        setTimeout(() => setShowTaskAddedAnimation(false), 1500)
        
        // Clear the form and close dialog
        setNewTaskTitle("")
        setAddTaskDialogOpen(false)
        
        // Refetch tasks to ensure our new task shows up
        fetchTasks(dateStr)
      } catch (error) {
        console.error("Error adding task:", error)
      }
    }
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setHighlightBeam(true);
    setTimeout(() => setHighlightBeam(false), 800);
  };

  return (
    <div className="min-h-screen cosmic-main-container relative overflow-hidden">
      {/* Constellation Background */}
      <ConstellationBackground />
      
      {/* Navigation Bar */}
      <header className="bg-[#0f1723]/90 border-b border-[#1a2332] py-4 relative z-10">
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
              <a href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1">
                <HomeIcon />
                <span className="text-xs mt-1">Dashboard</span>
              </a>
              <a href="/breakthrough-game" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1">
                <Gamepad2 size={20} />
                <span className="text-xs mt-1">Mini Games</span>
              </a>
              <a href="/calendar" className="flex flex-col items-center text-[#4ADEDE] border-b-2 border-[#4ADEDE] py-1">
                <CalendarIcon />
                <span className="text-xs mt-1">Calendar</span>
              </a>
              <a href="/habit-creation" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1">
                <PlusIcon />
                <span className="text-xs mt-1">Habit Creation</span>
              </a>
              <a href="/fitness" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1">
                <FitnessIcon />
                <span className="text-xs mt-1">Fitness</span>
              </a>
              <a href="/shop" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1">
                <ShopIcon />
                <span className="text-xs mt-1">Shop</span>
              </a>
              <a href="/review" className="flex flex-col items-center text-gray-400 hover:text-[#4ADEDE] transition-colors py-1">
                <StarIcon />
                <span className="text-xs mt-1">Review</span>
              </a>
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
      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white cosmic-title">Galactic Planner</h1>
          <p className="text-gray-400">Navigate through your missions across the stars</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#1a2332]/80 border-[#2a3343] cosmic-card">
            <CardHeader>
              <CardTitle className="text-xl text-white cosmic-label">Calendar</CardTitle>
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
              
              {/* Calendar Component with Custom Day Renderer */}
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border border-[#2a3343] bg-[#1a2332]/60 cosmic-calendar"
                modifiers={{
                  today: (day) => isToday(day),
                }}
                modifiersClassNames={{
                  today: "cosmic-today",
                }}
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
                    <Button className="cosmic-button bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] hover:opacity-90 text-white">
                      <Plus className="mr-2 h-4 w-4" /> Add Mission
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1a2332] border-[#2a3343] text-white cosmic-dialog">
                    <DialogHeader>
                      <DialogTitle>Add New Mission for {date ? format(date, "MMM d, yyyy") : ""}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-name">Mission Name</Label>
                        <Input 
                          id="task-name"
                          placeholder="Enter mission name" 
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="bg-[#2a3343] border-[#3a4353] text-white" 
                        />
                      </div>
                      <Button 
                        className="w-full cosmic-button bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] hover:opacity-90 text-white"
                        onClick={handleAddTask}
                      >
                        Add Mission
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-[#1a2332]/80 border-[#2a3343] cosmic-card">
            <CardHeader>
              <CardTitle className="text-xl text-white cosmic-label">
                Missions for {date ? format(date, "MMMM d, yyyy") : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {/* Highlight beam animation when selecting a date */}
              {highlightBeam && <div className="highlight-beam-animation"></div>}
              
              {/* Show task added animation */}
              {showTaskAddedAnimation && <div className="task-added-animation"></div>}
              
              {showChatbot ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-[#2a3343] text-white">
                    <p>Hello, cosmic explorer! How can I help with your missions today?</p>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask about your missions or add a new one..."
                      className="bg-[#2a3343] border-[#3a4353] text-white"
                    />
                    <Button className="cosmic-button bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] hover:opacity-90 text-white">
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
        
        <footer className="mt-12 text-center text-gray-500 text-sm relative z-10">
          © 2025 HabitQuest. All rights reserved.
        </footer>
      </main>
      
      <style jsx global>{`
        .cosmic-main-container {
          background: linear-gradient(to bottom, #0B0C2A, #000000);
          min-height: 100vh;
        }
        
        .constellation-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }
        
        .cosmic-title {
          text-shadow: 0 0 10px rgba(76, 201, 240, 0.8);
        }
        
        .cosmic-label {
          text-shadow: 0 0 6px rgba(76, 201, 240, 0.5);
        }
        
        .cosmic-card {
          backdrop-filter: blur(4px);
          transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
          animation: float 6s ease-in-out infinite;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        }
        
        .cosmic-card:hover {
          box-shadow: 0 0 15px rgba(76, 201, 240, 0.5);
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(5px); }
          100% { transform: translateY(0px); }
        }
        
        .cosmic-calendar {
          position: relative;
        }
        
        .cosmic-calendar button:hover {
          background-color: rgba(74, 222, 222, 0.1) !important;
          position: relative;
        }
        
        .cosmic-today {
          position: relative;
        }
        
        .cosmic-today::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(76, 201, 240, 0.5);
          animation: vortex 3s linear infinite;
        }
        
        @keyframes vortex {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
        }
        
        .cosmic-button {
          position: relative;
          overflow: hidden;
        }
        
        .cosmic-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }
        
        .cosmic-button:hover::after {
          transform: translateX(100%);
        }
        
        .cosmic-dialog {
          animation: appear 0.3s ease-out;
          background: rgba(26, 35, 50, 0.85);
          backdrop-filter: blur(10px);
        }
        
        @keyframes appear {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .task-added-animation {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background-color: white;
          box-shadow: 0 0 5px 2px rgba(76, 201, 240, 0.9);
          animation: task-added 1.5s ease-out;
          z-index: 20;
        }
        
        @keyframes task-added {
          0% { 
            width: 3px; 
            height: 3px; 
            opacity: 1; 
          }
          60% { 
            width: 50px; 
            height: 50px; 
            opacity: 0.8; 
          }
          100% { 
            width: 100px; 
            height: 100px; 
            opacity: 0; 
          }
        }
        
        .highlight-beam-animation {
          position: absolute;
          top: 20px;
          left: 0;
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, transparent, #4ADEDE, transparent);
          opacity: 0;
          transform: translateX(50%);
          animation: highlight-beam 0.8s ease-out;
          z-index: 10;
        }
        
        @keyframes highlight-beam {
          0% { 
            opacity: 0;
            transform: translateX(-100%);
          }
          20% { 
            opacity: 0.8;
          }
          100% { 
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}