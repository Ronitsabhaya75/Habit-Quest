'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { GameWrapper } from './game-wrapper';
import { toast } from '../ui/use-toast';

// Constants for game dimensions
const canvasWidth = 400;
const canvasHeight = 300;
const cellSize = 20;

// Interface for grid-based entity positions
interface Entity {
  x: number;
  y: number;
}

export function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);  // Ref to the canvas element
  const gameRef = useRef<HTMLDivElement>(null);       // Ref to focus the game div for keyboard input

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Entities in the game
  const [pacman, setPacman] = useState<Entity>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Entity>({ x: 1, y: 0 });
  const [dots, setDots] = useState<Entity[]>([]);
  const [ghost, setGhost] = useState<Entity>({ x: 15, y: 5 });

  // Generate all dots at the beginning
  useEffect(() => {
    const dotArray: Entity[] = [];
    for (let x = 0; x < canvasWidth / cellSize; x++) {
      for (let y = 0; y < canvasHeight / cellSize; y++) {
        dotArray.push({ x, y });
      }
    }
    setDots(dotArray);
  }, []);

  // Handle arrow key input for Pacman movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Game loop: updates and rendering
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const gameLoop = () => {
      // Move Pacman
      setPacman((prev) => {
        const next = {
          x: prev.x + direction.x,
          y: prev.y + direction.y,
        };

        // Check wall collision
        if (
          next.x < 0 ||
          next.x >= canvasWidth / cellSize ||
          next.y < 0 ||
          next.y >= canvasHeight / cellSize
        ) {
          handleEndGame();
          return prev;
        }

        // Check ghost collision
        if (next.x === ghost.x && next.y === ghost.y) {
          handleEndGame();
          return prev;
        }

        // Eat dot if present
        setDots((prevDots) => {
          const remaining = prevDots.filter(
            (dot) => dot.x !== next.x || dot.y !== next.y
          );
          if (remaining.length < prevDots.length) {
            setScore((s) => s + 10);
          }
          return remaining;
        });

        return next;
      });

      // Move ghost toward Pacman (simple tracking AI)
      setGhost((prev) => {
        const dx = pacman.x - prev.x;
        const dy = pacman.y - prev.y;
        return {
          x: prev.x + Math.sign(dx),
          y: prev.y + Math.sign(dy),
        };
      });

      // Clear canvas and redraw
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw all dots
      ctx.fillStyle = '#fff';
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(
          dot.x * cellSize + cellSize / 2,
          dot.y * cellSize + cellSize / 2,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      // Draw Pacman (yellow arc)
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(
        pacman.x * cellSize + cellSize / 2,
        pacman.y * cellSize + cellSize / 2,
        10,
        0.2 * Math.PI,
        1.8 * Math.PI
      );
      ctx.lineTo(pacman.x * cellSize + cellSize / 2, pacman.y * cellSize + cellSize / 2);
      ctx.fill();

      // Draw ghost (red square)
      ctx.fillStyle = '#f00';
      ctx.fillRect(ghost.x * cellSize, ghost.y * cellSize, cellSize, cellSize);

      // Schedule next frame
      animationFrame = requestAnimationFrame(gameLoop);
    };

    animationFrame = requestAnimationFrame(gameLoop);

    // Cleanup on exit
    return () => cancelAnimationFrame(animationFrame);
  }, [gameStarted, pacman, ghost, direction, dots]);

  // Start game handler
  const handleStartGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setPacman({ x: 5, y: 5 });
    setGhost({ x: 15, y: 5 });
    gameRef.current?.focus(); // Focus the container so keypresses are registered
  };

  // End game and award XP
  const handleEndGame = () => {
    setGameStarted(false);
    setGameOver(true);
    const xp = Math.min(10, Math.floor(score * 0.2));
    toast({ title: 'Game Over', description: `You earned ${xp} XP!` });
  };

  return (
    <GameWrapper
      title="Pacman"
      description="Move around, eat dots, avoid the ghost!"
      gameStarted={gameStarted}
      gameOver={gameOver}
      score={score}
      onStart={handleStartGame}
      onEnd={handleEndGame}
      customControls={
        <div className="text-sm text-gray-400 text-center mb-2">
          Arrow keys to move. Avoid the ghost!
        </div>
      }
    >
      <div
        ref={gameRef}
        tabIndex={0}
        className="outline-none"
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border border-[#4cc9f0] rounded-lg"
        />
      </div>
    </GameWrapper>
  );
}
