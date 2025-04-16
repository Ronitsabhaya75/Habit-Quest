"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/main-layout"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ShoppingCart } from "lucide-react"

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
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Shop</h1>
        <p className="text-gray-400">Use your XP to purchase badges and show them off on the leaderboard</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-[#2a3343]">
            <TabsTrigger value="all" className={activeTab === "all" ? "bg-[#4cc9f0] text-black" : "text-white"}>
              All
            </TabsTrigger>
            <TabsTrigger value="common" className={activeTab === "common" ? "bg-[#4cc9f0] text-black" : "text-white"}>
              Common
            </TabsTrigger>
            <TabsTrigger value="rare" className={activeTab === "rare" ? "bg-[#4cc9f0] text-black" : "text-white"}>
              Rare
            </TabsTrigger>
            <TabsTrigger value="epic" className={activeTab === "epic" ? "bg-[#4cc9f0] text-black" : "text-white"}>
              Epic
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => (
          <Card key={badge.id} className="bg-[#1a2332]/80 border-[#2a3343]">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-white">{badge.name}</CardTitle>
                <Badge
                  className={
                    badge.rarity === "common"
                      ? "bg-gray-500"
                      : badge.rarity === "rare"
                        ? "bg-blue-500"
                        : "bg-purple-500"
                  }
                >
                  {badge.rarity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">{badge.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">{badge.price} XP</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Purchase
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1a2332] border-[#2a3343] text-white">
                    <DialogHeader>
                      <DialogTitle>Purchase Badge</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Are you sure you want to purchase the {badge.name} badge for {badge.price} XP?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]">
                        Cancel
                      </Button>
                      <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">Confirm Purchase</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  )
}
