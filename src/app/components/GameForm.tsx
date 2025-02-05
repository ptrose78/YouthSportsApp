'use client'

import { setCurrentGame, getGames } from '@/app/store/features/dataSlice';
import { useDispatch } from 'react-redux';

const GameForm = () => {
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
    <div className="flex justify-center items-center mb-4">
      <form 
        onSubmit={handleSubmit} 
        className="rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-4">Add New Game</h2>

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
            placeholder="Enter game length in minutes" 
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
