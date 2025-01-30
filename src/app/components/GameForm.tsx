'use client'

import { setCurrentGame } from '@/app/store/features/dataSlice';
import { useDispatch } from 'react-redux';

const GameForm = () => {
  const dispatch = useDispatch();

  const saveGame = async (opponent_name: string, game_length: number) => {
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponent_name, game_length }),
      });

      if (!response.ok) throw new Error("Failed to save game information.");

      const data = await response.json();
      console.log("Game saved successfully:", data);

      // Dispatch the game to Redux
      dispatch(setCurrentGame(data));

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
    <div className="flex justify-center items-center bg-gray-100">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Add New Game</h2>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">Opponent Name</label>
          <input 
            type="text" 
            name="opponent_name" 
            placeholder="Enter opponent name" 
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">Game Length (Minutes)</label>
          <input 
            type="number" 
            name="game_length" 
            placeholder="Enter game length" 
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
  );
};

export default GameForm;
