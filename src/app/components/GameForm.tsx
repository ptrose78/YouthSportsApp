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
    <form onSubmit={handleSubmit}>
      <input type="text" name="opponent_name" placeholder="Opponent Name" required />
      <input type="text" name="game_length" placeholder="Game Length" required />
      <button type="submit">Add Game</button>
    </form>
  );
};

export default GameForm;
