'use client'

import React, { useState } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { getPlayers } from "@/app/store/features/dataSlice";

const savePlayerToRoster = async (player_name: string) => {
  
  try {
    const response = await fetch("/api/player", {
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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Player Name"
        required
      />
      <button type="submit">Add Player</button>
    </form>
  );
};

export default PlayerForm;
