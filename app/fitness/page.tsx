"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { MainLayout } from "../../components/main-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { FitnessPlan } from "../../components/fitness-plan"
import { DietPlan } from "../../components/diet-plan"

export default function Fitness() {
  const [showForm, setShowForm] = useState(true)
  const [activeTab, setActiveTab] = useState("workout")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowForm(false)
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Fitness</h1>
        <p className="text-gray-400">Get personalized fitness and diet plans</p>
      </div>

      {showForm ? (
        <Card className="bg-[#1a2332]/80 border-[#2a3343]">
          <CardHeader>
            <CardTitle className="text-xl text-white">Your Fitness Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-white">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    className="bg-[#2a3343] border-[#3a4353] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-white">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    className="bg-[#2a3343] border-[#3a4353] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white">
                    Age
                  </Label>
                  <Input id="age" type="number" placeholder="30" className="bg-[#2a3343] border-[#3a4353] text-white" />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Gender</Label>
                  <RadioGroup defaultValue="male" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="gender-male" className="text-[#4cc9f0]" />
                      <Label htmlFor="gender-male" className="text-white">
                        Male
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="gender-female" className="text-[#4cc9f0]" />
                      <Label htmlFor="gender-female" className="text-white">
                        Female
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="gender-other" className="text-[#4cc9f0]" />
                      <Label htmlFor="gender-other" className="text-white">
                        Other
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Activity Level</Label>
                <Select>
                  <SelectTrigger className="bg-[#2a3343] border-[#3a4353] text-white">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3343] text-white">
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Lightly active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very-active">Very active (very hard exercise daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Fitness Goal</Label>
                <Select>
                  <SelectTrigger className="bg-[#2a3343] border-[#3a4353] text-white">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3343] text-white">
                    <SelectItem value="lose">Lose weight</SelectItem>
                    <SelectItem value="maintain">Maintain weight</SelectItem>
                    <SelectItem value="gain">Gain weight</SelectItem>
                    <SelectItem value="muscle">Build muscle</SelectItem>
                    <SelectItem value="endurance">Improve endurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">
                Generate Plans
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="workout" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-[#2a3343]">
              <TabsTrigger
                value="workout"
                className={activeTab === "workout" ? "bg-[#4cc9f0] text-black" : "text-white"}
              >
                Workout Plan
              </TabsTrigger>
              <TabsTrigger value="diet" className={activeTab === "diet" ? "bg-[#4cc9f0] text-black" : "text-white"}>
                Diet Plan
              </TabsTrigger>
            </TabsList>
            <TabsContent value="workout">
              <Card className="bg-[#1a2332]/80 border-[#2a3343]">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Your Personalized Workout Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <FitnessPlan />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="diet">
              <Card className="bg-[#1a2332]/80 border-[#2a3343]">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Your Personalized Diet Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <DietPlan />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
              onClick={() => setShowForm(true)}
            >
              Edit Profile
            </Button>
          </div>
        </>
      )}
    </MainLayout>
  )
}
