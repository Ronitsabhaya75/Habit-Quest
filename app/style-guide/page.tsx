"use client"

import { useState } from "react"
import { AppLayout } from "../../components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { ThemedButton } from "../../components/themed-button"
import { ThemedCard } from "../../components/themed-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import { Star, ShoppingBag, AlertCircle, Calendar, Plus, Activity, Home } from "lucide-react"

export default function StyleGuide() {
  const [activeTab, setActiveTab] = useState("colors")
  
  return (
    <AppLayout 
      title="HabitQuest Style Guide" 
      subtitle="Visual language and UI components used throughout the application"
      userXp={250}
      userLevel={3}
    >
      <div className="mb-8">
        <Tabs defaultValue="colors" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-[rgba(11,26,44,0.8)] border border-[rgba(0,255,198,0.2)]">
            <TabsTrigger 
              value="colors" 
              className={activeTab === "colors" ? "bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520]" : "text-[#B8FFF9]"}
            >
              Colors
            </TabsTrigger>
            <TabsTrigger 
              value="typography" 
              className={activeTab === "typography" ? "bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520]" : "text-[#B8FFF9]"}
            >
              Typography
            </TabsTrigger>
            <TabsTrigger 
              value="buttons" 
              className={activeTab === "buttons" ? "bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520]" : "text-[#B8FFF9]"}
            >
              Buttons
            </TabsTrigger>
            <TabsTrigger 
              value="cards" 
              className={activeTab === "cards" ? "bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520]" : "text-[#B8FFF9]"}
            >
              Cards
            </TabsTrigger>
            <TabsTrigger 
              value="forms" 
              className={activeTab === "forms" ? "bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520]" : "text-[#B8FFF9]"}
            >
              Forms
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "colors" && (
        <Card className="bg-[rgba(11,26,44,0.8)] backdrop-blur-md border-[rgba(0,255,198,0.3)] shadow-[0_0_15px_rgba(0,255,198,0.15)]">
          <CardHeader>
            <CardTitle className="text-xl text-[#B8FFF9]">Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="text-white font-medium">Primary Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-md bg-[#00FFF5] mr-4"></div>
                    <div>
                      <p className="text-white font-medium">Teal</p>
                      <p className="text-gray-400 text-sm">#00FFF5</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-md bg-[#00ffc8] mr-4"></div>
                    <div>
                      <p className="text-white font-medium">Mint</p>
                      <p className="text-gray-400 text-sm">#00ffc8</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-md bg-[#00a6ff] mr-4"></div>
                    <div>
                      <p className="text-white font-medium">Blue</p>
                      <p className="text-gray-400 text-sm">#00a6ff</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-medium">Background Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-md bg-[#0d1520] mr-4"></div>
                    <div>
                      <p className="text-white font-medium">Dark Blue</p>
                      <p className="text-gray-400 text-sm">#0d1520</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-md bg-[#0a1623] mr-4"></div>
                    <div>
                      <p className="text-white font-medium">Navy</p>
                      <p className="text-gray-400 text-sm">#0a1623</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-md bg-[rgba(11,26,44,0.8)] mr-4"></div>
                    <div>
                      <p className="text-white font-medium">Card Background</p>
                      <p className="text-gray-400 text-sm">rgba(11,26,44,0.8)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-medium">Text Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-md bg-white mr-4"></div>
                    <div>
                      <p className="text-white font-medium">White</p>
                      <p className="text-gray-400 text-sm">#FFFFFF</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-md bg-[#B8FFF9] mr-4"></div>
                    <div>
                      <p className="text-white font-medium">Light Teal</p>
                      <p className="text-gray-400 text-sm">#B8FFF9</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-md bg-gray-400 mr-4"></div>
                    <div>
                      <p className="text-white font-medium">Gray</p>
                      <p className="text-gray-400 text-sm">#9CA3AF</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "typography" && (
        <Card className="bg-[rgba(11,26,44,0.8)] backdrop-blur-md border-[rgba(0,255,198,0.3)] shadow-[0_0_15px_rgba(0,255,198,0.15)]">
          <CardHeader>
            <CardTitle className="text-xl text-[#B8FFF9]">Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-white font-medium">Headings</h2>
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-[#00FFF5] drop-shadow-[0_0_10px_rgba(0,255,245,0.3)]">
                    Heading 1
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">text-4xl font-bold text-[#00FFF5] drop-shadow-[0_0_10px_rgba(0,255,245,0.3)]</p>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[#00FFF5]">Heading 2</h2>
                  <p className="text-gray-400 text-sm mt-1">text-3xl font-bold text-[#00FFF5]</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-[#B8FFF9]">Heading 3</h3>
                  <p className="text-gray-400 text-sm mt-1">text-2xl font-semibold text-[#B8FFF9]</p>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-[#B8FFF9]">Heading 4</h4>
                  <p className="text-gray-400 text-sm mt-1">text-xl font-medium text-[#B8FFF9]</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-white font-medium">Body Text</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-white">
                    Base paragraph text. This is the standard text style for paragraphs and general content.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">text-white</p>
                </div>
                <div>
                  <p className="text-[#B8FFF9] opacity-80">
                    Secondary text used for subtitles, descriptions, and supporting information.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">text-[#B8FFF9] opacity-80</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">
                    Small text used for captions, footnotes, and secondary information.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">text-gray-400 text-sm</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "buttons" && (
        <Card className="bg-[rgba(11,26,44,0.8)] backdrop-blur-md border-[rgba(0,255,198,0.3)] shadow-[0_0_15px_rgba(0,255,198,0.15)]">
          <CardHeader>
            <CardTitle className="text-xl text-[#B8FFF9]">Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-white font-medium">Standard Buttons</h3>
                <div className="space-y-4">
                  <div>
                    <Button className="bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520] hover:brightness-110">
                      Primary Button
                    </Button>
                    <p className="text-gray-400 text-sm mt-2">Primary - from-[#00ffc8] to-[#00a6ff]</p>
                  </div>
                  <div>
                    <Button variant="outline" className="border-[rgba(0,255,198,0.3)] text-[#B8FFF9]">
                      Secondary Button
                    </Button>
                    <p className="text-gray-400 text-sm mt-2">Secondary - border-[rgba(0,255,198,0.3)]</p>
                  </div>
                  <div>
                    <Button className="bg-[rgba(0,166,255,0.2)] text-[#B8FFF9] border border-[rgba(0,166,255,0.3)] hover:bg-[rgba(0,166,255,0.3)]">
                      Tertiary Button
                    </Button>
                    <p className="text-gray-400 text-sm mt-2">Tertiary - bg-[rgba(0,166,255,0.2)]</p>
                  </div>
                  <div>
                    <Button className="bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30">
                      Destructive Button
                    </Button>
                    <p className="text-gray-400 text-sm mt-2">Destructive - bg-red-500/20</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-white font-medium">Themed Buttons</h3>
                <div className="space-y-4">
                  <div>
                    <ThemedButton glowEffect>
                      <ShoppingBag className="mr-2 h-4 w-4" /> Primary Themed
                    </ThemedButton>
                    <p className="text-gray-400 text-sm mt-2">Primary with glow effect</p>
                  </div>
                  <div>
                    <ThemedButton variant="outline">
                      Secondary Themed
                    </ThemedButton>
                    <p className="text-gray-400 text-sm mt-2">Secondary outline variant</p>
                  </div>
                  <div>
                    <ThemedButton variant="success" glowEffect>
                      Success Themed
                    </ThemedButton>
                    <p className="text-gray-400 text-sm mt-2">Success variant with glow</p>
                  </div>
                  <div>
                    <ThemedButton disabled>
                      Disabled Themed
                    </ThemedButton>
                    <p className="text-gray-400 text-sm mt-2">Disabled state</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "cards" && (
        <div className="space-y-6">
          <Card className="bg-[rgba(11,26,44,0.8)] backdrop-blur-md border-[rgba(0,255,198,0.3)] shadow-[0_0_15px_rgba(0,255,198,0.15)]">
            <CardHeader>
              <CardTitle className="text-xl text-[#B8FFF9]">Card Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-medium mb-4">Standard Card</h3>
                  <Card className="bg-[rgba(11,26,44,0.8)] border-[rgba(0,255,198,0.3)]">
                    <CardHeader>
                      <CardTitle className="text-[#B8FFF9]">Card Title</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#B8FFF9] opacity-80">
                        This is the standard card component used throughout the application.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-4">Themed Card with Glow</h3>
                  <ThemedCard glowEffect>
                    <div className="pb-2 mb-2 border-b border-[rgba(255,255,255,0.1)]">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-[#B8FFF9]">Themed Card</h3>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-[#B8FFF9] opacity-80 mb-4">
                        This is a themed card with glow effect used for highlighting content.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[#00FFF5] font-bold">100 XP</span>
                        <ThemedButton glowEffect size="sm">
                          <ShoppingBag className="mr-2 h-4 w-4" /> Action
                        </ThemedButton>
                      </div>
                    </div>
                  </ThemedCard>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ThemedCard>
              <div className="flex items-center space-x-4">
                <div className="bg-[rgba(0,255,198,0.1)] p-3 rounded-full">
                  <Home className="h-6 w-6 text-[#00FFF5]" />
                </div>
                <div>
                  <h3 className="text-[#B8FFF9] font-medium">Dashboard</h3>
                  <p className="text-[#B8FFF9] opacity-60 text-sm">View your stats</p>
                </div>
              </div>
            </ThemedCard>

            <ThemedCard>
              <div className="flex items-center space-x-4">
                <div className="bg-[rgba(0,255,198,0.1)] p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-[#00FFF5]" />
                </div>
                <div>
                  <h3 className="text-[#B8FFF9] font-medium">Calendar</h3>
                  <p className="text-[#B8FFF9] opacity-60 text-sm">Track your routine</p>
                </div>
              </div>
            </ThemedCard>

            <ThemedCard>
              <div className="flex items-center space-x-4">
                <div className="bg-[rgba(0,255,198,0.1)] p-3 rounded-full">
                  <Activity className="h-6 w-6 text-[#00FFF5]" />
                </div>
                <div>
                  <h3 className="text-[#B8FFF9] font-medium">Fitness</h3>
                  <p className="text-[#B8FFF9] opacity-60 text-sm">Stay healthy</p>
                </div>
              </div>
            </ThemedCard>
          </div>
        </div>
      )}

      {activeTab === "forms" && (
        <Card className="bg-[rgba(11,26,44,0.8)] backdrop-blur-md border-[rgba(0,255,198,0.3)] shadow-[0_0_15px_rgba(0,255,198,0.15)]">
          <CardHeader>
            <CardTitle className="text-xl text-[#B8FFF9]">Form Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="text-input" className="text-[#B8FFF9] text-base">
                    Text Input
                  </Label>
                  <Input
                    id="text-input"
                    type="text"
                    placeholder="Enter text..."
                    className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] h-12 transition-all focus:ring-2 focus:ring-[#00FFF5]/30 focus:border-[rgba(0,255,198,0.5)]"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="select-input" className="text-[#B8FFF9] text-base">
                    Select Input
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] h-12 transition-all focus:ring-2 focus:ring-[#00FFF5]/30 focus:border-[rgba(0,255,198,0.5)]">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="bg-[rgba(11,26,44,0.95)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9]">
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[#B8FFF9] text-base">Rating Input</Label>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="focus:outline-none transform transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= 3
                              ? "fill-yellow-400 text-yellow-400 filter drop-shadow-[0_0_3px_rgba(250,204,21,0.7)]" 
                              : "text-[#B8FFF9] opacity-40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="textarea-input" className="text-[#B8FFF9] text-base">
                    Textarea Input
                  </Label>
                  <Textarea
                    id="textarea-input"
                    placeholder="Enter longer text..."
                    className="bg-[rgba(21,38,66,0.6)] border-[rgba(0,255,198,0.3)] text-[#B8FFF9] min-h-[120px] transition-all focus:ring-2 focus:ring-[#00FFF5]/30 focus:border-[rgba(0,255,198,0.5)]"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-[#B8FFF9] text-base">Alert/Error Message</h3>
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      This is an error message displayed when form validation fails.
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[#B8FFF9] text-base">Form Submission</h3>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520] hover:brightness-110 font-semibold py-4 rounded-lg transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(0,255,198,0.4)] flex justify-center items-center"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Submit Form
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  )
} 