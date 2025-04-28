"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { 
  ShoppingBag, 
  AlertCircle, 
  Home, 
  GamepadIcon, 
  Calendar, 
  Plus, 
  Activity, 
  Star, 
  Search,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function Shop() {
  const [activeTab, setActiveTab] = useState("all")
  const [userXp, setUserXp] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<any>(null)
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null)
  const [isGlitchActive, setIsGlitchActive] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState<number | null>(null)
  const [animatingPurchase, setAnimatingPurchase] = useState<number | null>(null)
  const [badgeGlintActive, setBadgeGlintActive] = useState<number[]>([])
  const xpRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // Fetch users data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const userData = await response.json()
          if (userData.success) {
            setUserXp(userData.data.xp || 0)
            setUserBadges(userData.data.badges || [])
            setUserLevel(Math.floor((userData.data.xp || 0) / 100) + 1)
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    
    fetchUserData()
  }, [])

  // Generate floating XP orbs
  const generateXpOrbs = () => {
    const orbs = [];
    const orbCount = 5;
    
    for (let i = 0; i < orbCount; i++) {
      const size = Math.random() * 15 + 5;
      const left = Math.random() * 120;
      const duration = Math.random() * 8 + 7;
      const delay = Math.random() * 5;
      
      orbs.push(
        <div 
          key={`orb-${i}`} 
          className="xp-orb absolute" 
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`
          }}
        ></div>
      );
    }
    
    return orbs;
  };

  // Generate XP fireflies
  const generateXpFireflies = () => {
    const fireflies = [];
    const fireflyCount = 30;
    
    for (let i = 0; i < fireflyCount; i++) {
      const size = Math.random() * 4 + 1;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 15;
      const opacity = Math.random() * 0.5 + 0.1;
      
      fireflies.push(
        <div 
          key={`firefly-${i}`} 
          className="xp-firefly" 
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            opacity
          }}
        ></div>
      );
    }
    
    return fireflies;
  };

  const badges = [
    // { id: 1, name: "Early Bird", description: "Complete 5 tasks before 9 AM", price: 100, rarity: "common" },
    { id: 2, name: "Night Owl", description: "Complete 5 tasks after 10 PM", price: 100, rarity: "common" },
    { id: 3, name: "Streak Master", description: "Maintain a 7-day streak", price: 200, rarity: "rare" },
    { id: 4, name: "Game Champion", description: "Win all mini games", price: 300, rarity: "rare" },
    { id: 5, name: "Fitness Guru", description: "Complete a 30-day fitness plan", price: 500, rarity: "rare" },
    { id: 6, name: "Habit Hero", description: "Create and complete 10 habits", price: 500, rarity: "epic" },
    { id: 7, name: "XP Collector", description: "Collect 1000 XP", price: 1000, rarity: "epic" },
    { id: 8, name: "Shopaholic", description: "Purchase 5 badges", price: 2000, rarity: "epic" },
    { id: 9, name: "Master of Badges", description: "Collect all badges", price: 5000, rarity: "epic" },
    { id: 10, name: "Ultimate Achiever", description: "Complete all achievements", price: 10000, rarity: "epic" }

  ]

  const filteredBadges = activeTab === "all" ? badges : badges.filter((badge) => badge.rarity === activeTab)

  // XP glitch effect when insufficient XP
  const triggerXpGlitch = () => {
    setIsGlitchActive(true);
    setTimeout(() => setIsGlitchActive(false), 600);
    
    if (xpRef.current) {
      xpRef.current.classList.add('insufficient-xp');
      setTimeout(() => {
        if (xpRef.current) {
          xpRef.current.classList.remove('insufficient-xp');
        }
      }, 600);
    }
  };

  // Apply name glint effect periodically to random badges
  useEffect(() => {
    const glintInterval = setInterval(() => {
      const randomBadgeId = badges[Math.floor(Math.random() * badges.length)].id;
      setBadgeGlintActive(prev => [...prev, randomBadgeId]);
      setTimeout(() => {
        setBadgeGlintActive(prev => prev.filter(id => id !== randomBadgeId));
      }, 2000);
    }, 4000);
    
    return () => clearInterval(glintInterval);
  }, []);

  // Animation variants for different rarity types
  const getRarityVariants = (rarity: string) => {
    switch(rarity) {
      case 'common':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: i * 0.1,
              duration: 0.5,
              ease: "easeOut"
            }
          })
        };
      
      case 'rare':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: (i: number) => ({
            opacity: 1,
            scale: 1,
            transition: {
              delay: i * 0.1,
              duration: 0.5,
              ease: [0.2, 0.65, 0.3, 0.9]
            }
          })
        };
      
      case 'epic':
        return {
          hidden: { opacity: 0, rotate: -10, scale: 0.9 },
          visible: (i: number) => ({
            opacity: 1,
            rotate: 0,
            scale: 1,
            transition: {
              delay: i * 0.1,
              duration: 0.6,
              ease: "backOut"
            }
          })
        };
      
      default:
        return {
          hidden: { opacity: 0 },
          visible: (i: number) => ({
            opacity: 1,
            transition: { delay: i * 0.1 }
          })
        };
    }
  };

  const handlePurchase = async (badge: any) => {
    setLoading(true)
    
    // Trigger animation
    setAnimatingPurchase(badge.id);
    
    try {
      // Make the API call to purchase the badge
      const response = await fetch('/api/badges/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ badgeId: badge.id }),
      });
      
      const data = await response.json();
      
      // Check if the purchase was successful
      if (response.ok && data.success) {
        // Handle already owned badge
        if (data.data.alreadyOwned) {
          toast.info(`You already own the ${badge.name} badge!`, {
            duration: 3000,
          });
          setUserBadges(prev => {
            // Only add the badge ID if it's not already in the array
            if (!prev.includes(badge.id.toString())) {
              return [...prev, badge.id.toString()];
            }
            return prev;
          });
          setAnimatingPurchase(null);
          setPurchaseDialogOpen(false);
          setLoading(false);
          return;
        }
        
        // Update user XP and badges after animation completes
        setTimeout(() => {
          setUserXp(data.data.userXp);
          
          // Check if we have the MongoDB _id in the response
          if (data.data.badge && data.data.badge._id) {
            setUserBadges(prev => [...prev, data.data.badge._id]);
          } else {
            // Fallback to numeric ID if MongoDB ID is not available
            setUserBadges(prev => [...prev, badge.id.toString()]);
          }
          
          // Trigger purchase success animation
          setPurchaseSuccess(badge.id);
          setTimeout(() => setPurchaseSuccess(null), 2000);
          
          // Show success notification
          toast.success(`🏆 Badge Purchased: ${badge.name}!`, {
            description: `You spent ${badge.price} XP on this badge.`,
            duration: 5000,
          });
          
          // Check for achievement unlock
          const badgeCollectorAchievement = userBadges.length === 0;
          if (badgeCollectorAchievement) {
            // Update achievements
            fetch('/api/achievements/check', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ badgesOwned: userBadges.length + 1 }),
            }).catch(error => console.error('Failed to check achievements:', error));
            
            toast.success(`🏆 Achievement Unlocked: Badge Collector!`, {
              description: 'Purchased your first badge from the shop.',
              duration: 5000,
              icon: '🏆',
            });
          }
          
          setAnimatingPurchase(null);
        }, 1000);
      } else {
        // Show error notification
        toast.error(data.message || 'Failed to purchase badge', {
          duration: 5000,
        });
        setAnimatingPurchase(null);
      }
    } catch (error) {
      console.error('Error purchasing badge:', error);
      toast.error('Failed to purchase badge. Please try again later.', {
        duration: 5000,
      });
      setAnimatingPurchase(null);
    } finally {
      setLoading(false);
      setPurchaseDialogOpen(false);
    }
  }

  const openPurchaseDialog = (badge: any) => {
    if (userXp < badge.price) {
      triggerXpGlitch();
    }
    setSelectedBadge(badge)
    setPurchaseDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0B0C2A] text-white flex flex-col overflow-hidden" ref={pageRef}>
      {/* ======= NAVIGATION BAR START ======= */}
      <nav className="bg-[#070A18] border-b border-[rgba(74,222,222,0.1)] px-6 py-3 relative z-20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-xl font-bold">
              <span className="text-[#4ADEDE] glow-text">Habit</span>
              <span className="text-white">Quest</span>
            </h1>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center justify-center space-x-8">
            <Link href="/dashboard" className="flex flex-col items-center text-[#A0A4B8] hover:text-white transition-colors">
              <Home size={20} />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            <Link href="/breakthrough-game" className="flex flex-col items-center text-[#A0A4B8] hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
                <path d="M21 6H3C1.89543 6 1 6.89543 1 8V16C1 17.1046 1.89543 18 3 18H21C22.1046 18 23 17.1046 23 16V8C23 6.89543 22.1046 6 21 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="14" r="1" fill="currentColor" />
                <circle cx="18" cy="10" r="1" fill="currentColor" />
              </svg>
              <span className="text-xs">Mini Games</span>
            </Link>
            <Link href="/calendar" className="flex flex-col items-center text-[#A0A4B8] hover:text-white transition-colors">
              <Calendar size={20} />
              <span className="text-xs mt-1">Calendar</span>
            </Link>
            <Link href="/habit-creation" className="flex flex-col items-center text-[#A0A4B8] hover:text-white transition-colors">
              <Plus size={20} />
              <span className="text-xs mt-1">Habit Creation</span>
            </Link>
            <Link href="/fitness" className="flex flex-col items-center text-[#A0A4B8] hover:text-white transition-colors">
              <Activity size={20} />
              <span className="text-xs mt-1">Fitness</span>
            </Link>
            <Link href="/shop" className="flex flex-col items-center text-[#4ADEDE] relative">
              <ShoppingBag size={20} />
              <span className="text-xs mt-1">Shop</span>
              <div className="absolute bottom-0 w-full h-0.5 bg-[#4ADEDE] rounded-t-md shadow-[0_0_10px_#4ADEDE]"></div>
            </Link>
            <Link href="/review" className="flex flex-col items-center text-[#A0A4B8] hover:text-white transition-colors">
              <Star size={20} />
              <span className="text-xs mt-1">Review</span>
            </Link>
          </div>
          
          {/* Search & Level */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#A0A4B8]" />
              </div>
              <input 
                type="text" 
                placeholder="Search..." 
                className="py-1 pl-10 pr-4 rounded-full bg-[#131429] border border-[rgba(74,222,222,0.3)] text-white text-sm focus:outline-none focus:border-[#4ADEDE] w-40"
              />
            </div>
            
            <div className="bg-[#4ADEDE] text-[#0B0C2A] rounded-full px-4 py-1 font-medium shadow-[0_0_10px_rgba(74,222,222,0.5)]">
              Level {userLevel}
            </div>
          </div>
        </div>
      </nav>
      {/* ======= NAVIGATION BAR END ======= */}
      
      <div className="flex-1 p-6 relative">
        {/* XP Fireflies background */}
        <div className="xp-fireflies-container absolute inset-0 overflow-hidden pointer-events-none">
          {generateXpFireflies()}
        </div>
        
        {/* Global styles */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes microOrbit {
            0% {
              transform: translateX(0) translateY(0) rotate(0deg);
            }
            25% {
              transform: translateX(2px) translateY(-2px) rotate(0.5deg);
            }
            50% {
              transform: translateX(0) translateY(-4px) rotate(0deg);
            }
            75% {
              transform: translateX(-2px) translateY(-2px) rotate(-0.5deg);
            }
            100% {
              transform: translateX(0) translateY(0) rotate(0deg);
            }
          }
          
          @keyframes rotateCard {
            0% {
              transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
            }
            100% {
              transform: perspective(1000px) rotateY(10deg) rotateX(5deg);
            }
          }
          
          @keyframes reverseRotateCard {
            0% {
              transform: perspective(1000px) rotateY(10deg) rotateX(5deg);
            }
            100% {
              transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
            }
          }
          
          @keyframes pulseCommon {
            0%, 100% {
              box-shadow: 0 0 5px rgba(74, 222, 222, 0.3), 0 0 10px rgba(74, 222, 222, 0.1);
            }
            50% {
              box-shadow: 0 0 8px rgba(74, 222, 222, 0.5), 0 0 15px rgba(74, 222, 222, 0.3);
            }
          }
          
          @keyframes pulseRare {
            0%, 100% {
              box-shadow: 0 0 8px rgba(74, 222, 222, 0.5), 0 0 15px rgba(74, 222, 222, 0.3);
            }
            50% {
              box-shadow: 0 0 15px rgba(74, 222, 222, 0.8), 0 0 30px rgba(74, 222, 222, 0.5);
            }
          }
          
          @keyframes pulseEpic {
            0%, 100% {
              box-shadow: 0 0 10px rgba(127, 90, 240, 0.6), 0 0 20px rgba(127, 90, 240, 0.4);
            }
            50% {
              box-shadow: 0 0 20px rgba(127, 90, 240, 0.9), 0 0 40px rgba(127, 90, 240, 0.7);
            }
          }
          
          @keyframes particleOrbit {
            0% {
              transform: rotate(0deg) translateX(35px) rotate(0deg);
            }
            100% {
              transform: rotate(360deg) translateX(35px) rotate(-360deg);
            }
          }
          
          @keyframes sparkle {
            0%, 100% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes xpOrbFloat {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            25% {
              transform: translateY(-30px) translateX(10px);
            }
            50% {
              transform: translateY(-40px) translateX(-10px);
            }
            75% {
              transform: translateY(-20px) translateX(-20px);
            }
          }
          
          @keyframes xpOrbPulse {
            0%, 100% {
              opacity: 0.5;
              box-shadow: 0 0 10px rgba(74, 222, 222, 0.5);
            }
            50% {
              opacity: 0.9;
              box-shadow: 0 0 20px rgba(74, 222, 222, 0.8), 0 0 30px rgba(127, 90, 240, 0.6);
            }
          }
          
          @keyframes fireflyFloat {
            0% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(50px, -50px);
            }
            50% {
              transform: translate(100px, 0);
            }
            75% {
              transform: translate(50px, 50px);
            }
            100% {
              transform: translate(0, 0);
            }
          }
          
          @keyframes cometTrail {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          @keyframes purchaseBurst {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
          
          @keyframes tabShimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }
          
          @keyframes nebulaSwirl {
            0% {
              transform: rotate(0deg);
              opacity: 0.3;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              transform: rotate(360deg);
              opacity: 0.3;
            }
          }
          
          @keyframes glitchEffect {
            0%, 100% {
              transform: translateX(0);
              color: #4ADEDE;
              text-shadow: 0 0 8px #4ADEDE;
            }
            10%, 30%, 50%, 70%, 90% {
              transform: translateX(-4px);
              color: #FF5E5E;
              text-shadow: 0 0 8px #FF5E5E;
            }
            20%, 40%, 60%, 80% {
              transform: translateX(4px);
              color: #FF5E5E;
              text-shadow: 0 0 8px #FF5E5E;
            }
          }
          
          @keyframes nameGlint {
            0% {
              transform: translateX(-100%);
              background-position: -100% 0;
            }
            100% {
              transform: translateX(100%);
              background-position: 200% 0;
            }
          }
          
          body {
            background: radial-gradient(ellipse at center, #0B0C2A 0%, #07071C 100%);
            color: #fff;
            overflow-x: hidden;
            margin: 0;
            padding: 0;
          }
          
          .glow-text {
            text-shadow: 0 0 8px #4ADEDE, 0 0 15px #7F5AF0;
          }
          
          .badge-card {
            position: relative;
            transform-style: preserve-3d;
            perspective: 1000px;
            transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
            transition: transform 0.3s ease;
            animation: microOrbit 6s ease-in-out infinite;
          }
          
          .badge-card.hover-active {
            animation: rotateCard 0.5s forwards;
            box-shadow: 0 0 15px rgba(74, 222, 222, 0.5), 0 0 25px rgba(127, 90, 240, 0.4);
            transform: scale(1.05);
          }
          
          .badge-card.hover-inactive {
            animation: reverseRotateCard 0.5s forwards, microOrbit 6s ease-in-out infinite;
          }
          
          .badge-card.common-rarity::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 12px;
            padding: 1px;
            background: linear-gradient(45deg, rgba(74, 222, 222, 0.5), rgba(255, 255, 255, 0.2));
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: pulseCommon 3s infinite;
          }
          
          .badge-card.rare-rarity::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 12px;
            padding: 1px;
            background: linear-gradient(45deg, #4ADEDE, rgba(255, 255, 255, 0.5));
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: pulseRare 3s infinite;
          }
          
          .badge-card.epic-rarity::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 12px;
            padding: 1px;
            background: linear-gradient(45deg, #7F5AF0, #4ADEDE);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: pulseEpic 3s infinite;
          }
          
          .rare-particle {
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #4ADEDE;
            box-shadow: 0 0 10px #4ADEDE, 0 0 20px rgba(74, 222, 222, 0.5);
            opacity: 0.7;
            animation: particleOrbit 8s linear infinite;
          }
          
          .rare-particle:nth-child(1) { animation-delay: 0s; }
          .rare-particle:nth-child(2) { animation-delay: -2s; }
          .rare-particle:nth-child(3) { animation-delay: -4s; }
          .rare-particle:nth-child(4) { animation-delay: -6s; }
          
          .epic-sparkle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 10px white, 0 0 20px #7F5AF0;
            animation: sparkle 4s ease-in-out infinite;
          }
          
          .xp-orb {
            border-radius: 50%;
            background: radial-gradient(circle at 30%, white, #4ADEDE);
            box-shadow: 0 0 10px rgba(74, 222, 222, 0.5), 0 0 20px rgba(74, 222, 222, 0.3);
            animation: xpOrbFloat 12s ease infinite, xpOrbPulse 4s ease-in-out infinite;
          }
          
          .xp-firefly {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle at 30%, white, #4ADEDE);
            box-shadow: 0 0 10px rgba(74, 222, 222, 0.5), 0 0 20px rgba(74, 222, 222, 0.3);
            animation: fireflyFloat var(--duration, 15s) ease-in-out infinite;
            filter: blur(1px);
          }
          
          .xp-container {
            position: relative;
            transition: all 0.3s ease;
          }
          
          .dynamic-aura {
            position: absolute;
            inset: -8px;
            border-radius: 12px;
            background: radial-gradient(circle, rgba(74, 222, 222, 0.4) 0%, rgba(127, 90, 240, 0) 70%);
            opacity: 0;
            transition: opacity 0.5s ease;
            z-index: -1;
          }
          
          .badge-card.can-afford .dynamic-aura {
            opacity: 1;
            animation: xpOrbPulse 3s ease-in-out infinite;
          }
          
          .swirling-nebula {
            position: absolute;
            inset: 0;
            border-radius: 10px;
            background: radial-gradient(
              ellipse at center,
              rgba(127, 90, 240, 0.2) 0%,
              rgba(74, 222, 222, 0.2) 50%,
              rgba(127, 90, 240, 0) 70%
            );
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
          }
          
          .badge-card.hover-active .swirling-nebula {
            opacity: 1;
            animation: nebulaSwirl 15s linear infinite;
          }
          
          .badge-title {
            position: relative;
            overflow: hidden;
          }
          
          .badge-title.glint-active::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.8) 50%,
              rgba(255, 255, 255, 0) 100%
            );
            animation: nameGlint 1.5s ease-out;
          }
          
          .comet-trail {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .comet-trail::before {
            content: '';
            position: absolute;
            top: 0;
            left: -50%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(74, 222, 222, 0.5), transparent);
            transform: translateX(-100%);
          }
          
          .purchase-btn:hover .comet-trail {
            opacity: 1;
          }
          
          .purchase-btn:hover .comet-trail::before {
            animation: cometTrail 1s ease-in-out;
          }
          
          .purchase-success-burst {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            width: 150%;
            height: 150%;
            background: radial-gradient(circle, rgba(74, 222, 222, 0.8) 0%, rgba(127, 90, 240, 0) 70%);
            border-radius: 50%;
            z-index: 10;
            pointer-events: none;
            animation: purchaseBurst 1s ease-out forwards;
          }
          
          .tab-shimmer {
            background: linear-gradient(
              90deg,
              rgba(74, 222, 222, 0) 0%,
              rgba(74, 222, 222, 0.1) 20%,
              rgba(127, 90, 240, 0.2) 60%,
              rgba(74, 222, 222, 0) 100%
            );
            background-size: 200% 100%;
            animation: tabShimmer 2s linear forwards;
          }
          
          .insufficient-xp {
            animation: glitchEffect 0.6s ease-in-out;
          }
          
          .badge-magnet {
            position: fixed;
            z-index: 100;
            pointer-events: none;
          }
        `}</style>
        
        {/* Header with XP display */}
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold glow-text mb-2">Shop</h1>
              <p className="text-[#A0A4B8]">Use your XP to purchase badges and show them off on the leaderboard</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* XP Container with floating orbs */}
              <div className="relative xp-container" ref={xpRef}>
                <div className="bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] rounded-lg px-4 py-2 font-bold relative overflow-hidden z-10">
                  {userXp} XP
                  <div className={`glitch-overlay ${isGlitchActive ? 'active' : ''}`}></div>
                </div>
                
                {/* Floating XP Orbs */}
                <div className="xp-orbs-container absolute -z-1 w-full h-48 -top-6 -left-6 pointer-events-none overflow-hidden">
                  {generateXpOrbs()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex justify-between items-center mb-6">
            <Tabs defaultValue="all" className="w-full" onValueChange={(value) => {
              // Add shimmer effect on tab change
              const tabsContent = document.querySelector('.tabs-content');
              if (tabsContent) {
                tabsContent.classList.add('tab-shimmer');
                setTimeout(() => {
                  tabsContent.classList.remove('tab-shimmer');
                  setActiveTab(value);
                }, 300);
              } else {
                setActiveTab(value);
              }
            }}>
              <TabsList className="grid w-full grid-cols-4 bg-[#131429] border border-[rgba(127,90,240,0.2)]">
                <TabsTrigger 
                  value="all" 
                  className={activeTab === "all" ? "bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] font-semibold" : "text-[#A0A4B8] hover:text-white"}
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="common" 
                  className={activeTab === "common" ? "bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] font-semibold" : "text-[#A0A4B8] hover:text-white"}
                >
                  Common
                </TabsTrigger>
                <TabsTrigger 
                  value="rare" 
                  className={activeTab === "rare" ? "bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] font-semibold" : "text-[#A0A4B8] hover:text-white"}
                >
                  Rare
                </TabsTrigger>
                <TabsTrigger 
                  value="epic" 
                  className={activeTab === "epic" ? "bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] font-semibold" : "text-[#A0A4B8] hover:text-white"}
                >
                  Epic
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Badge Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 tabs-content">
            <AnimatePresence mode="wait">
              {filteredBadges.map((badge, index) => {
                // Check if user owns this badge by comparing numeric ID
                const isOwned = userBadges.includes(badge.id.toString());
                
                const canAfford = userXp >= badge.price
                const isGlinting = badgeGlintActive.includes(badge.id)
                
                // Use different animation variants based on rarity
                const variants = getRarityVariants(badge.rarity);
                
                return (
                  <motion.div
                    key={badge.id}
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                    custom={index}
                    layoutId={`badge-${badge.id}`}
                  >
                    <div 
                      className={`badge-card ${hoveredBadge === badge.id ? 'hover-active' : 'hover-inactive'} ${badge.rarity}-rarity ${canAfford && !isOwned ? 'can-afford' : ''} relative bg-[#131429] rounded-xl p-5 border border-[rgba(255,255,255,0.05)] transition-all duration-300`}
                      onMouseEnter={() => setHoveredBadge(badge.id)}
                      onMouseLeave={() => setHoveredBadge(null)}
                    >
                      {/* Dynamic XP Aura for affordable badges */}
                      <div className="dynamic-aura"></div>
                      
                      {/* Swirling Nebula Hover Background */}
                      <div className="swirling-nebula"></div>
                      
                      {/* Rarity particles/effects */}
                      {badge.rarity === "rare" && (
                        <>
                          <div className="rare-particle" style={{ top: '10%', left: '10%' }}></div>
                          <div className="rare-particle" style={{ top: '10%', right: '10%' }}></div>
                          <div className="rare-particle" style={{ bottom: '10%', left: '10%' }}></div>
                          <div className="rare-particle" style={{ bottom: '10%', right: '10%' }}></div>
                        </>
                      )}
                      
                      {badge.rarity === "epic" && (
                        <>
                          {[...Array(8)].map((_, i) => (
                            <div 
                              key={i} 
                              className="epic-sparkle" 
                              style={{ 
                                top: `${Math.random() * 100}%`, 
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 4}s` 
                              }}
                            ></div>
                          ))}
                        </>
                      )}
                      
                      <div className="pb-2 mb-2 border-b border-[rgba(255,255,255,0.1)]">
                        <div className="flex justify-between items-start">
                          {/* Glint Pass on Badge Names */}
                          <h3 className={`text-xl font-semibold text-white glow-text badge-title ${isGlinting ? 'glint-active' : ''}`}>
                            {badge.name}
                          </h3>
                          <Badge
                            className={
                              badge.rarity === "common"
                                ? "bg-[rgba(160,164,184,0.2)] text-white"
                                : badge.rarity === "rare"
                                  ? "bg-[rgba(74,222,222,0.2)] text-[#4ADEDE]"
                                  : "bg-[rgba(127,90,240,0.2)] text-[#7F5AF0]"
                            }
                          >
                            {badge.rarity}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#A0A4B8] mb-4">{badge.description}</p>
                        <div className="flex justify-between items-center relative">
                          <span className="text-[#4ADEDE] font-bold">{badge.price} XP</span>
                          
                          {/* Purchase success burst animation */}
                          {purchaseSuccess === badge.id && (
                            <div className="purchase-success-burst"></div>
                          )}
                          
                          {isOwned ? (
                            <div className="px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] opacity-70">
                              <Sparkles className="mr-2 h-4 w-4" />
                              Owned
                            </div>
                          ) : (
                            <div className="relative purchase-btn">
                              <div className="comet-trail"></div>
                              <button 
                                className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 ${
                                  !canAfford || loading || animatingPurchase === badge.id
                                    ? "bg-[#131429] border border-[#4ADEDE] text-[#A0A4B8] opacity-70 cursor-not-allowed" 
                                    : "bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] hover:shadow-[0_0_10px_rgba(74,222,222,0.7)]"
                                }`}
                                disabled={!canAfford || loading || animatingPurchase === badge.id}
                                onClick={() => openPurchaseDialog(badge)}
                              >
                                <ShoppingBag className="mr-2 h-4 w-4" /> 
                                {canAfford ? "Purchase" : "Not enough XP"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* XP Orb behind card on hover */}
                      {hoveredBadge === badge.id && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 -z-10 opacity-30 rounded-full bg-[#4ADEDE] blur-xl pointer-events-none"></div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* Purchase Confirmation Dialog */}
          {selectedBadge && (
            <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
              <DialogContent className="bg-[#131429] backdrop-blur-md border border-[#4ADEDE] text-white">
                <DialogHeader>
                  <DialogTitle className="text-[#4ADEDE] glow-text">Purchase Badge</DialogTitle>
                  <DialogDescription className="text-[#A0A4B8]">
                    Are you sure you want to purchase the {selectedBadge.name} badge for {selectedBadge.price} XP?
                  </DialogDescription>
                </DialogHeader>
                
                {userXp < selectedBadge.price && (
                  <div className="flex items-start p-3 bg-[rgba(255,0,0,0.1)] border border-red-500/30 rounded-md mt-2">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 text-sm">
                        You don't have enough XP to purchase this badge. You need {selectedBadge.price - userXp} more XP.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button 
                    className="px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 border border-[#4ADEDE] text-[#4ADEDE] bg-transparent"
                    onClick={() => setPurchaseDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <div className="relative purchase-btn">
                    <div className="comet-trail"></div>
                    <button 
                      className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 ${
                        loading || userXp < selectedBadge.price 
                          ? "bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] opacity-70 cursor-not-allowed" 
                          : "bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] hover:shadow-[0_0_10px_rgba(74,222,222,0.7)]"
                      }`}
                      disabled={loading || userXp < selectedBadge.price}
                      onClick={() => handlePurchase(selectedBadge)}
                      type="button"
                    >
                      {loading ? "Processing..." : "Confirm Purchase"}
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Badge Magnet Effect Animation */}
      <AnimatePresence>
        {animatingPurchase !== null && (
          <motion.div 
            initial={{ 
              position: "fixed",
              scale: 1,
              opacity: 1,
              zIndex: 100,
              top: pageRef.current ? `${pageRef.current.scrollTop + window.innerHeight / 2}px` : '50%',
              left: '50%',
              x: '-50%',
              y: '-50%'
            }}
            animate={{ 
              scale: 0.2,
              opacity: 0,
              top: '0px',
              right: '0px',
              x: '0px',
              y: '0px',
              left: 'auto'
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="badge-magnet"
          >
            <div className="bg-[#131429] rounded-xl p-3 border border-[rgba(74,222,222,0.5)] shadow-[0_0_20px_rgba(74,222,222,0.7)]">
              <div className="flex items-center justify-center w-12 h-12">
                <ShoppingBag size={24} className="text-[#4ADEDE]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}