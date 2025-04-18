"use client"

import { motion, AnimatePresence } from "framer-motion"

interface AstroAssistantProps {
  message: string
  visible: boolean
}

export default function AstroAssistant({ message, visible }: AstroAssistantProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[rgba(0,255,200,0.1)] px-4 py-3 rounded-2xl border border-[rgba(0,255,200,0.3)] backdrop-blur-md max-w-[280px] shadow-[0_5px_15px_rgba(0,0,0,0.2),0_0_10px_rgba(0,255,200,0.3)]"
          initial={{ y: 50, opacity: 0 }}
          animate={{
            y: [0, -15, 0],
            opacity: 1,
            transition: {
              y: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 5,
                ease: "easeInOut",
              },
              opacity: {
                duration: 0.5,
              },
            },
          }}
          exit={{ y: 50, opacity: 0 }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ffc8] to-[#00a3ff] flex items-center justify-center text-xl flex-shrink-0 shadow-[0_0_10px_rgba(0,255,200,0.5)]">
            🧑‍🚀
          </div>
          <div className="text-white text-sm leading-tight">{message}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
