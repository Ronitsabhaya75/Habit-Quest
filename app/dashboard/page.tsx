"use client"
 
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useAuth } from "../../context/auth-context"
import { LogOut, Search, RefreshCw } from "lucide-react"
import AIChat from "../../components/AIChat.jsx"
import { TodaysTasks } from "../../components/todays-tasks"
 
// Define types for tasks and notifications
type Task = {
  id: number | string
  title: string
  completed: boolean
  isHabit?: boolean
  estimatedTime?: number
  isEditing?: boolean
}
 
type Notification = {
  id: number
  message: string
  actions: { label: string; onClick: () => void }[]
}
 
// Type definitions for cosmic background elements
interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
  color: string
  depth: number
}
 
interface Nebula {
  x: number
  y: number
  width: number
  height: number
  opacity: number
  color1: string
  color2: string
  drift: {
    x: number
    y: number
  }
  rotation: number
}
 
interface Galaxy {
  x: number
  y: number
  radius: number
  color: string
  rotation: number
  rotationSpeed: number
  opacity: number
}
 
interface ShootingStar {
  id: number
  x: number
  y: number
  length: number
  angle: number
  speed: number
  progress: number
  opacity: number
  fadeIn: boolean
  delay?: number
}
 
// Chart data type
type ChartDataPoint = {
  day: string
  progress: number
}
 
// Leaderboard entry type
type LeaderboardEntry = {
  username?: string
  name?: string
  xp: number
  isCurrentUser?: boolean
}
 
// Achievement type
type Achievement = {
  id: number
  title: string
  description: string
  earned: boolean
}
 
export default function Dashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState("")
  const [showInput, setShowInput] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [chartType, setChartType] = useState("line")
  const [streak, setStreak] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [timeAllocation, setTimeAllocation] = useState("")
  const [activeSection, setActiveSection] = useState("dashboard")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [performanceMode, setPerformanceMode] = useState('auto')
  const [quality, setQuality] = useState('high')
 
  // Cosmic background state with proper types
  const [stars, setStars] = useState<Star[]>([])
  const [nebulae, setNebulae] = useState<Nebula[]>([])
  const [galaxies, setGalaxies] = useState<Galaxy[]>([])
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([])
 
  // Calculate derived values from totalXP
  const currentLevel = Math.floor(totalXP / 100) + 1
  const levelProgress = totalXP % 100
  const streakPercentage = Math.min((streak / 14) * 100, 100)
 
  // Detect device capabilities and set appropriate performance mode
  useEffect(() => {
    // Auto-detect performance capabilities
    if (performanceMode === 'auto') {
      const isLowPowered = window.navigator.hardwareConcurrency <= 4 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setQuality(isLowPowered ? 'low' : 'high');
    } else {
      setQuality(performanceMode);
    }
  }, [performanceMode]);
 
  // Add notification with animation and auto-dismissal
  const addNotification = useCallback((message: string, actions: { label: string; onClick: () => void }[] = []) => {
    const newNotification: Notification = { id: Date.now(), message, actions }
    setNotifications((prev) => [...prev, newNotification])
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id)), 5000)
  }, [])
 
  // Enhanced achievements with more visual appeal - set all to not earned by default for new users
  const achievements: Achievement[] = [
    { id: 1, title: "First Week Streak", description: "Completed 7 days of habits", earned: false },
    { id: 2, title: "Milestone 100 XP", description: "Reached 100 XP points", earned: false },
    { id: 3, title: "Habit Master", description: "Completed 3 habits consistently", earned: false },
    {
      id: 4,
      title: "Task Champion",
      description: "Completed 5 tasks in a day",
      earned: false,
    },
    { id: 5, title: "Early Bird", description: "Complete tasks before 9am", earned: false },
    { id: 6, title: "Game Player", description: "Played mini-games", earned: false },
    { id: 7, title: "Badge Collector", description: "Purchased badges from shop", earned: false },
    {
      id: 8,
      title: "Perfect Week",
      description: "Complete all scheduled tasks for 7 days",
      earned: false,
    },
    { id: 9, title: "Fitness Enthusiast", description: "Track fitness activities", earned: false },
    { id: 10, title: "Productivity Master", description: "Reached level 5", earned: false },
  ]
 
  // OPTIMIZED CANVAS-BASED SPACE BACKGROUND
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
   
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
   
    // Set canvas to full window size with pixel ratio adjustment for sharpness
    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(pixelRatio, pixelRatio);
    };
   
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
   
    // Define space objects based on quality setting
    const starCount = quality === 'high' ? 2000 : quality === 'medium' ? 1000 : 500;
    const nebulaCount = quality === 'high' ? 5 : quality === 'medium' ? 3 : 1;
    const galaxyCount = quality === 'high' ? 5 : quality === 'medium' ? 2 : 1;
    const shootingStarInterval = quality === 'high' ? 30000 : 60000; // ms between shooting stars
    const enableParallax = quality !== 'low';
   
    // Generate stars with variety
    const generateStars = (): Star[] => {
      const stars: Star[] = [];
      const starColors = ['#FFFFFF', '#B3D4FF', '#C4E0FF'];
     
      for (let i = 0; i < starCount; i++) {
        const size = Math.random() * 1.7 + 0.5; // 0.5-2.2px
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: size,
          opacity: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.01 + 0.003,
          twinklePhase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          depth: size > 1.7 ? 3 : size > 1.2 ? 2 : 1, // Depth for parallax effect
        });
      }
     
      return stars;
    };
   
    // Generate nebulae
    const generateNebulae = (): Nebula[] => {
      const nebulae: Nebula[] = [];
      const nebulaColors = [
        ['#9C6BFF', '#6EE7FF'], // Purple to teal
        ['#A17CF3', '#64B4FF'], // Purple to blue
        ['#8CF8FF', '#A17CF3']  // Aqua to purple
      ];
     
      for (let i = 0; i < nebulaCount; i++) {
        const colorPair = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
        nebulae.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          width: Math.random() * (window.innerWidth * 0.4) + (window.innerWidth * 0.2),
          height: Math.random() * (window.innerHeight * 0.3) + (window.innerHeight * 0.15),
          opacity: Math.random() * 0.06 + 0.02, // Very transparent
          color1: colorPair[0],
          color2: colorPair[1],
          drift: {
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.1
          },
          rotation: Math.random() * Math.PI
        });
      }
     
      return nebulae;
    };
   
    // Generate galaxies
    const generateGalaxies = (): Galaxy[] => {
      const galaxies: Galaxy[] = [];
      const galaxyColors = ['#A17CF3', '#8CF8FF'];
     
      for (let i = 0; i < galaxyCount; i++) {
        galaxies.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: Math.random() * 80 + 50,
          color: galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 0.00005) + 0.00002, // Very slow rotation
          opacity: Math.random() * 0.15 + 0.05
        });
      }
     
      return galaxies;
    };
   
    // Initialize cosmic elements
    const starsArray = generateStars();
    const nebulaeArray = generateNebulae();
    const galaxiesArray = generateGalaxies();
    const shootingStarsArray: ShootingStar[] = [];
   
    // Update state for debugging/reference
    setStars(starsArray);
    setNebulae(nebulaeArray);
    setGalaxies(galaxiesArray);
    setShootingStars(shootingStarsArray);
   
    // Add shooting star function
    const addShootingStar = (): void => {
      if (shootingStarsArray.length < (quality === 'high' ? 2 : 1)) { // Limit concurrent stars
        const newStar: ShootingStar = {
          id: Date.now(),
          x: Math.random() * window.innerWidth * 0.3,
          y: Math.random() * window.innerHeight * 0.3,
          length: Math.random() * 150 + 100,
          angle: Math.PI / 4, // 45 degrees
          speed: Math.random() * 2 + 3,
          progress: 0,
          opacity: 0,
          fadeIn: true
        };
       
        shootingStarsArray.push(newStar);
        setShootingStars([...shootingStarsArray]);
      }
    };
   
    // Initial shooting star
    if (quality !== 'low') {
      setTimeout(addShootingStar, 5000);
    }
   
    // Set interval for new shooting stars
    const shootingStarTimer = quality !== 'low'
      ? setInterval(addShootingStar, shootingStarInterval)
      : null;
   
    // Mouse position for parallax
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
   
    const handleMouseMove = (e: MouseEvent): void => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
   
    if (enableParallax) {
      window.addEventListener('mousemove', handleMouseMove);
    }
   
    // Main animation function - optimized for performance
    let lastFrame = 0;
    const animate = (timestamp: number): void => {
      // Calculate delta time for smoother animation
      const deltaTime = timestamp - lastFrame;
      lastFrame = timestamp;
     
      // Clear canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
     
      // Calculate parallax center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const offsetX = enableParallax ? (mouseX - centerX) / centerX : 0;
      const offsetY = enableParallax ? (mouseY - centerY) / centerY : 0;
     
      // Draw galaxies (furthest layer)
      galaxiesArray.forEach(galaxy => {
        // Rotate galaxy very slowly
        galaxy.rotation += galaxy.rotationSpeed * deltaTime;
       
        // Apply slight parallax
        const parallaxX = enableParallax ? offsetX * -5 : 0;
        const parallaxY = enableParallax ? offsetY * -5 : 0;
       
        // Create galaxy gradient
        ctx.save();
        ctx.translate(galaxy.x + parallaxX, galaxy.y + parallaxY);
        ctx.rotate(galaxy.rotation);
       
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.radius);
        gradient.addColorStop(0, `${galaxy.color}22`);
        gradient.addColorStop(0.5, `${galaxy.color}11`);
        gradient.addColorStop(1, 'transparent');
       
        ctx.globalAlpha = galaxy.opacity;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, galaxy.radius, 0, Math.PI * 2);
        ctx.fill();
       
        // Simple spiral arms
        if (quality !== 'low') {
          for (let arm = 0; arm < 2; arm++) {
            ctx.beginPath();
            ctx.strokeStyle = `${galaxy.color}22`;
            ctx.lineWidth = 1;
           
            for (let r = 0; r < galaxy.radius; r += galaxy.radius / 20) {
              const angle = (r / (galaxy.radius / 4)) + (Math.PI * arm);
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
             
              if (r === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
          }
        }
       
        ctx.restore();
      });
     
      // Draw nebulae
      nebulaeArray.forEach(nebula => {
        // Move nebulae very slowly
        nebula.x += nebula.drift.x * (deltaTime / 16);
        nebula.y += nebula.drift.y * (deltaTime / 16);
       
        // Wrap around edges
        if (nebula.x < -nebula.width) nebula.x = window.innerWidth + nebula.width/2;
        if (nebula.x > window.innerWidth + nebula.width) nebula.x = -nebula.width/2;
        if (nebula.y < -nebula.height) nebula.y = window.innerHeight + nebula.height/2;
        if (nebula.y > window.innerHeight + nebula.height) nebula.y = -nebula.height/2;
       
        // Apply parallax
        const parallaxX = enableParallax ? offsetX * -10 : 0;
        const parallaxY = enableParallax ? offsetY * -10 : 0;
       
        ctx.save();
        ctx.translate(nebula.x + parallaxX, nebula.y + parallaxY);
        ctx.rotate(nebula.rotation);
       
        // Create gradient
        const gradient = ctx.createRadialGradient(
          0, 0, 0,
          0, 0, Math.max(nebula.width, nebula.height) / 2
        );
        gradient.addColorStop(0, `${nebula.color1}22`);
        gradient.addColorStop(0.5, `${nebula.color2}11`);
        gradient.addColorStop(1, 'transparent');
       
        ctx.globalAlpha = nebula.opacity;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, nebula.width/2, nebula.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
     
      // Draw stars with twinkling
      starsArray.forEach(star => {
        star.twinklePhase += star.twinkleSpeed * (deltaTime / 16);
       
        // Calculate parallax based on star depth
        const parallaxX = enableParallax ? offsetX * -star.depth * 5 : 0;
        const parallaxY = enableParallax ? offsetY * -star.depth * 5 : 0;
       
        // Calculate twinkling opacity
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
       
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity * twinkle;
        ctx.beginPath();
        ctx.arc(
          star.x + parallaxX,
          star.y + parallaxY,
          star.radius * (enableParallax ? (twinkle * 0.2 + 0.8) : 1), // Slight size variation for twinkling
          0,
          Math.PI * 2
        );
        ctx.fill();
       
        // Add glow to larger stars
        if (star.radius > 1.5 && quality === 'high') {
          const glow = ctx.createRadialGradient(
            star.x + parallaxX,
            star.y + parallaxY,
            0,
            star.x + parallaxX,
            star.y + parallaxY,
            star.radius * 4
          );
          glow.addColorStop(0, star.color === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : 'rgba(179,212,255,0.3)');
          glow.addColorStop(1, 'transparent');
         
          ctx.fillStyle = glow;
          ctx.globalAlpha = star.opacity * twinkle * 0.5;
          ctx.beginPath();
          ctx.arc(star.x + parallaxX, star.y + parallaxY, star.radius * 4, 0, Math.PI * 2);
          ctx.fill();
        }
       
        ctx.globalAlpha = 1;
      });
     
      // Draw shooting stars
      if (quality !== 'low') {
        // Create a temporary array to track stars to remove
        const starsToRemove: number[] = [];
       
        shootingStarsArray.forEach((star, index) => {
          // Update shooting star position
          star.progress += star.speed * (deltaTime / 16);
         
          // Calculate current position
          const endX = star.x + Math.cos(star.angle) * star.progress;
          const endY = star.y + Math.sin(star.angle) * star.progress;
         
          // Handle opacity transitions
          if (star.fadeIn && star.opacity < 1) {
            star.opacity += 0.05;
            if (star.opacity >= 1) star.fadeIn = false;
          }
         
          // Remove if off screen
          if (endX > window.innerWidth || endY > window.innerHeight) {
            starsToRemove.push(index);
            return;
          }
         
          // Draw shooting star with gradient tail
          ctx.save();
         
          // Create gradient for the tail
          const gradient = ctx.createLinearGradient(
            star.x, star.y,
            endX, endY
          );
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(0.3, `rgba(255,255,255,${star.opacity * 0.3})`);
          gradient.addColorStop(1, `rgba(255,255,255,${star.opacity})`);
         
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
         
          // Draw the tail
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
         
          // Draw the bright head
          ctx.beginPath();
          ctx.arc(endX, endY, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.globalAlpha = star.opacity;
         
          if (quality === 'high') {
            ctx.shadowColor = 'rgba(179,212,255,0.8)';
            ctx.shadowBlur = 10;
          }
         
          ctx.fill();
          ctx.restore();
        });
       
        // Remove stars that are offscreen (in reverse order to avoid index issues)
        if (starsToRemove.length > 0) {
          for (let i = starsToRemove.length - 1; i >= 0; i--) {
            shootingStarsArray.splice(starsToRemove[i], 1);
          }
          setShootingStars([...shootingStarsArray]);
        }
      }
     
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
   
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
   
    // Cleanup function
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (enableParallax) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (shootingStarTimer) {
        clearInterval(shootingStarTimer);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [quality]); // Only re-create the animation when quality changes
 
  // Add a function to fetch the user profile with XP and streak
  const fetchUserProfile = useCallback(async () => {
    try {
      // Use the user profile API endpoint
      const res = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store" // Ensure fresh data
      })
 
      if (!res.ok) {
        throw new Error(`Failed to fetch user profile: ${res.status}`)
      }
 
      const data = await res.json()
     
      if (data.success && data.data) {
        // Update XP and streak from the user profile
        setTotalXP(data.data.xp || 0)
        setStreak(data.data.streak || 0)
      } else {
        throw new Error(data.message || "Failed to fetch user profile")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }, [])
 
  const fetchUserProgress = useCallback(async () => {
    setLoading(true)
 
    try {
      // Use the real API endpoint for performance data
      const res = await fetch("/api/stats/performance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store" // Ensure fresh data
      })
 
      if (!res.ok) {
        throw new Error(`Failed to fetch performance data: ${res.status}`)
      }
 
      const data = await res.json()
     
      if (data.success) {
        // For new users with no data, show empty state
        if (data.data && data.data.length > 0) {
          // Format the data for the chart
          const formattedData = data.data.map((item: any) => ({
            day: item.day,
            progress: item.xp // Use the xp value as progress
          }))
         
          setChartData(formattedData)
        } else {
          // No data yet - show empty state
          setChartData([])
        }
      } else {
        throw new Error(data.message || "Failed to fetch performance data")
      }
    } catch (error) {
      console.error("Error fetching progress data:", error)
     
      // For new users, show empty state
      setChartData([])
    } finally {
      setLoading(false)
    }
  }, [])
 
  const fetchLeaderboard = useCallback(async () => {
    try {
      // Use the real API endpoint for leaderboard data
      const res = await fetch("/api/users/leaderboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store" // Ensure fresh data
      })
 
      if (!res.ok) {
        throw new Error(`Failed to fetch leaderboard data: ${res.status}`)
      }
 
      const data = await res.json()
     
      if (data.success) {
        // Validate data exists and is an array
        if (!data.data || !Array.isArray(data.data)) {
          setLeaderboard([])
          return
        }
       
        // Map the API response to the leaderboard format needed for the UI
        // Take the top 5 users
        let leaderboardData = data.data.slice(0, 5).map((entry: any) => ({
          username: entry.username,
          name: entry.name,
          xp: entry.xp,
          isCurrentUser: entry.isCurrentUser
        }))
       
        // If the current user is not in the top 5, add a note about their position
        if (!leaderboardData.some((entry: { isCurrentUser?: boolean }) => entry.isCurrentUser)) {
          addNotification(`You're not in the top 5 yet. Keep earning XP!`)
        }
       
        setLeaderboard(leaderboardData)
      } else {
        // No successful response, show empty state
        setLeaderboard([])
        throw new Error(data.message || "Failed to fetch leaderboard data")
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
     
      // Show empty state instead of mock data
      setLeaderboard([])
    }
  }, [addNotification])
 
  // Fetch user tasks from API - with debouncing to reduce load
  const fetchUserTasks = useCallback(async () => {
    try {
      // Call the tasks API endpoint
      const res = await fetch("/api/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store"
      })
 
      if (!res.ok) {
        throw new Error(`Failed to fetch tasks: ${res.status}`)
      }
 
      const data = await res.json()
     
      if (data.success) {
        // Map API response to the task format
        const tasksData = data.data.map((task: any) => ({
          id: task.id || task._id,
          title: task.title,
          completed: task.completed,
          isHabit: task.isHabit || false,
          estimatedTime: task.estimatedTime
        }))
       
        setTasks(tasksData)
      } else {
        throw new Error(data.message || "Failed to fetch tasks")
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      // Initialize with empty tasks instead of hardcoded ones
      setTasks([])
    }
  }, [])
 
  // Fetch achievements from API
  const fetchUserAchievements = useCallback(async () => {
    try {
      // Call the achievements API endpoint
      const res = await fetch("/api/achievements", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store"
      })
 
      if (!res.ok) {
        throw new Error(`Failed to fetch achievements: ${res.status}`)
      }
 
      const data = await res.json()
     
      if (data.success && data.data) {
        // Update achievements based on API data
        // Instead of replacing the achievements array, update the earned status
        const updatedAchievements = achievements.map(achievement => {
          const apiAchievement = data.data.find((a: any) => a.id === achievement.id || a.title === achievement.title)
          if (apiAchievement) {
            return {
              ...achievement,
              earned: apiAchievement.earned || apiAchievement.completed
            }
          }
          return achievement
        })
       
        // We're not setting state directly since achievements is already defined in the component
        // If you want to make achievements a state, you'd need to refactor that part
      } else {
        throw new Error(data.message || "Failed to fetch achievements")
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
      // Keep existing achievements definition but don't assume any are earned
    }
  }, [])
 
  // Use a debounced update function for API calls to prevent excessive requests
  const debouncedFetchData = useCallback(() => {
    let timeoutId: NodeJS.Timeout | null = null;
   
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchUserProfile();
        fetchLeaderboard();
        fetchUserProgress();
        fetchUserTasks();
        fetchUserAchievements();
      }, 300); // 300ms debounce
    };
  }, [fetchUserProfile, fetchLeaderboard, fetchUserProgress, fetchUserTasks, fetchUserAchievements]);
 
  // Update the useEffect to fetch all required data with optimized loading
  useEffect(() => {
    // Stagger the data fetching to prevent all requests at once
    const fetchDataWithStagger = () => {
      fetchUserProfile();
     
      setTimeout(() => {
        fetchUserTasks();
      }, 100);
     
      setTimeout(() => {
        fetchUserProgress();
      }, 200);
     
      setTimeout(() => {
        fetchLeaderboard();
      }, 300);
     
      setTimeout(() => {
        fetchUserAchievements();
      }, 400);
    };
   
    // Initial fetch
    fetchDataWithStagger();
   
    // Set up a reduced refresh interval (every 5 minutes instead of continuous)
    const refreshInterval = setInterval(fetchDataWithStagger, 300000);
   
    // Clean up the interval on unmount
    return () => clearInterval(refreshInterval);
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  // Handle task completion with notification
  const handleTaskCompletion = async (taskId: number | string, completed: boolean) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed }
        }
        return task
      }),
    )
   
    try {
      if (completed) {
        // Task is being completed, update XP
        const xpGain = 10
       
        // Update XP on the server
        const xpResponse = await fetch("/api/users/update-xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xpGain, taskId })
        })
       
        if (xpResponse.ok) {
          const xpData = await xpResponse.json()
          if (xpData.success) {
            // Update local state with new XP and possibly streak
            setTotalXP(xpData.data.xp)
            if (xpData.data.streak) {
              setStreak(xpData.data.streak)
            }
           
            // Show notification
            addNotification(`✅ Task completed! (+${xpGain} XP)`, [
              { label: "Review", onClick: () => router.push("/review") },
            ])
            
            // Refresh data
            fetchUserProgress()
            fetchLeaderboard()
          }
        }
      }
     
      // Update task status on the server regardless of completed state
      await fetch("/api/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          completed
        })
      })
    } catch (err) {
      console.error("Error updating task:", err)
      addNotification("Failed to update task. Please try again.")
    }
  }
 
  // Add a new task (both locally and on the server)
  const handleAddTask = async (title: string) => {
    // Add to local state temporarily with placeholder ID
    const tempId = Date.now()
    const newTask: Task = {
      id: tempId,
      title: title.trim(),
      completed: false,
      isHabit: false
    }
   
    setTasks(prevTasks => [...prevTasks, newTask])
   
    try {
      // Send to server
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          isHabit: false,
          dueDate: new Date().toISOString(), // Add today's date as the due date
        })
      })
     
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Replace temporary task with real one from server
          setTasks(prevTasks => prevTasks.map(task =>
            task.id === tempId ? { ...task, id: data.data._id } : task
          ))
         
          // Add notification
          addNotification(`🌟 New task "${title.trim()}" added!`)
        }
      } else {
        // If failed, remove the temporary task
        setTasks(prevTasks => prevTasks.filter(task => task.id !== tempId))
        addNotification("Failed to create task. Please try again.")
      }
    } catch (err) {
      console.error("Error creating task:", err)
      // If failed, remove the temporary task
      setTasks(prevTasks => prevTasks.filter(task => task.id !== tempId))
      addNotification("Failed to create task. Please try again.")
    }
  }
 
  // Updated keyboard handler for adding tasks
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTask.trim()) {
      handleAddTask(newTask)
      setNewTask("")
      setShowInput(false)
    }
  }
 
  // Delete a task
  const deleteTask = async (taskId: number | string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      // Remove from local state
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId))
     
      try {
        // Delete from server
        const response = await fetch(`/api/tasks/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId })
        })
       
        if (response.ok) {
          addNotification(`Task "${task.title}" deleted`)
        } else {
          // Restore task if server deletion failed
          setTasks(prevTasks => [...prevTasks, task])
          addNotification("Failed to delete task. Please try again.")
        }
      } catch (err) {
        console.error("Error deleting task:", err)
        // Restore task if server deletion failed
        setTasks(prevTasks => [...prevTasks, task])
        addNotification("Failed to delete task. Please try again.")
      }
    }
  }
 
  // Handle task update from AI chatbot
  const handleTaskUpdateFromAI = (taskId: number | string, completed: boolean) => {
    handleTaskCompletion(taskId, completed)
  }
 
  // Add task with date from AI chatbot
  const handleAddTaskWithDate = (date: Date, taskInput: { title: string, completed: boolean }) => {
    // Add to local state temporarily with placeholder ID
    const tempId = Date.now()
    const newTask: Task = {
      id: tempId,
      title: taskInput.title,
      completed: taskInput.completed,
      isHabit: false
    }
   
    setTasks(prevTasks => [...prevTasks, newTask])
   
    // Format date string for display
    const dateStr = date.toDateString() === new Date().toDateString()
      ? "today"
      : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
   
    // Send task to server with the date
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskInput.title,
        isHabit: false,
        completed: taskInput.completed,
        dueDate: date.toISOString()  // Include the date in ISO format
      })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Failed to create task");
    })
    .then(data => {
      if (data.success) {
        // Replace temporary task with real one from server
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === tempId ? { ...task, id: data.data._id } : task
        ));
        addNotification(`🆕 New task "${taskInput.title}" added for ${dateStr}!`);
      }
    })
    .catch(err => {
      console.error("Error creating task with date:", err);
      // Remove temporary task if server creation failed
      setTasks(prevTasks => prevTasks.filter(task => task.id !== tempId));
      addNotification("Failed to create task. Please try again.");
    });
  }
 
  const openTimeAllocationModal = (task: Task) => setSelectedTask(task)
 
  const saveTimeAllocation = () => {
    if (!selectedTask || !timeAllocation) return
 
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === selectedTask.id) {
          return { ...task, estimatedTime: Number.parseInt(timeAllocation, 10) }
        }
        return task
      }),
    )
 
    addNotification(`⏱️ Time allocated for "${selectedTask.title}": ${timeAllocation} minutes`)
    setSelectedTask(null)
    setTimeAllocation("")
  }
 
  // Use effect to focus input when shown
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])
 
  const addTask = () => setShowInput(true)
 
  const handleNavigation = (section: string) => {
    setActiveSection(section)
    if (section !== "dashboard") {
      router.push(`/${section}`)
    }
    setShowMobileMenu(false)
  }
 
  // Render welcome message for the graph when there's no data
  const renderEmptyChartMessage = () => {
    return (
      <div className="h-[200px] flex items-center justify-center flex-col">
        <div className="text-4xl mb-3">📈</div>
        <p className="text-[#7FE9FF] text-base mb-2">No progress data yet</p>
        <p className="text-[#D4EEFF]/70 text-sm">Complete tasks to see your progress!</p>
      </div>
    )
  }
 
  // Render empty leaderboard message
  const renderEmptyLeaderboardMessage = () => {
    return (
      <div className="text-center py-8 flex flex-col items-center">
        <div className="text-4xl mb-3">🏆</div>
        <p className="text-[#7FE9FF] text-base mb-2">Leaderboard data unavailable</p>
        <p className="text-[#D4EEFF]/70 text-sm">Complete tasks to join the rankings!</p>
      </div>
    )
  }
 
  // Override the chart component to ensure it properly displays for new users
  const renderChart = () => {
    // If no data or empty array, always show the empty state
    if (!chartData || chartData.length === 0) {
      return renderEmptyChartMessage()
    }
 
    // Otherwise render the appropriate chart
    return (
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke="#D4EEFF" axisLine={{ stroke: "rgba(212, 238, 255, 0.3)" }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 15, 44, 0.95)",
                  border: "1px solid rgba(127, 233, 255, 0.3)",
                  borderRadius: "8px",
                  color: "#D4EEFF",
                  boxShadow: "0 0 15px rgba(127, 233, 255, 0.15)"
                }}
              />
              <Bar
                dataKey="progress"
                fill="#7FE9FF"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationEasing="ease"
              />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <XAxis dataKey="day" stroke="#D4EEFF" axisLine={{ stroke: "rgba(212, 238, 255, 0.3)" }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 15, 44, 0.95)",
                  border: "1px solid rgba(127, 233, 255, 0.3)",
                  borderRadius: "8px",
                  color: "#D4EEFF",
                  boxShadow: "0 0 15px rgba(127, 233, 255, 0.15)"
                }}
              />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#7FE9FF"
                strokeWidth={3}
                dot={{ fill: "#7FE9FF", strokeWidth: 2, r: 6 }}
                activeDot={{ fill: "#9C6AFF", r: 8, strokeWidth: 0 }}
                animationDuration={1500}
                animationEasing="ease"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }
 
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#050714] via-[#0A0F2C] to-[#1C093E]">
      {/* Optimized Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0"
        style={{ pointerEvents: 'none' }}
      />
 
      {/* Notification System */}
      <div className="fixed top-20 right-5 z-50 flex flex-col gap-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-gradient-to-r from-[#7FE9FF] to-[#9C6AFF] rounded-xl p-4 text-white shadow-lg flex items-center justify-between animate-slideIn relative overflow-hidden"
          >
            <span className="font-medium mr-4">{notification.message}</span>
            <div className="flex gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="px-2 py-1 bg-white/20 rounded-md text-sm hover:bg-white/30 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
            {/* Progress bar for auto-dismiss */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/70 w-full animate-notificationTimer"></div>
          </div>
        ))}
      </div>
 
      {/* Top Navigation Bar - Simplified for performance */}
      <nav className="sticky top-0 left-0 w-full bg-[#050714]/95 backdrop-blur-md shadow-md z-40 h-[70px] flex items-center justify-between px-4 md:px-8 border-b border-[#7FE9FF]/10">
        <div className="flex items-center text-2xl font-bold text-[#7FE9FF] cursor-pointer tracking-wider">
          HabitQuest
        </div>
 
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <ul className="flex gap-6">
            {[
              { path: "dashboard", label: "Dashboard", icon: "👾" },
              { path: "breakthrough-game", label: "Mini Games", icon: "🎮" },
              { path: "calendar", label: "Calendar", icon: "📅" },
              { path: "new-habit", label: "Habit Creation", icon: "✨" },
             { path: "fitnessAssessment", label: "Fitness", icon: "🏋️" },
              { path: "shop", label: "Shop", icon: "🛒" },
              { path: "review", label: "Review", icon: "📊" },
            ].map((item) => (
              <li
                key={item.path}
                className={`flex flex-col items-center px-3 py-2 rounded-md cursor-pointer transition-all relative ${
                  activeSection === item.path
                    ? "text-[#7FE9FF]"
                    : "text-[#AAD8FB] hover:text-[#7FE9FF] hover:-translate-y-1"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs tracking-wide">{item.label}</span>
                {activeSection === item.path && (
                  <div className="absolute bottom-0 left-1/2 w-4/5 h-0.5 bg-gradient-to-r from-[#7FE9FF] to-[#9C6AFF] -translate-x-1/2"></div>
                )}
              </li>
            ))}
          </ul>
        </div>
 
        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search (Desktop only) */}
          <div className="hidden md:flex items-center bg-white/5 rounded-full px-4 py-2 border border-[#7FE9FF]/10 focus-within:bg-white/10 focus-within:border-[#7FE9FF]/30 focus-within:shadow-[0_0_15px_rgba(127,233,255,0.1)] transition-all">
            <Search className="text-[#AAD8FB] mr-2 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none text-[#D4EEFF] text-sm w-32 outline-none placeholder:text-[#D4EEFF]/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
 
          {/* Level Badge */}
          <div className="bg-gradient-to-r from-[#7FE9FF] to-[#9C6AFF] px-4 py-2 rounded-full font-semibold shadow-[0_0_15px_rgba(127,233,255,0.25)] text-white hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(127,233,255,0.3)] transition-all">
            Level {currentLevel}
          </div>
 
          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-[#D4EEFF] text-2xl" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? "✕" : "☰"}
          </button>
        </div>
      </nav>
 
      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-[70px] left-0 w-full bg-[#050714]/95 backdrop-blur-md z-30 shadow-md animate-fadeIn">
          <ul className="flex flex-col w-full">
            {[
              { path: "dashboard", label: "Dashboard", icon: "👾" },
              { path: "breakthrough-game", label: "Mini Games", icon: "🎮" },
              { path: "calendar", label: "Calendar", icon: "📅" },
              { path: "recurring-tasks", label: "Recurring", icon: "🔄" },
              { path: "new-habit", label: "Habit Creation", icon: "✨" },
              { path: "fitnessAssessment", label: "Fitness", icon: "🏋️" },
              { path: "shop", label: "Shop", icon: "🛒" },
              { path: "review", label: "Review", icon: "📊" },
            ].map((item) => (
              <li
                key={item.path}
                className={`flex flex-row items-center gap-4 px-6 py-3 cursor-pointer ${
                  activeSection === item.path
                    ? "bg-[#7FE9FF]/15 border-l-4 border-[#7FE9FF]"
                    : "border-l-4 border-transparent"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[#D4EEFF]">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
 
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 z-10 max-w-7xl mx-auto w-full animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#7FE9FF]/10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#7FE9FF] tracking-wide mb-2 text-shadow-cosmic">
              Welcome{user?.username ? `, ${user.username}` : ""}! <span className="text-[#9C6AFF]">👋</span>
            </h1>
            <p className="text-[#AAD8FB] tracking-wide">
              You have {totalXP} XP total and a {streak}-day streak!
            </p>
          </div>
          <Button
            onClick={() => {
              logout()
              router.push("/login")
            }}
            className="bg-gradient-to-r from-[#7FE9FF] to-[#9C6AFF] text-white border-none py-2 px-6 rounded-xl font-semibold shadow-cosmic hover:-translate-y-1 hover:shadow-cosmic-lg transition-all flex items-center gap-2"
          >
            <LogOut className="h-4 w-4 rotate-180" />
            Logout
          </Button>
        </div>
 
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Overview Card */}
          <Card
            className="bg-[#0A0F2C]/30 border border-[#7FE9FF]/10 backdrop-blur-md shadow-cosmic hover:shadow-cosmic-lg hover:-translate-y-2 hover:border-[#7FE9FF]/20 transition-all lg:col-span-2 animate-fadeIn glass-card"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="text-[#7FE9FF] text-xl border-b border-[#7FE9FF]/10 pb-2 tracking-wide text-shadow-cosmic">
                Progress Overview
              </CardTitle>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartType === "line"
                      ? "bg-[#7FE9FF]/20 text-[#D4EEFF] border border-[#7FE9FF]/60"
                      : "bg-white/5 text-[#D4EEFF]/70 border border-white/10 hover:bg-[#7FE9FF]/10 hover:-translate-y-1"
                  }`}
                  onClick={() => setChartType("line")}
                >
                  Line
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartType === "bar"
                      ? "bg-[#7FE9FF]/20 text-[#D4EEFF] border border-[#7FE9FF]/60"
                      : "bg-white/5 text-[#D4EEFF]/70 border border-white/10 hover:bg-[#7FE9FF]/10 hover:-translate-y-1"
                  }`}
                  onClick={() => setChartType("bar")}
                >
                  Bar
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-[#D4EEFF]/70 border border-white/10 hover:bg-[#7FE9FF]/10 hover:-translate-y-1 transition-all ml-auto"
                  onClick={fetchUserProgress}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#050714]/60 rounded-xl p-6 shadow-inner border border-[#7FE9FF]/10 transition-all hover:border-[#7FE9FF]/20 hover:shadow-cosmic">
                {loading ? renderEmptyChartMessage() : renderChart()}
              </div>
 
              <h3 className="mt-6 text-[#7FE9FF] flex items-center gap-2 font-medium tracking-wide">
                <span className="text-xl">🔥</span> Current Streak: {streak} days
              </h3>
              <div className="w-full bg-[#1C093E]/30 h-2.5 rounded-full overflow-hidden mt-3 mb-5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#7FE9FF] to-[#9C6AFF] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(127,233,255,0.4)]"
                  style={{ width: `${streakPercentage}%` }}
                ></div>
              </div>
              <p className="text-right text-[#AAD8FB] text-sm">
                {streak >= 14 ? "🎉 Streak Maxed!" : `${14 - streak} days to max streak`}
              </p>
            </CardContent>
          </Card>
 
          {/* Leaderboard Card */}
          <Card
            className="bg-[#0A0F2C]/30 border border-[#7FE9FF]/10 backdrop-blur-md shadow-cosmic hover:shadow-cosmic-lg hover:-translate-y-2 hover:border-[#7FE9FF]/20 transition-all animate-fadeIn glass-card"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader>
              <CardTitle className="text-[#7FE9FF] text-xl border-b border-[#7FE9FF]/10 pb-2 tracking-wide text-shadow-cosmic">
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mt-2">
                {leaderboard.length === 0 ? (
                  renderEmptyLeaderboardMessage()
                ) : (
                  leaderboard.map((entry, index) => {
                    // Determine medal or rank display
                    let rankDisplay
                    if (index === 0) {
                      rankDisplay = "🥇"
                    } else if (index === 1) {
                      rankDisplay = "🥈"
                    } else if (index === 2) {
                      rankDisplay = "🥉"
                    } else {
                      // Use a trophy icon instead of numbers for other positions
                      rankDisplay = "🏆"
                    }
 
                    return (
                      <li
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          entry.isCurrentUser
                            ? "bg-[#7FE9FF]/15 border-l-3 border-[#7FE9FF]"
                            : "bg-[#050714]/50 hover:bg-[#1C093E]/70 hover:translate-x-1"
                        } transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg min-w-8 text-center">{rankDisplay}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#D4EEFF] font-medium">
                              {entry.username || entry.name || "User"}
                            </span>
                            {entry.isCurrentUser && (
                              <span className="bg-[#7FE9FF]/20 border border-[#7FE9FF]/40 text-[#7FE9FF] text-xs px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[#7FE9FF] font-bold bg-[#7FE9FF]/10 px-3 py-1 rounded-full">
                          {entry.xp} XP
                        </span>
                      </li>
                    )
                  })
               )}
              </ul>
            </CardContent>
          </Card>
 
          {/* Achievements Card */}
          <Card
            className="bg-[#0A0F2C]/30 border border-[#7FE9FF]/10 backdrop-blur-md shadow-cosmic hover:shadow-cosmic-lg hover:-translate-y-2 hover:border-[#7FE9FF]/20 transition-all animate-fadeIn glass-card"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader>
              <CardTitle className="text-[#7FE9FF] text-xl border-b border-[#7FE9FF]/10 pb-2 tracking-wide text-shadow-cosmic">
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mt-2">
                {achievements
                  .filter((achievement) => showAllAchievements || achievement.earned)
                  .slice(0, 4) // Only show first 4 to reduce DOM elements
                  .map((achievement, index) => (
                    <li
                      key={achievement.id}
                      className={`p-4 rounded-lg ${
                        achievement.earned
                          ? "bg-[#050714]/60 border-l-3 border-[#7FE9FF] opacity-100"
                          : "bg-[#050714]/60 border-l-3 border-transparent opacity-70"
                      } flex justify-between items-center transition-all hover:translate-x-1 hover:bg-[#7FE9FF]/10`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{achievement.earned ? "🏆" : "🔒"}</span>
                        <span className="text-[#D4EEFF] font-medium">{achievement.title}</span>
                      </div>
                      <span className="text-[#D4EEFF]/70 text-sm">{achievement.description}</span>
                    </li>
                  ))}
              </ul>
              <Button
                onClick={() => setShowAllAchievements((prev) => !prev)}
                className="w-full mt-6 bg-gradient-to-r from-[#7FE9FF] to-[#9C6AFF] text-white font-semibold py-2 rounded-lg hover:-translate-y-1 hover:shadow-cosmic transition-all tracking-wide"
              >
                {showAllAchievements ? "Show Earned Only" : "View All Achievements"}
              </Button>
            </CardContent>
          </Card>
 
          {/* Today's Tasks Card */}
          <Card
            className="bg-[#0A0F2C]/30 border border-[#7FE9FF]/10 backdrop-blur-md shadow-cosmic hover:shadow-cosmic-lg hover:-translate-y-2 hover:border-[#7FE9FF]/20 transition-all animate-fadeIn glass-card"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader>
              <CardTitle className="text-[#7FE9FF] text-xl border-b border-[#7FE9FF]/10 pb-2 tracking-wide text-shadow-cosmic flex justify-between items-center">
                <span>Tasks</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const prevDate = new Date(selectedDate);
                      prevDate.setDate(prevDate.getDate() - 1);
                      setSelectedDate(prevDate);
                    }}
                    className="bg-[#7FE9FF]/10 hover:bg-[#7FE9FF]/20 text-[#D4EEFF] p-1 rounded-md"
                  >
                    ◀
                  </button>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="bg-[#050714]/70 border border-[#7FE9FF]/30 text-[#D4EEFF] rounded-md p-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      const nextDate = new Date(selectedDate);
                      nextDate.setDate(nextDate.getDate() + 1);
                      setSelectedDate(nextDate);
                    }}
                    className="bg-[#7FE9FF]/10 hover:bg-[#7FE9FF]/20 text-[#D4EEFF] p-1 rounded-md"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="bg-[#7FE9FF]/20 hover:bg-[#7FE9FF]/30 text-[#D4EEFF] px-2 py-1 rounded-md text-xs"
                  >
                    Today
                  </button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Use the enhanced TodaysTasks component with the selected date */}
              <div className="mt-2">
                <TodaysTasks date={selectedDate} />
              </div>
            </CardContent>
          </Card>
        </div>
       
        {/* Performance Mode Selector */}
        <div className="fixed bottom-4 left-4 z-40">
          <select
            value={performanceMode}
            onChange={(e) => setPerformanceMode(e.target.value)}
            className="bg-[#050714]/70 text-[#7FE9FF] border border-[#7FE9FF]/30 rounded px-2 py-1 text-xs"
          >
            <option value="auto">Quality: Auto-Detect</option>
            <option value="high">Quality: High</option>
            <option value="medium">Quality: Medium</option>
            <option value="low">Quality: Low (Best Performance)</option>
          </select>
        </div>
      </main>
 
      {/* Time Allocation Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-[#050714]/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[#0A0F2C]/90 border border-[#7FE9FF]/30 rounded-2xl p-8 w-[400px] max-w-[90%] shadow-2xl animate-fadeIn glass-card">
            <h3 className="text-[#7FE9FF] text-xl font-semibold mb-6 text-center tracking-wide text-shadow-cosmic">
              Allocate Time for "{selectedTask.title}"
            </h3>
            <Input
              type="number"
              placeholder="Estimated time in minutes"
              value={timeAllocation}
              onChange={(e) => setTimeAllocation(e.target.value)}
              className="w-full p-4 my-4 bg-[#050714]/70 border border-[#7FE9FF]/30 text-[#D4EEFF] rounded-lg focus:border-[#7FE9FF]/60 focus:shadow-[0_0_15px_rgba(127,233,255,0.1)] transition-all text-lg"
            />
            <div className="flex gap-4 mt-6">
              <Button
                onClick={saveTimeAllocation}
                className="flex-1 bg-gradient-to-r from-[#7FE9FF] to-[#9C6AFF] text-white font-semibold py-3 rounded-lg hover:-translate-y-1 hover:shadow-cosmic transition-all tracking-wide"
              >
                Save Time
              </Button>
              <Button
                onClick={() => setSelectedTask(null)}
                className="flex-1 bg-[#FFFFFF]/10 text-[#D4EEFF] font-semibold py-3 rounded-lg hover:-translate-y-1 hover:shadow-cosmic transition-all tracking-wide"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
     )}
 
      {/* AI Chat Component - Load with lower priority */}
      <AIChat
        tasks={tasks}
        onTaskUpdate={handleTaskUpdateFromAI}
        onAddTaskWithDate={handleAddTaskWithDate}
        user={undefined}     
      />
     
      {/* CSS for animation and effects */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
       
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateX(200vw) translateY(200vh); opacity: 0; }
        }
       
        @keyframes nebulaFloat {
          0% { transform: translateX(0); }
          50% { transform: translateX(var(--drift, 20px)); }
          100% { transform: translateX(0); }
        }
       
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
       
        @keyframes slideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
       
        @keyframes notificationTimer {
          from { width: 100%; }
          to { width: 0%; }
        }
       
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
       
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
       
        .animate-notificationTimer {
          animation: notificationTimer 5s linear forwards;
        }
       
        .text-shadow-cosmic {
          text-shadow: 0 0 10px rgba(127, 233, 255, 0.3);
        }
       
        .shadow-cosmic {
          box-shadow: 0 5px 20px -5px rgba(127, 233, 255, 0.15), 0 2px 10px -5px rgba(156, 106, 255, 0.2);
        }
       
        .shadow-cosmic-lg {
          box-shadow: 0 10px 30px -5px rgba(127, 233, 255, 0.15), 0 5px 20px -5px rgba(156, 106, 255, 0.3);
        }
       
        /* Enhanced glass card effect */
        .glass-card {
          background: radial-gradient(circle at top right, rgba(161, 124, 243, 0.05), transparent 70%),
                      radial-gradient(circle at bottom left, rgba(140, 248, 255, 0.05), transparent 70%),
                      linear-gradient(to bottom right, rgba(10, 15, 44, 0.5), rgba(28, 9, 62, 0.3));
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(127, 233, 255, 0.1);
          transition: all 0.3s ease, transform 0.5s ease, box-shadow 0.5s ease;
        }
       
        .glass-card:hover {
          border-color: rgba(127, 233, 255, 0.2);
          box-shadow: 0 8px 32px rgba(127, 233, 255, 0.1), 0 4px 16px rgba(156, 106, 255, 0.1);
        }
      `}</style>
    </div>
  )
}
 