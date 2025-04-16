"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const chatHistory = [
  {
    id: 1,
    sender: "bot",
    message: "Hello! I'm your AI assistant. How can I help you with your tasks today?",
  },
  {
    id: 2,
    sender: "user",
    message: "I need to add a task for tomorrow",
  },
  {
    id: 3,
    sender: "bot",
    message: "What task would you like to add for tomorrow?",
  },
]

export function ChatBot() {
  const [messages, setMessages] = useState(chatHistory)

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto p-2">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`flex items-start space-x-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className={message.sender === "user" ? "bg-[#4cc9f0]" : "bg-purple-500"}>
                {message.sender === "user" ? "U" : "AI"}
              </AvatarFallback>
            </Avatar>
            <div
              className={`rounded-lg p-3 ${
                message.sender === "user" ? "bg-[#4cc9f0] text-black" : "bg-[#2a3343] text-white"
              }`}
            >
              {message.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
