"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { MainLayout } from "../../components/main-layout"
import { Button } from "../../components/ui/button"
import { ChessGame } from "../../components/games/chess-game"
import { QuizGame } from "../../components/games/quiz-game"
import { WordScrambler } from "../../components/games/word-scrambler"
import { SpinWheel } from "../../components/games/spin-wheel"
import { PacmanGame } from "../../components/games/pacman-game"
import { MemoryGame } from "../../components/games/memory-game"
import { Badge } from "../../components/ui/badge"
import { Search } from "lucide-react"
import Link from "next/link"

// Enhanced CSS for space animations with more visibility
const spaceAnimationsCSS = `
  /* Ensure the animations container covers the whole viewport */
  .animations-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
  }

  .nebula {
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: radial-gradient(circle at 30% 30%, rgba(138, 43, 226, 0.2), transparent 60%), 
                radial-gradient(circle at 70% 70%, rgba(0, 191, 255, 0.2), transparent 60%),
                radial-gradient(circle at 20% 80%, rgba(255, 105, 180, 0.2), transparent 50%);
    animation: moveNebula 60s linear infinite;
    filter: blur(80px);
    opacity: 0.15;
    z-index: 0;
  }

  @keyframes moveNebula {
    0% { transform: translate(0, 0); }
    50% { transform: translate(20px, 30px); }
    100% { transform: translate(0, 0); }
  }

  .asteroid {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.5);
    opacity: 0.6;
    z-index: 1;
  }

  .asteroid-1 {
    top: 10%;
    left: 10%;
    animation: moveAsteroid1 15s linear infinite;
  }

  .asteroid-2 {
    top: 50%;
    left: 80%;
    animation: moveAsteroid2 20s linear infinite;
  }

  .asteroid-3 {
    top: 80%;
    left: 30%;
    animation: moveAsteroid3 25s linear infinite;
  }

  @keyframes moveAsteroid1 {
    0% { transform: translate(0, 0); }
    50% { transform: translate(100px, 50px) rotate(180deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }

  @keyframes moveAsteroid2 {
    0% { transform: translate(0, 0); }
    50% { transform: translate(-120px, 70px) rotate(180deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }

  @keyframes moveAsteroid3 {
    0% { transform: translate(0, 0); }
    50% { transform: translate(80px, -60px) rotate(180deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }

  .star {
    position: absolute;
    background: white;
    border-radius: 50%;
    opacity: 0;
    z-index: 1;
    animation: twinkle 4s infinite ease-in-out;
  }

  @keyframes twinkle {
    0% { opacity: 0; transform: scale(0.8); }
    50% { opacity: 0.8; transform: scale(1.2); }
    100% { opacity: 0; transform: scale(0.8); }
  }

  .comet {
    position: absolute;
    top: 20%;
    left: -50px;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 20px 4px rgba(255, 255, 255, 0.7), 
                -100px 0px 50px 1px rgba(255, 255, 255, 0.5);
    animation: flyComet 4s ease-out forwards;
    z-index: 2;
  }

  @keyframes flyComet {
    0% { transform: translate(0, 0); opacity: 1; }
    100% { transform: translate(150vw, 40vh); opacity: 0; }
  }
  
  .game-card {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    z-index: 10;
  }
  
  .game-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 20px rgba(76, 201, 240, 0.6);
  }
  
  .game-card:hover::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(to right, #4cc9f0, #3a0ca3, #4cc9f0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0.8;
    z-index: 0;
    animation: borderGlow 2s infinite;
  }
  
  @keyframes borderGlow {
    0% { opacity: 0.4; }
    50% { opacity: 0.9; }
    100% { opacity: 0.4; }
  }
  
  .play-button {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .play-button:hover {
    box-shadow: 0 0 15px rgba(76, 201, 240, 0.7);
  }
  
  .play-button::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(76, 201, 240, 0.6) 0%, rgba(0, 0, 0, 0) 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }
  
  .play-button:hover::after {
    opacity: 1;
    animation: pulseGlow 2s infinite;
  }
  
  @keyframes pulseGlow {
    0% { transform: scale(0.8); opacity: 0.4; }
    50% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(0.8); opacity: 0.4; }
  }

  /* Updated navigation bar styles to match image 1 exactly */
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    background-color: #0D0D2B;
    border-bottom: 1px solid rgba(42, 51, 67, 0.8);
  }

  .navbar-brand {
    color: #4cc9f0;
    font-size: 1.25rem;
    font-weight: 600;
    text-decoration: none;
  }

  .navbar-center {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    justify-content: center;
  }

  .nav-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
    opacity: 0.7;
    text-decoration: none;
    font-size: 0.75rem;
    transition: all 0.2s ease;
  }

  .nav-link:hover {
    opacity: 1;
  }

  .nav-link.active {
    color: #4cc9f0;
    opacity: 1;
  }

  .nav-link .icon {
    margin-bottom: 0.25rem;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .search-container {
    position: relative;
  }

  .search-input {
    background-color: rgba(42, 51, 67, 0.8);
    border: none;
    border-radius: 9999px;
    padding: 0.5rem 1rem 0.5rem 2.5rem;
    color: white;
    width: 12rem;
    font-size: 0.875rem;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.5);
  }

  .level-badge {
    background-color: rgba(76, 201, 240, 0.2);
    border: 1px solid #4cc9f0;
    color: #4cc9f0;
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .user-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    background-color: #4cc9f0;
    color: #0D0D2B;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }
`;

export default function BreakthroughGame() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [showComet, setShowComet] = useState(true)
  const [stars, setStars] = useState<Array<{id: number, top: string, left: string, size: string, delay: string}>>([])
  
  // Create stars with specific positions
  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      delay: `${Math.random() * 3}s`
    }));
    setStars(newStars);
    
    // Reset comet animation every 10 seconds
    const cometInterval = setInterval(() => {
      setShowComet(false);
      setTimeout(() => setShowComet(true), 100);
    }, 10000);
    
    return () => clearInterval(cometInterval);
  }, []);
  
  const games = [
    {
      id: "chess",
      name: "Chess",
      description: "Test your strategic thinking",
      component: ChessGame,
      icon: "♟️",
      difficulty: "hard"
    },
    {
      id: "quiz",
      name: "Quiz Game",
      description: "Test your knowledge",
      component: QuizGame,
      icon: "❓",
      difficulty: "easy"
    },
    {
      id: "wordscrambler",
      name: "Word Scrambler",
      description: "Unscramble words quickly",
      component: WordScrambler,
      icon: "🔤",
      difficulty: "medium"
    },
    {
      id: "spinwheel",
      name: "Spin Wheel",
      description: "Try your luck",
      component: SpinWheel,
      icon: "🎡",
      difficulty: "easy"
    },
    {
      id: "memory",
      name: "Memory Match",
      description: "Find matching pairs",
      component: MemoryGame,
      icon: "🧠",
      difficulty: "medium"
    },
  ]
  
  const GameComponent = activeGame ? games.find((game) => game.id === activeGame)?.component : null
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D2B] to-[#0f172a] text-white relative overflow-hidden">
      {/* Add style tag for animations */}
      <style dangerouslySetInnerHTML={{ __html: spaceAnimationsCSS }} />
      
      {/* Animation Elements in a container */}
      <div className="animations-container">
        <div className="nebula"></div>
        
        {/* Fixed position asteroids */}
        <div className="asteroid asteroid-1"></div>
        <div className="asteroid asteroid-2"></div>
        <div className="asteroid asteroid-3"></div>
        
        {/* Dynamic stars */}
        {stars.map((star) => (
          <div 
            key={star.id} 
            className="star" 
            style={{ 
              top: star.top, 
              left: star.left, 
              width: star.size, 
              height: star.size,
              animationDelay: star.delay
            }}
          />
        ))}
        
        {/* Comet that appears periodically */}
        {showComet && <div className="comet"></div>}
      </div>
      
      {/* New navigation bar matching Image 1 exactly with centered navigation */}
      <header className="navbar relative z-10">
        <Link href="/" className="navbar-brand">HabitQuest</Link>
        
        <div className="navbar-center">
          <Link href="/dashboard" className="nav-link">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
            </div>
            <span>Dashboard</span>
          </Link>
          
          <Link href="/breakthrough-game" className="nav-link active">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <span>Mini Games</span>
          </Link>
          
          <Link href="/calendar" className="nav-link">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <span>Calendar</span>
          </Link>
          
          <Link href="/habits" className="nav-link">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              </svg>
            </div>
            <span>Habit Creation</span>
          </Link>
          
          <Link href="/fitness" className="nav-link">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.9 7.27a2.53 2.53 0 0 0-3.5.34l-1.5 1.67a2.49 2.49 0 0 0-.27 2.89 2.51 2.51 0 0 0-2.9.31l-1.51 1.69a2.49 2.49 0 0 0-.22 2.81l.07.09M5.83 11.5l2.91-2.91m-2.45 8.46l3.97-3.97M10.17 5.09l3.97-3.97"/>
              </svg>
            </div>
            <span>Fitness</span>
          </Link>
          
          <Link href="/shop" className="nav-link">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
            </div>
            <span>Shop</span>
          </Link>
          
          <Link href="/review" className="nav-link">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <span>Review</span>
          </Link>
        </div>
        
        <div className="navbar-right">
          <div className="search-container">
            <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="search" 
              placeholder="Search..." 
              className="search-input" 
            />
          </div>
          <div className="user-avatar">
            U
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Breakthrough Games</h1>
          <p className="text-gray-400">Play games to earn XP and break through your limits</p>
        </div>
        
        {!activeGame ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card
                key={game.id}
                className="game-card bg-[#1a2332]/80 border-[#2a3343] transition-all cursor-pointer backdrop-blur-sm"
                onClick={() => setActiveGame(game.id)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{game.icon}</span>
                    <CardTitle className="text-xl text-white">{game.name}</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">Difficulty:</span>
                    <Badge
                      className={
                        game.difficulty === "easy"
                          ? "bg-green-500"
                          : game.difficulty === "hard"
                            ? "bg-red-500"
                            : "bg-[#4cc9f0]"
                      }
                    >
                      {game.difficulty}
                    </Badge>
                  </div>
                  <Button className="play-button w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black">Play Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-[#1a2332]/80 border-[#2a3343] backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{games.find((game) => game.id === activeGame)?.icon}</span>
                <CardTitle className="text-xl text-white">{games.find((game) => game.id === activeGame)?.name}</CardTitle>
              </div>
              <Button
                variant="outline"
                className="bg-[#2a3343] hover:bg-[#3a4353] text-white border-[#3a4353]"
                onClick={() => setActiveGame(null)}
              >
                Back to Games
              </Button>
            </CardHeader>
            <CardContent>{GameComponent && <GameComponent />}</CardContent>
          </Card>
        )}
      </main>
      
      <footer className="border-t border-[#2a3343] p-4 text-center text-gray-400 text-sm relative z-10">
        © 2025 HabitQuest. All rights reserved.
      </footer>
    </div>
  )
}