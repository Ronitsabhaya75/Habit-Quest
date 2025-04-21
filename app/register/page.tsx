"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "../../context/auth-context"
import RegisterForm from "../../components/register-form"
import JourneyPanel from "../../components/journey-panel"
import SpaceBackground from "../../components/space-background"
import AstroAssistant from "../../components/astro-assistant"

export default function RegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [currentJourneyStep, setCurrentJourneyStep] = useState(1)
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantMessage, setAssistantMessage] = useState("")
  const [rocketLaunching, setRocketLaunching] = useState(false)
  const [hyperspaceActive, setHyperspaceActive] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const containerRef = useRef(null)

  // Journey steps data
  const journeySteps = useMemo(
    () => [
      {
        icon: "🌍",
        title: "Earth",
        subtitle: "Start Your Journey",
        step: 1,
        iconColor: "from-[#00ffc8] to-[#00a3ff]",
        shadowColor: "rgba(0, 255, 200, 0.7)",
        glowColor: "rgba(0, 255, 200, 0.2)",
      },
      {
        icon: "🚀",
        title: "Rocket Launch",
        subtitle: "Create Your Account",
        step: 2,
        iconColor: "from-[#ff4da6] to-[#a100ff]",
        shadowColor: "rgba(255, 77, 166, 0.7)",
        glowColor: "rgba(255, 77, 166, 0.2)",
      },
      {
        icon: "🌠",
        title: "Enter Orbit",
        subtitle: "Set Goals",
        step: 3,
        iconColor: "from-[#00a3ff] to-[#0051ff]",
        shadowColor: "rgba(0, 163, 255, 0.7)",
        glowColor: "rgba(0, 163, 255, 0.2)",
      },
    ],
    [],
  )

  // Calculate journey progress
  const journeyProgress = useMemo(() => {
    const totalSteps = journeySteps.length
    const completedSteps = Math.max(0, currentJourneyStep - 1)
    return Math.min(100, (completedSteps / Math.max(1, totalSteps - 1)) * 100)
  }, [currentJourneyStep, journeySteps])

  // Set assistant messages based on step
  useEffect(() => {
    if (step === 1 && currentJourneyStep === 1) {
      const timer = setTimeout(() => {
        setAssistantMessage("Welcome, explorer! Pick a cool name — the galaxy will remember you!")
        setShowAssistant(true)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (step === 2 && currentJourneyStep === 2) {
      setAssistantMessage("Almost there! Create a strong password to secure your cosmic journey.")
      setShowAssistant(true)
    }
  }, [step, currentJourneyStep])

  // Update journey step based on form step
  useEffect(() => {
    setCurrentJourneyStep(step)
  }, [step])

  // Redirect if authenticated
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Handle Earth icon click to go back to step 1
  const handleEarthClick = () => {
    if (step !== 1) {
      setStep(1)
      setCurrentJourneyStep(1)
      setAssistantMessage("Welcome back to Earth! Let's restart your cosmic journey.")
      setShowAssistant(true)
    }
  }

  // Handle successful form submission
  const handleSuccess = () => {
    setAssistantMessage("Initiating launch sequence... Stand by!")
    setShowAssistant(true)

    // Launch rocket animation
    setRocketLaunching(true)
    setTimeout(() => {
      // Create hyperspace effect
      setHyperspaceActive(true)
    }, 1000)

    // Show success animation
    setTimeout(() => {
      setShowConfetti(true)
      setCurrentJourneyStep(3)
      setAssistantMessage("Congratulations, explorer! Your journey begins now!")
    }, 1500)

    // Navigate to dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 3500)
  }

  // Handle form step change
  const handleStepChange = (newStep) => {
    setStep(newStep)
  }

  // Handle assistant message update
  const handleAssistantMessage = (message) => {
    setAssistantMessage(message)
    setShowAssistant(true)
  }

  return (
    <div className="relative min-h-screen overflow-hidden" ref={containerRef}>
      {/* Space Background with stars and animations */}
      <SpaceBackground
        rocketLaunching={rocketLaunching}
        hyperspaceActive={hyperspaceActive}
        showConfetti={showConfetti}
      />

      {/* AI Assistant */}
      <AstroAssistant message={assistantMessage} visible={showAssistant} />

      {/* Home Button */}
      <Link
        href="/"
        className="absolute top-4 right-4 z-50 bg-[rgba(0,255,200,0.2)] text-white border border-[rgba(0,255,200,0.4)] px-4 py-2 rounded-lg backdrop-blur-md transition-all hover:bg-[rgba(0,255,200,0.4)] hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(0,255,200,0.5)] font-orbitron"
      >
        Home Base
      </Link>

      {/* Main Content */}
      <motion.div
        className={`flex items-center justify-center min-h-screen py-8 relative z-10 ${hyperspaceActive ? "animate-hyperspace" : ""}`}
        animate={hyperspaceActive ? { scale: 2, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* Journey Panel */}
        <JourneyPanel
          journeySteps={journeySteps}
          currentStep={currentJourneyStep}
          progress={journeyProgress}
          onEarthClick={handleEarthClick}
        />

        {/* Register Form */}
        <RegisterForm
          step={step}
          onStepChange={handleStepChange}
          onSuccess={handleSuccess}
          onAssistantMessage={handleAssistantMessage}
        />
      </motion.div>

      {/* User Count */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[rgba(20,27,56,0.6)] text-white px-4 py-2 rounded-full backdrop-blur-md border border-[rgba(0,255,200,0.2)] shadow-md flex items-center gap-2 text-sm">
        <span>👥</span> Over 12,500 explorers have joined
      </div>
    </div>
  )
}
