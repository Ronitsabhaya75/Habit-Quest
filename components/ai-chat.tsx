"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useAuth } from "../context/auth-context"
import { X, MessageCircle, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIMessage {
  message: string;
  action?: {
    type: 'addTask' | 'completeTask' | 'showProgress';
    payload?: any;
  };
}

interface AIChatProps {
  onTaskUpdate?: (taskId: string | number, completed: boolean) => void;
  onAddTask?: (date: Date, task: { title: string, completed: boolean }) => void;
  activeTasks?: Array<{ id: string | number, title: string, completed: boolean }>;
}

export default function AIChat({ onTaskUpdate, onAddTask, activeTasks = [] }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now().toString(),
        text: user?.name 
          ? `Hello ${user.name}! I'm your Golden Warrior assistant. How can I help you today?` 
          : "Hello! I'm your Golden Warrior assistant. How can I help you today?",
        sender: 'ai' as const,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, user, messages.length])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  const toggleChat = () => {
    setIsOpen(prev => !prev)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      sendMessage()
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date()
    }
    
    const userInput = input.trim();
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      console.log("Sending to AI:", userInput);
      console.log("Active tasks:", activeTasks);
      
      // Send message to API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput,
          activeTasks: activeTasks,
          messages: messages.map(m => ({ text: m.text, sender: m.sender }))
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.status}`)
      }

      const data = await response.json()
      console.log("AI response:", data);
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || "I didn't understand that. Can you try rephrasing?",
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])

      // Handle any actions from the AI
      if (data.action) {
        console.log("Processing AI action:", data.action);
        handleAIAction(data.action)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIAction = (action: AIMessage['action']) => {
    if (!action) return
    console.log("Handling AI action:", action);

    switch (action.type) {
      case 'addTask':
        if (onAddTask && action.payload?.title) {
          console.log("Adding task:", action.payload.title);
          const date = action.payload.date ? new Date(action.payload.date) : new Date()
          onAddTask(date, {
            title: action.payload.title,
            completed: false
          })
        } else {
          console.warn("Cannot add task: missing handler or title", { onAddTask, payload: action.payload });
        }
        break
      case 'completeTask':
        if (onTaskUpdate && action.payload?.taskId !== undefined) {
          console.log("Completing task:", action.payload.taskId);
          onTaskUpdate(action.payload.taskId, true)
        } else {
          console.warn("Cannot complete task: missing handler or taskId", { onTaskUpdate, payload: action.payload });
        }
        break
      default:
        console.warn("Unknown action type:", action.type);
        break
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 z-50"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[70vh] max-h-[500px] rounded-lg shadow-xl overflow-hidden flex flex-col bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-gray-800 z-40"
          >
            {/* Chat Header */}
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>Golden Warrior Assistant</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleChat}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-grow focus-visible:ring-indigo-500"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
