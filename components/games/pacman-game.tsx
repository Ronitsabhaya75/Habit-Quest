"use client";

import { useRouter } from 'next/navigation';

export const PacmanGame = () => {
  const router = useRouter();
  
  const handlePlayGame = () => {
    router.push('/mini-games/pacman');
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Pac-Man</h2>
      <p className="mb-6">The classic arcade game. Navigate through the maze, collect all dots and avoid the ghosts!</p>
      <button 
        onClick={handlePlayGame}
        className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full transition-all"
      >
        Launch Game
      </button>
      
      <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
        <h3 className="text-xl mb-2">How to Play:</h3>
        <ul className="text-left list-disc list-inside">
          <li>Use arrow keys to move Pac-Man through the maze</li>
          <li>Collect all dots to complete the level</li>
          <li>Avoid ghosts or you'll lose a life</li>
          <li>Collect power pills to temporarily hunt the ghosts</li>
          <li>Press 'P' to pause the game</li>
        </ul>
      </div>
    </div>
  );
};
