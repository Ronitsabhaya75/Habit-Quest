"use client"

import { useState } from "react"
import SharedLayout from "../../components/shared-layout"
import { ThemedCard } from "../../components/themed-card"
import { ThemedButton } from "../../components/themed-button"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { Filter, Search, ShoppingBag, Sparkles, Star, Zap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"

export default function Shop() {
  const [activeTab, setActiveTab] = useState("all")

  const badges = [
    { id: 1, name: "Early Bird", description: "Complete 5 tasks before 9 AM", price: 100, rarity: "common" },
    { id: 2, name: "Night Owl", description: "Complete 5 tasks after 10 PM", price: 100, rarity: "common" },
    { id: 3, name: "Streak Master", description: "Maintain a 7-day streak", price: 200, rarity: "rare" },
    { id: 4, name: "Game Champion", description: "Win all mini games", price: 300, rarity: "rare" },
    { id: 5, name: "Fitness Guru", description: "Complete a 30-day fitness plan", price: 500, rarity: "epic" },
    { id: 6, name: "Habit Hero", description: "Create and complete 10 habits", price: 500, rarity: "epic" },
  ]

  const filteredBadges = activeTab === "all" ? badges : badges.filter((badge) => badge.rarity === activeTab)

  return (
    <SharedLayout>
      <div className="px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#00FFF5] drop-shadow-[0_0_10px_rgba(0,255,245,0.3)]">Shop</h1>
          <p className="text-[#B8FFF9] opacity-80">Use your XP to purchase badges and show them off on the leaderboard</p>
        </div>

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
          {filteredBadges.map((badge) => (
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <ThemedButton glowEffect>
                        <ShoppingBag className="mr-2 h-4 w-4" /> Purchase
                      </ThemedButton>
                    </DialogTrigger>
                    <DialogContent className="bg-[rgba(11,26,44,0.95)] backdrop-blur-md border-[rgba(0,255,198,0.3)] text-[#B8FFF9]">
                      <DialogHeader>
                        <DialogTitle className="text-[#00FFF5]">Purchase Badge</DialogTitle>
                        <DialogDescription className="text-[#B8FFF9] opacity-80">
                          Are you sure you want to purchase the {badge.name} badge for {badge.price} XP?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end space-x-2 mt-4">
                        <ThemedButton variant="outline">
                          Cancel
                        </ThemedButton>
                        <ThemedButton>
                          Confirm Purchase
                        </ThemedButton>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </ThemedCard>
          ))}
        </div>
      </div>
    </SharedLayout>
  )
}
