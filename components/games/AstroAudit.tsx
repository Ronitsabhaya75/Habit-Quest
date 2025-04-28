"use client"

import type { ReactNode } from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader } from "../ui/card"
import { toast } from "../ui/use-toast"
import { Building2, GaugeCircle, Coins, Star } from "lucide-react"

interface Resource {
  credits: number;
  fuel: number;
  minerals: number;
}

interface Building {
  id: string;
  name: string;
  type: string;
  cost: Resource;
  production: Resource;
  level: number;
}

interface BuildingType {
  type: string;
  name: string;
  icon: ReactNode;
  baseCost: Resource;
  baseProduction: Resource;
  maxLevel: number;
}

interface AstroAuditProps {
  backToGames?: () => void;
}

const MAX_RESOURCES = {
  credits: 10000,
  fuel: 5000,
  minerals: 3000
}

const BUILDING_TYPES: BuildingType[] = [
  {
    type: "mine",
    name: "Mineral Extractor",
    icon: <Building2 className="w-6 h-6" />,
    baseCost: { credits: 50, fuel: 20, minerals: 0 },
    baseProduction: { credits: 0, fuel: 0, minerals: 10 },
    maxLevel: 5
  },
  {
    type: "refinery",
    name: "Fuel Refinery",
    icon: <GaugeCircle className="w-6 h-6" />,
    baseCost: { credits: 75, fuel: 0, minerals: 30 },
    baseProduction: { credits: 0, fuel: 15, minerals: 0 },
    maxLevel: 5
  },
  {
    type: "market",
    name: "Trading Post",
    icon: <Coins className="w-6 h-6" />,
    baseCost: { credits: 100, fuel: 30, minerals: 20 },
    baseProduction: { credits: 25, fuel: 0, minerals: 0 },
    maxLevel: 5
  }
]

export function AstroAudit({ backToGames }: AstroAuditProps) {
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [resources, setResources] = useState<Resource>({ credits: 100, fuel: 50, minerals: 30 })
  const [buildings, setBuildings] = useState<Building[]>([])
  const [streak, setStreak] = useState<number>(0)
  const [lastLogDate, setLastLogDate] = useState<string | null>(null)
  const [highScore, setHighScore] = useState<number>(0)

  // Start new game
  const handleStartGame = () => {
    try {
      const savedHighScore = localStorage.getItem('AstroAuditHighScore')
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore))
      }
      
      setGameStarted(true)
      setGameOver(false)
      setResources({ credits: 100, fuel: 50, minerals: 30 })
      setBuildings([])
      setStreak(0)
      loadProgress()
    } catch (error: unknown) {
      toast({
        title: "Error Starting Game",
        description: "Failed to load game data. Starting fresh.",
      })
    }
  }

  // Load saved progress
  const loadProgress = () => {
    try {
      const savedProgress = localStorage.getItem('AstroAuditProgress')
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        setResources(progress.resources)
        setBuildings(progress.buildings)
        setStreak(progress.streak)
        setLastLogDate(progress.lastLogDate)
      }
    } catch (error: unknown) {
      toast({
        title: "Error Loading Progress",
        description: "Failed to load saved progress.",
      })
    }
  }

  // Save progress
  const saveProgress = useCallback(() => {
    try {
      localStorage.setItem('AstroAuditProgress', JSON.stringify({
        resources,
        buildings,
        streak,
        lastLogDate
      }))
      
      if (streak > highScore) {
        setHighScore(streak)
        localStorage.setItem('AstroAuditHighScore', streak.toString())
      }
    } catch (error: unknown) {
      toast({
        title: "Error Saving Progress",
        description: "Failed to save game progress.",
      })
    }
  }, [resources, buildings, streak, lastLogDate, highScore]);

  // Handle finance logging
  const handleFinanceLog = () => {
    const today = new Date().toISOString().split('T')[0]
    
    if (lastLogDate !== today) {
      const reward: Resource = {
        credits: 50,
        fuel: 20,
        minerals: 15
      }
      
      setResources((prev: Resource) => ({
        credits: Math.min(prev.credits + reward.credits, MAX_RESOURCES.credits),
        fuel: Math.min(prev.fuel + reward.fuel, MAX_RESOURCES.fuel),
        minerals: Math.min(prev.minerals + reward.minerals, MAX_RESOURCES.minerals)
      }))

      setStreak((prev: number) => prev + 1)
      setLastLogDate(today)

      toast({
        title: "Finance Logged!",
        description: `+${reward.credits} credits, +${reward.fuel} fuel, +${reward.minerals} minerals! Streak: ${streak + 1} days`,
      })

      if ((streak + 1) % 7 === 0) {
        const bonusReward: Resource = {
          credits: 200,
          fuel: 100,
          minerals: 75
        }
        
        setResources((prev: Resource) => ({
          credits: Math.min(prev.credits + bonusReward.credits, MAX_RESOURCES.credits),
          fuel: Math.min(prev.fuel + bonusReward.fuel, MAX_RESOURCES.fuel),
          minerals: Math.min(prev.minerals + bonusReward.minerals, MAX_RESOURCES.minerals)
        }))

        toast({
          title: "Streak Achievement!",
          description: "7 Day Financial Champion! Bonus resources awarded!",
        })
      }
    } else {
      toast({
        title: "Already Logged Today",
        description: "Come back tomorrow to continue your streak!",
      })
    }
  }

  // Build new structure
  const handleBuild = (buildingType: BuildingType) => {
    const canAfford = Object.entries(buildingType.baseCost).every(
      ([resource, cost]) => resources[resource as keyof Resource] >= cost
    )

    if (canAfford) {
      setResources((prev: Resource) => ({
        credits: prev.credits - buildingType.baseCost.credits,
        fuel: prev.fuel - buildingType.baseCost.fuel,
        minerals: prev.minerals - buildingType.baseCost.minerals
      }))

      const newBuilding: Building = {
        id: Date.now().toString(),
        name: buildingType.name,
        type: buildingType.type,
        cost: buildingType.baseCost,
        production: buildingType.baseProduction,
        level: 1
      }

      setBuildings((prev: Building[]) => [...prev, newBuilding])

      toast({
        title: "Building Constructed!",
        description: `New ${buildingType.name} added to your colony!`,
      })
    } else {
      toast({
        title: "Insufficient Resources",
        description: "You need more resources to build this structure.",
      })
    }
  }

  // Upgrade building
  const handleUpgrade = (building: Building) => {
    const buildingType = BUILDING_TYPES.find(b => b.type === building.type)
    if (!buildingType) return

    if (building.level >= buildingType.maxLevel) {
      toast({
        title: "Maximum Level Reached",
        description: "This building cannot be upgraded further.",
      })
      return
    }

    const upgradeCost: Resource = {
      credits: Math.floor(buildingType.baseCost.credits * (1.5 ** building.level)),
      fuel: Math.floor(buildingType.baseCost.fuel * (1.5 ** building.level)),
      minerals: Math.floor(buildingType.baseCost.minerals * (1.5 ** building.level))
    }

    const canAfford = Object.entries(upgradeCost).every(
      ([resource, cost]) => resources[resource as keyof Resource] >= cost
    )

    if (canAfford) {
      setResources((prev: Resource) => ({
        credits: prev.credits - upgradeCost.credits,
        fuel: prev.fuel - upgradeCost.fuel,
        minerals: prev.minerals - upgradeCost.minerals
      }))

      setBuildings((prev: Building[]) => 
        prev.map(b => 
          b.id === building.id 
            ? {
                ...b,
                level: b.level + 1,
                production: {
                  credits: Math.floor(buildingType.baseProduction.credits * (1.5 ** (b.level))),
                  fuel: Math.floor(buildingType.baseProduction.fuel * (1.5 ** (b.level))),
                  minerals: Math.floor(buildingType.baseProduction.minerals * (1.5 ** (b.level)))
                }
              }
            : b
        )
      )

      toast({
        title: "Building Upgraded!",
        description: `${building.name} upgraded to level ${building.level + 1}!`,
      })
    } else {
      toast({
        title: "Insufficient Resources",
        description: "You need more resources to upgrade this building.",
      })
    }
  }

  // Handle building production
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const productionInterval = setInterval(() => {
        setResources((prev: Resource) => {
          const production = buildings.reduce<Resource>(
            (acc: Resource, building: Building) => ({
              credits: acc.credits + building.production.credits,
              fuel: acc.fuel + building.production.fuel,
              minerals: acc.minerals + building.production.minerals
            }),
            { credits: 0, fuel: 0, minerals: 0 }
          )

          return {
            credits: Math.min(prev.credits + production.credits, MAX_RESOURCES.credits),
            fuel: Math.min(prev.fuel + production.fuel, MAX_RESOURCES.fuel),
            minerals: Math.min(prev.minerals + production.minerals, MAX_RESOURCES.minerals)
          }
        })
      }, 10000)

      return () => clearInterval(productionInterval)
    }
  }, [gameStarted, gameOver, buildings])

  // Save progress when game state changes
  useEffect(() => {
    if (gameStarted) {
      saveProgress()
    }
  }, [gameStarted, saveProgress])

  // Handle ending the game and navigating back
  const handleEndGame = () => {
    setGameOver(true)
    saveProgress()
    if (backToGames) {
      backToGames()
    }
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-[#0D0D2B] to-[#0f172a] text-white">
      {/* Game Header */}
      <div className="flex justify-between items-center p-4 border-b border-[#2a3343] mb-6">
        <div className="flex items-center space-x-2">
          <Star className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-bold">AstroAudit</h1>
        </div>
        <Button 
          variant="outline" 
          className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
          onClick={backToGames}
        >
          Back to Games
        </Button>
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
          <h2 className="text-2xl font-bold text-white">AstroAudit Finance</h2>
          <p className="text-gray-400 text-center max-w-md">
            Build your space colony by tracking your daily finances! Log your finances daily to earn resources and expand.
          </p>
          <Button 
            onClick={handleStartGame}
            className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black font-medium px-8 py-2"
          >
            Start Game
          </Button>
          {highScore > 0 && (
            <p className="text-gray-400">High Score: {highScore} days</p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto space-y-8 px-4">
          {/* Score Display */}
          <div className="flex justify-center mb-2">
            <Badge className="bg-[#4cc9f0] text-black px-6 py-1 text-base">
              Score: {streak}
            </Badge>
          </div>

          {/* Resources Display */}
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2 bg-[#1a2332] border border-[#2a3343] px-4 py-2 rounded-md">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="mr-1">Credits</span>
              <Badge className="bg-yellow-400 text-black">{resources.credits}/{MAX_RESOURCES.credits}</Badge>
            </div>
            <div className="flex items-center gap-2 bg-[#1a2332] border border-[#2a3343] px-4 py-2 rounded-md">
              <GaugeCircle className="w-5 h-5 text-blue-400" />
              <span className="mr-1">Fuel</span>
              <Badge className="bg-blue-400 text-black">{resources.fuel}/{MAX_RESOURCES.fuel}</Badge>
            </div>
            <div className="flex items-center gap-2 bg-[#1a2332] border border-[#2a3343] px-4 py-2 rounded-md">
              <Building2 className="w-5 h-5 text-gray-400" />
              <span className="mr-1">Minerals</span>
              <Badge className="bg-gray-400 text-black">{resources.minerals}/{MAX_RESOURCES.minerals}</Badge>
            </div>
          </div>

          {/* Finance Logging Section */}
          <Card className="bg-[#1a2332] border-[#2a3343]">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Daily Financial Log</h3>
                <p className="text-sm text-gray-400 mb-4">Current Streak: {streak} days (High Score: {highScore})</p>
                <Button
                  onClick={handleFinanceLog}
                  className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black font-medium w-[200px]"
                >
                  Log Today's Finances
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Buildings Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BUILDING_TYPES.map((building) => (
              <Card key={building.type} className="bg-[#1a2332] border-[#2a3343]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {building.icon}
                      <span className="text-white">{building.name}</span>
                    </div>
                    <Button
                      onClick={() => handleBuild(building)}
                      size="sm"
                      variant="outline"
                      className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
                    >
                      Build
                    </Button>
                  </div>
                  <div className="text-sm text-gray-400">
                    Cost: {building.baseCost.credits} credits, {building.baseCost.fuel} fuel, {building.baseCost.minerals} minerals
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Colony Overview */}
          <Card className="bg-[#1a2332] border-[#2a3343]">
            <CardHeader>
              <h3 className="text-lg font-bold text-white">Colony Buildings ({buildings.length})</h3>
            </CardHeader>
            <CardContent className="p-4">
              {buildings.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  No buildings yet. Build your first structure!
                </div>
              ) : (
                <div className="space-y-4">
                  {buildings.map((building) => (
                    <div key={building.id} className="flex items-center justify-between p-4 bg-[#2a3343] rounded">
                      <div className="flex items-center gap-2">
                        {BUILDING_TYPES.find(b => b.type === building.type)?.icon}
                        <span className="text-white">{building.name} (Level {building.level})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                          Production: +{building.production.credits || 0}c +{building.production.fuel || 0}f +{building.production.minerals || 0}m
                        </div>
                        <Button
                          onClick={() => handleUpgrade(building)}
                          size="sm"
                          variant="outline"
                          className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
                          disabled={building.level >= (BUILDING_TYPES.find(b => b.type === building.type)?.maxLevel || 5)}
                        >
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* End Game Button */}
          <div className="flex justify-center pb-6">
            <Button
              onClick={handleEndGame}
              variant="outline"
              className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
            >
              End Game
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
