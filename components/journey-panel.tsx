"use client"

import { motion } from "framer-motion"

interface JourneyStep {
  icon: string
  title: string
  subtitle: string
  step: number
  iconColor: string
  shadowColor: string
  glowColor: string
}

interface JourneyPanelProps {
  journeySteps: JourneyStep[]
  currentStep: number
  progress: number
  onEarthClick: () => void
}

export default function JourneyPanel({ journeySteps, currentStep, progress, onEarthClick }: JourneyPanelProps) {
  return (
    <div className="w-[240px] h-[400px] bg-[rgba(15,32,39,0.3)] backdrop-blur-xl rounded-l-xl border border-[rgba(0,255,200,0.1)] border-r-0 flex flex-col items-center justify-center p-8 shadow-[-5px_0_20px_rgba(0,0,0,0.2),0_0_15px_rgba(0,255,200,0.1)] relative overflow-hidden transition-all hover:shadow-[-5px_0_25px_rgba(0,0,0,0.3),0_0_20px_rgba(0,255,200,0.2)]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,200,0.05)] via-[rgba(0,180,200,0.05)] to-[rgba(0,255,200,0.05)] opacity-50 z-0"></div>

      {/* Journey path */}
      <div className="absolute left-[20px] top-[40px] bottom-[40px] w-[2px] bg-[rgba(255,255,255,0.2)] z-10">
        {/* Progress indicator */}
        <motion.div
          className="absolute top-0 left-[-1px] w-[4px] bg-gradient-to-b from-[rgba(0,255,200,1)] to-[rgba(0,163,255,1)] shadow-[0_0_10px_rgba(0,255,200,0.8),0_0_20px_rgba(0,255,200,0.4)]"
          initial={{ height: "0%" }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        />

        {/* End point */}
        <div className="absolute bottom-0 left-[-4px] w-[10px] h-[10px] bg-[rgba(0,255,200,1)] rounded-full shadow-[0_0_15px_rgba(0,255,200,0.8)] opacity-80"></div>
      </div>

      {/* Journey steps */}
      {journeySteps.map((step) => (
        <motion.div
          key={step.step}
          className={`w-full relative flex items-center py-4 transition-all z-20 ${
            currentStep === step.step
              ? "opacity-100 scale-105 translate-x-[10px] filter drop-shadow-[0_0_8px_rgba(0,255,200,0.5)]"
              : currentStep > step.step
                ? "opacity-80"
                : "opacity-50"
          } ${step.step === 1 ? "cursor-pointer" : ""}`}
          initial={currentStep === step.step ? { opacity: 0, y: 10 } : {}}
          animate={currentStep === step.step ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onClick={step.step === 1 ? onEarthClick : undefined}
          whileHover={step.step === 1 ? { scale: 1.08, x: 5 } : {}}
        >
          {/* Step icon */}
          <div
            className={`w-[40px] h-[40px] rounded-full bg-gradient-to-br ${
              !currentStep || currentStep < step.step ? "bg-[rgba(20,27,56,0.6)]" : step.iconColor
            } flex items-center justify-center text-xl text-white mr-[10px] border-2 ${
              currentStep === step.step
                ? "border-[rgba(255,255,255,0.8)] animate-pulse-glow"
                : "border-[rgba(0,255,200,0.3)]"
            } relative z-30`}
            style={{
              boxShadow: currentStep === step.step ? `0 0 15px ${step.shadowColor}` : "none",
            }}
          >
            {step.icon}

            {/* Glow effect */}
            {currentStep === step.step && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full z-[-1] transition-all duration-500"
                style={{ background: `radial-gradient(circle, ${step.glowColor} 0%, transparent 70%)` }}
              />
            )}
          </div>

          {/* Step text */}
          <div className="flex-1 text-left">
            <div className="text-[0.9rem] font-semibold text-white font-orbitron text-shadow-[0_0_5px_rgba(0,255,200,0.5)]">
              {step.title}
            </div>
            <div className="text-[0.7rem] text-[rgba(255,255,255,0.7)] mt-[0.2rem]">{step.subtitle}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
