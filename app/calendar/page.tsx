"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MainLayout } from "@/components/main-layout"
import { ChatBot } from "@/components/chat-bot"
import { TaskList } from "@/components/task-list"
import { Plus, Send } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showChatbot, setShowChatbot] = useState(false)

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Calendar Tracker</h1>
        <p className="text-gray-400">Manage your tasks and track your habits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1a2332]/80 border-[#2a3343]">
          <CardHeader>
            <CardTitle className="text-xl text-white">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-[#2a3343] bg-[#1a2332]"
            />
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
                onClick={() => setShowChatbot(!showChatbot)}
              >
                {showChatbot ? "Hide Chatbot" : "Show Chatbot"}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a2332] border-[#2a3343] text-white">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Input placeholder="Task name" className="bg-[#2a3343] border-[#3a4353] text-white" />
                    </div>
                    <div className="space-y-2">
                      <Input type="datetime-local" className="bg-[#2a3343] border-[#3a4353] text-white" />
                    </div>
                    <Button className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">Save Task</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-[#1a2332]/80 border-[#2a3343]">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Tasks for {date?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showChatbot ? (
              <div className="space-y-4">
                <ChatBot />
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask about your tasks or add a new one..."
                    className="bg-[#2a3343] border-[#3a4353] text-white"
                  />
                  <Button className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <TaskList date={date} />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
