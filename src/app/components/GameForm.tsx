'use client'

import { setCurrentGame, getGames } from '@/app/store/features/dataSlice';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

const GameForm = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const dispatch = useDispatch();

  const saveGame = async (opponent_name: string, game_length: number) => {
    try {
      const response = await fetch("/api/createGame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponent_name, game_length }),
      });

      if (!response.ok) throw new Error("Failed to save game information.");

      const data = await response.json();

      if (data.refresh) {
        dispatch(getGames() as any); // Re-fetch the games
        console.log("Games fetched successfully:", data.games);
      }

      // Dispatch the game to Redux
      dispatch(setCurrentGame(data.game));

      // Collapse the form after submitting
      setIsFormVisible(false);  // Hide the form after successful submission

    } catch (error) {
      console.error("Error adding game:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const opponent_name = formData.get("opponent_name") as string;
    const game_length = formData.get("game_length") as string;

    // Save the game
    saveGame(opponent_name, Number(game_length));

    // Reset form
    e.currentTarget.reset();
  };

  return (
    <div className="flex flex-col items-center mb-4">
      <div className="w-full max-w-md bg-red-100">
        {/* Title with toggle functionality */}
        <h2 
          className="text-3xl font-bold text-center text-gray-700 mb-2 mt-2 mr-2 ml-2 cursor-pointer"
          onClick={() => setIsFormVisible(!isFormVisible)}  // Toggle the form visibility
        >
          Add New Game
        </h2>

        {/* Form section that only takes space when visible */}
        <div 
          className={`transition-all duration-500 ease-in-out ${isFormVisible ? 'max-h-[500px] p-6' : 'max-h-0 p-0 overflow-hidden'}`}
        >
          <form onSubmit={handleSubmit} className="rounded-lg w-full">
            <div className="mb-4">
              <input 
                type="text" 
                name="opponent_name" 
                placeholder="Enter opponent name" 
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-4">
              <input 
                type="number" 
                name="game_length" 
                placeholder="Enter game length (mins)" 
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-300"
            >
              Add Game
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameForm;
