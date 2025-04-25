"use client"

import { useState, useEffect } from "react"
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
  Search 
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

export default function Shop() {
  const [activeTab, setActiveTab] = useState("all")
  const [userXp, setUserXp] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<any>(null)

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

  const badges = [
    { id: 1, name: "Early Bird", description: "Complete 5 tasks before 9 AM", price: 100, rarity: "common" },
    { id: 2, name: "Night Owl", description: "Complete 5 tasks after 10 PM", price: 100, rarity: "common" },
    { id: 3, name: "Streak Master", description: "Maintain a 7-day streak", price: 200, rarity: "rare" },
    { id: 4, name: "Game Champion", description: "Win all mini games", price: 300, rarity: "rare" },
    { id: 5, name: "Fitness Guru", description: "Complete a 30-day fitness plan", price: 500, rarity: "epic" },
    { id: 6, name: "Habit Hero", description: "Create and complete 10 habits", price: 500, rarity: "epic" },
  ]

  const filteredBadges = activeTab === "all" ? badges : badges.filter((badge) => badge.rarity === activeTab)

  const handlePurchase = async (badge: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/badges/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ badgeId: badge.id }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Update user XP and badges
        setUserXp(data.data.userXp)
        setUserBadges(prev => [...prev, badge.id.toString()])
        
        // Show success notification
        toast.success(`🏆 Badge Purchased: ${badge.name}!`, {
          description: `You spent ${badge.price} XP on this badge.`,
          duration: 5000,
        })
        
        // Check for achievement unlock
        const badgeCollectorAchievement = userBadges.length === 0
        if (badgeCollectorAchievement) {
          toast.success(`🏆 Achievement Unlocked: Badge Collector!`, {
            description: 'Purchased your first badge from the shop.',
            duration: 5000,
            icon: '🏆',
          })
        }
      } else {
        // Show error notification
        toast.error(data.message || 'Failed to purchase badge', {
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error purchasing badge:', error)
      toast.error('Failed to purchase badge. Please try again later.', {
        duration: 5000,
      })
    } finally {
      setLoading(false)
      setPurchaseDialogOpen(false)
    }
  }

  const openPurchaseDialog = (badge: any) => {
    setSelectedBadge(badge)
    setPurchaseDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0B0C2A] text-white flex flex-col">
      {/* ======= NAVIGATION BAR START ======= */}
      <nav className="bg-[#070A18] border-b border-[rgba(74,222,222,0.1)] px-6 py-3">
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
            <Link href="/mini-games" className="flex flex-col items-center text-[#A0A4B8] hover:text-white transition-colors">
              <GamepadIcon size={20} />
              <span className="text-xs mt-1">Mini Games</span>
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
      
      <div className="flex-1 p-6">
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
        `}</style>
        
        {/* Header with XP display */}
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold glow-text mb-2">Shop</h1>
              <p className="text-[#A0A4B8]">Use your XP to purchase badges and show them off on the leaderboard</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] rounded-lg px-4 py-2 font-bold">
                {userXp} XP
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex justify-between items-center mb-6">
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => {
              const isOwned = userBadges.includes(badge.id.toString())
              const canAfford = userXp >= badge.price
              
              return (
                <div 
                  key={badge.id} 
                  className="bg-[#131429] rounded-xl p-5 border border-[rgba(255,255,255,0.05)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(74,222,222,0.5),0_0_25px_rgba(127,90,240,0.4)] hover:scale-105"
                >
                  <div className="pb-2 mb-2 border-b border-[rgba(255,255,255,0.1)]">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-white glow-text">{badge.name}</h3>
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
                    <div className="flex justify-between items-center">
                      <span className="text-[#4ADEDE] font-bold">{badge.price} XP</span>
                      {isOwned ? (
                        <button 
                          disabled 
                          className="px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] opacity-70"
                        >
                          Owned
                        </button>
                      ) : (
                        <button 
                          className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 ${
                            !canAfford || loading 
                              ? "bg-[#131429] border border-[#4ADEDE] text-[#A0A4B8] opacity-70 cursor-not-allowed" 
                              : "bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] hover:shadow-[0_0_10px_rgba(74,222,222,0.7)]"
                          }`}
                          disabled={!canAfford || loading}
                          onClick={() => openPurchaseDialog(badge)}
                        >
                          <ShoppingBag className="mr-2 h-4 w-4" /> 
                          {canAfford ? "Purchase" : "Not enough XP"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
                  <button 
                    className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 ${
                      loading || userXp < selectedBadge.price 
                        ? "bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] opacity-70 cursor-not-allowed" 
                        : "bg-gradient-to-r from-[#4ADEDE] to-[#7F5AF0] text-[#0B0C2A] hover:shadow-[0_0_10px_rgba(74,222,222,0.7)]"
                    }`}
                    disabled={loading || userXp < selectedBadge.price}
                    onClick={() => handlePurchase(selectedBadge)}
                  >
                    {loading ? "Processing..." : "Confirm Purchase"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}