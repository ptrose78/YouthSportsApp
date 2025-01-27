'use client'

import React, { useState } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { savePlayer } from "@/app/lib/data";
import { getRoster } from "@/app/store/features/rosterSlice";

const savePlayerToRoster = async (player_name: string) => {
  try {
    const response = await fetch("/api/roster", {
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

const RosterForm = () => {
  const [playerName, setPlayerName] = useState("");
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Save the player to the database
      await savePlayerToRoster(playerName); // Pass the actual `team_id`
      setPlayerName("");

      // Refresh the roster
      dispatch(getRoster());
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

export default RosterForm;
