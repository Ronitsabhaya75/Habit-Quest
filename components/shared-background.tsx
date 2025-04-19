import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"

interface SharedBackgroundProps {
  rocketLaunching?: boolean
  hyperspaceActive?: boolean
  showConfetti?: boolean
  children?: React.ReactNode
  optimized?: boolean
}

export default function SharedBackground({
  rocketLaunching = false,
  hyperspaceActive = false,
  showConfetti = false,
  children,
  optimized = true
}: SharedBackgroundProps) {
  const [shootingStars, setShootingStars] = useState<any[]>([])

  // Generate twinkling stars with reduced count when optimized
  const twinklingStars = useMemo(() => {
    const starCount = optimized ? 40 : 80;
    const stars = []
    for (let i = 0; i < starCount; i++) {
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
  }, [optimized])

  // Generate larger stars with reduced count when optimized
  const largeStars = useMemo(() => {
    const starCount = optimized ? 12 : 25;
    const stars = []
    for (let i = 0; i < starCount; i++) {
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
  }, [optimized])

  // Generate confetti
  const confetti = useMemo(() => {
    if (!showConfetti) return []

    const pieceCount = optimized ? 25 : 50;
    const pieces = []
    const colors = ["#00ffc8", "#00a3ff", "#0077ff", "#80ffe6", "#ffffff", "#c0ffee"]

    for (let i = 0; i < pieceCount; i++) {
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
  }, [showConfetti, optimized])

  // Create shooting star effect with reduced frequency for optimized mode
  useEffect(() => {
    if (optimized && Math.random() > 0.3) return;
    
    const interval = setInterval(() => {
      const threshold = optimized ? 0.85 : 0.7;
      if (Math.random() > threshold) {
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
    }, optimized ? 3000 : 2000)

    return () => clearInterval(interval)
  }, [optimized])

  return (
    <div className="relative min-h-screen w-full">
      {/* Background gradient */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#1a2233] overflow-hidden z-0">
        {/* Galaxy cloud overlay */}
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_20%_30%,rgba(0,255,200,0.15)_0%,transparent_70%),radial-gradient(ellipse_at_60%_70%,rgba(0,255,200,0.2)_0%,transparent_70%),radial-gradient(ellipse_at_80%_20%,rgba(0,255,200,0.2)_0%,transparent_70%)]"></div>

        {/* Star field - conditionally render based on optimization */}
        {!optimized && (
          <div className="absolute inset-0 w-full h-full opacity-30 animate-galaxy-rotate">
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(2px_2px_at_40px_60px,#ffffff_100%,transparent),radial-gradient(2px_2px_at_20px_50px,#ffffff_100%,transparent),radial-gradient(2px_2px_at_30px_100px,#ffffff_100%,transparent),radial-gradient(2px_2px_at_40px_60px,#ffffff_100%,transparent),radial-gradient(2px_2px_at_110px_90px,#ffffff_100%,transparent),radial-gradient(2px_2px_at_190px_150px,#ffffff_100%,transparent)] bg-repeat bg-[length:200px_200px]"></div>
          </div>
        )}

        {/* Twinkling stars with performance optimization */}
        {twinklingStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              animation: (!optimized || star.size > 1.5) ? `twinkle ${star.duration}s infinite` : 'none',
              animationDelay: `${star.delay}s`,
              boxShadow: `0 0 ${star.size * 2}px ${star.size / 2}px rgba(255, 255, 255, 0.8)`,
              willChange: (!optimized || star.size > 1.5) ? 'opacity' : 'auto',
            }}
          />
        ))}

        {/* Larger stars - fewer in optimized mode */}
        {largeStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,210,70,0.9)_0%,rgba(255,210,70,0)_70%)]"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              animation: `star-glow ${star.duration}s infinite ease-in-out`,
              animationDelay: `${star.delay}s`,
              opacity: 0.7,
              filter: "blur(1px)",
              willChange: "opacity",
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

        {/* Shooting stars - only render when not optimized or just a few */}
        {shootingStars.length > 0 && shootingStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-[100px] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent z-10"
            style={{
              top: star.top,
              left: 0,
              transformOrigin: "left center",
              rotate: `${star.rotation}deg`,
              opacity: 0,
              willChange: "transform, opacity",
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
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
} 