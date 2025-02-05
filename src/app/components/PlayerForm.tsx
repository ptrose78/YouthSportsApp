'use client'

import React, { useState } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { getPlayers } from "@/app/store/features/dataSlice";

const savePlayerToRoster = async (player_name: string) => {
  try {
    const response = await fetch("/api/createPlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_name }),
    });

    if (!response.ok) throw new Error("Failed to save player to roster.");
    const result = await response.json();
    console.log("Player added:", result);
  } catch (error) {
    console.error("Error adding player:", error);
  }
};

const PlayerForm = () => {
  const [playerName, setPlayerName] = useState("");
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Save the player to the database
      if (playerName) {
        await savePlayerToRoster(playerName);
        setPlayerName("");

        // Refresh the roster
        await dispatch(getPlayers());
      }
    } catch (error) {
      console.error("Error saving player:", error);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form 
        onSubmit={handleSubmit} 
        className="rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-4">Add New Player</h2>

        <div className="mb-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition duration-300"
        >
          Add Player
        </button>
      </form>
    </div>
  );
};

export default PlayerForm;
