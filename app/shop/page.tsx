"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { ShoppingBag, AlertCircle } from "lucide-react"
import { ThemedCard } from "../../components/themed-card"
import { ThemedButton } from "../../components/themed-button"
import { toast } from "sonner"
import { AppLayout } from "../../components/app-layout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"

export default function Shop() {
  const [activeTab, setActiveTab] = useState("all")
  const [userXp, setUserXp] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<any>(null)

  // Fetch user data on component mount
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
    <AppLayout 
      title="Shop" 
      subtitle="Use your XP to purchase badges and show them off on the leaderboard"
      userXp={userXp}
      userLevel={userLevel}
    >
      <div className="flex justify-between items-center mb-6">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-[rgba(11,26,44,0.8)] border border-[rgba(0,255,198,0.2)]">
            <TabsTrigger 
              value="all" 
              className={activeTab === "all" ? "bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520]" : "text-[#B8FFF9]"}
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="common" 
              className={activeTab === "common" ? "bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520]" : "text-[#B8FFF9]"}
            >
              Common
            </TabsTrigger>
            <TabsTrigger 
              value="rare" 
              className={activeTab === "rare" ? "bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520]" : "text-[#B8FFF9]"}
            >
              Rare
            </TabsTrigger>
            <TabsTrigger 
              value="epic" 
              className={activeTab === "epic" ? "bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520]" : "text-[#B8FFF9]"}
            >
              Epic
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => {
          const isOwned = userBadges.includes(badge.id.toString())
          const canAfford = userXp >= badge.price
          
          return (
            <ThemedCard key={badge.id} glowEffect>
              <div className="pb-2 mb-2 border-b border-[rgba(255,255,255,0.1)]">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-[#B8FFF9]">{badge.name}</h3>
                  <Badge
                    className={
                      badge.rarity === "common"
                        ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
                        : badge.rarity === "rare"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    }
                  >
                    {badge.rarity}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-[#B8FFF9] opacity-80 mb-4">{badge.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[#00FFF5] font-bold">{badge.price} XP</span>
                  {isOwned ? (
                    <ThemedButton disabled glowEffect variant="success">
                      Owned
                    </ThemedButton>
                  ) : (
                    <ThemedButton 
                      glowEffect 
                      disabled={!canAfford || loading} 
                      onClick={() => openPurchaseDialog(badge)}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" /> 
                      {canAfford ? "Purchase" : "Not enough XP"}
                    </ThemedButton>
                  )}
                </div>
              </div>
            </ThemedCard>
          );
        })}
      </div>
      
      {/* Purchase Confirmation Dialog */}
      {selectedBadge && (
        <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
          <DialogContent className="bg-[rgba(11,26,44,0.95)] backdrop-blur-md border-[rgba(0,255,198,0.3)] text-[#B8FFF9]">
            <DialogHeader>
              <DialogTitle className="text-[#00FFF5]">Purchase Badge</DialogTitle>
              <DialogDescription className="text-[#B8FFF9] opacity-80">
                Are you sure you want to purchase the {selectedBadge.name} badge for {selectedBadge.price} XP?
              </DialogDescription>
            </DialogHeader>
            
            {userXp < selectedBadge.price && (
              <div className="flex items-start p-3 bg-red-900/20 border border-red-500/30 rounded-md mt-2">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm">
                    You don't have enough XP to purchase this badge. You need {selectedBadge.price - userXp} more XP.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-4">
              <ThemedButton variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                Cancel
              </ThemedButton>
              <ThemedButton 
                disabled={loading || userXp < selectedBadge.price}
                onClick={() => handlePurchase(selectedBadge)}
              >
                {loading ? "Processing..." : "Confirm Purchase"}
              </ThemedButton>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  )
}