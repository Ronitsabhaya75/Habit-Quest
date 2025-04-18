"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"

interface SpaceBackgroundProps {
  rocketLaunching?: boolean
  hyperspaceActive?: boolean
  showConfetti?: boolean
}

export default function SpaceBackground({
  rocketLaunching = false,
  hyperspaceActive = false,
  showConfetti = false,
}: SpaceBackgroundProps) {
  const [shootingStars, setShootingStars] = useState<any[]>([])

  // Generate twinkling stars
  const twinklingStars = useMemo(() => {
    const stars = []
    for (let i = 0; i < 80; i++) {
      stars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 3 + 1,
        delay: Math.random() * 3,
        opacity: Math.random() * 0.5 + 0.3,
      })
    }
    return stars
  }, [])

  // Generate larger stars
  const largeStars = useMemo(() => {
    const stars = []
    for (let i = 0; i < 25; i++) {
      stars.push({
        id: i,
        top: `${Math.random() * 90}%`,
        left: `${Math.random() * 90}%`,
        size: Math.random() * 40 + 10,
        duration: Math.random() * 5 + 2,
        delay: Math.random() * 5,
      })
    }
    return stars
  }, [])

  // Generate confetti
  const confetti = useMemo(() => {
    if (!showConfetti) return []

    const pieces = []
    const colors = ["#00ffc8", "#00a3ff", "#0077ff", "#80ffe6", "#ffffff", "#c0ffee"]

    for (let i = 0; i < 50; i++) {
      const left = Math.random() * 100
      const top = Math.random() * 20
      const color = colors[Math.floor(Math.random() * colors.length)]
      const delay = Math.random() * 1.5
      const size = Math.random() * 8 + 5
      const shape = Math.floor(Math.random() * 4)

      pieces.push({
        id: i,
        color,
        left: `${left}%`,
        top: `${top}%`,
        delay,
        size,
        shape,
      })
    }

    return pieces
  }, [showConfetti])

  // Create shooting star effect randomly
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const starId = Date.now()
        const newShootingStar = {
          id: starId,
          top: `${Math.random() * 50}%`,
          rotation: Math.random() * 60 + 30,
          duration: Math.random() * 2 + 1,
          delay: 0,
        }

        setShootingStars((prev) => [...prev, newShootingStar])

        // Remove shooting star after animation
        const timeoutId = setTimeout(() => {
          setShootingStars((prev) => prev.filter((star) => star.id !== starId))
        }, 3000)

        return () => clearTimeout(timeoutId)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Background gradient */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#1a2233] overflow-hidden">
        {/* Galaxy cloud overlay */}
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_20%_30%,rgba(0,255,200,0.15)_0%,transparent_70%),radial-gradient(ellipse_at_60%_70%,rgba(0,255,200,0.2)_0%,transparent_70%),radial-gradient(ellipse_at_80%_20%,rgba(0,255,200,0.2)_0%,transparent_70%)]"></div>

        {/* Star field */}
        <div className="absolute inset-0 w-full h-full opacity-30 animate-galaxy-rotate">
          <div className="absolute inset-0 w-full h-full bg-[radial-gradient(2px_2px_at_40px_60px,#ffffff_100%,transparent),radial-gradient(2px_2px_at_20px_50px,#ffffff_100%,transparent),radial-gradient(2px_2px_at_30px_100px,#ffffff_100%,transparent),radial-gradient(2px_2px_at_40px_60px,#ffffff_100%,transparent),radial-gradient(2px_2px_at_110px_90px,#ffffff_100%,transparent),radial-gradient(2px_2px_at_190px_150px,#ffffff_100%,transparent)] bg-repeat bg-[length:200px_200px]"></div>
        </div>

        {/* Twinkling stars */}
        {twinklingStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              boxShadow: `0 0 ${star.size * 2}px ${star.size / 2}px rgba(255, 255, 255, 0.8)`,
            }}
          />
        ))}

        {/* Larger stars */}
        {largeStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,210,70,0.9)_0%,rgba(255,210,70,0)_70%)] animate-star-glow"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              opacity: 0.7,
              filter: "blur(1px)",
            }}
          >
            <span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[rgba(255,210,70,0.9)] filter blur-[0.5px]"
              style={{ fontSize: `${star.size * 0.8}px` }}
            >
              ★
            </span>
          </div>
        ))}

        {/* Shooting stars */}
        {shootingStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-[100px] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent z-10"
            style={{
              top: star.top,
              left: 0,
              transformOrigin: "left center",
              rotate: `${star.rotation}deg`,
              opacity: 0,
            }}
            animate={{
              x: ["0%", "200%"],
              y: ["0%", "200%"],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: star.duration,
              ease: "linear",
              times: [0, 0.1, 0.7, 1],
            }}
          >
            <div className="absolute top-[-1px] right-0 w-[15px] h-[4px] rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.7)]"></div>
          </motion.div>
        ))}

        {/* Rocket */}
        <motion.div
          className="absolute z-20 text-[28px]"
          style={{
            top: rocketLaunching ? "80%" : "30%",
            left: "15%",
            rotate: rocketLaunching ? "45deg" : "0deg",
          }}
          animate={rocketLaunching ? { y: [-0, -1000], opacity: [1, 0] } : { y: [0, -15, 0] }}
          transition={
            rocketLaunching
              ? { duration: 2, ease: "easeOut" }
              : { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
          }
        >
          🚀
        </motion.div>

        {/* Comet tail for rocket */}
        {rocketLaunching && (
          <div
            className="absolute w-[40px] h-[60px] bg-gradient-to-t from-[rgba(0,255,200,0.8)] via-[rgba(215,255,240,0.4)] to-transparent rounded-t-full opacity-80 blur-[5px] z-10"
            style={{
              top: "33%",
              left: "13%",
              transform: "rotate(225deg) scale(0.6)",
            }}
          />
        )}

        {/* Progress circle */}
        <div className="absolute bottom-[15%] right-[10%] w-[80px] h-[80px] rounded-full border-3 border-[rgba(0,255,200,0.2)] border-t-[rgba(0,255,200,0.8)] animate-slow-rotate z-10 shadow-[0_0_15px_rgba(0,255,200,0.3)]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle,rgba(0,255,200,0.2)_0%,transparent_70%)]"></div>
        </div>

        {/* Confetti */}
        {showConfetti &&
          confetti.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute z-50"
              style={{
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                backgroundColor: piece.color,
                left: piece.left,
                top: piece.top,
                clipPath:
                  piece.shape === 0
                    ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                    : // triangle
                      piece.shape === 1
                      ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                      : // diamond
                        piece.shape === 2
                        ? "circle(50% at 50% 50%)"
                        : // circle
                          "none", // square
              }}
              initial={{ opacity: 0, y: 0, rotate: 0 }}
              animate={{ opacity: [0, 1, 0], y: ["0vh", "100vh"], rotate: [0, 720] }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                delay: piece.delay,
              }}
            />
          ))}

        {/* Scenery with mountains */}
        <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-[rgba(48,56,97,0.2)] to-transparent z-10">
          <div className="absolute bottom-0 left-[5%] w-[30%] h-[80%] bg-gradient-to-br from-[#3b4874] to-[#2b3a67] opacity-70 clip-path-mountain1"></div>
          <div className="absolute bottom-0 right-[15%] w-[40%] h-[90%] bg-gradient-to-br from-[#2b3a67] to-[#1a2233] opacity-70 clip-path-mountain2"></div>
        </div>
      </div>
    </>
  )
}
