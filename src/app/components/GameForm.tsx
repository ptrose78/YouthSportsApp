'use client';

import { useEffect, useState } from "react";
import { getGames, getPlayers, getTeams, getUsers } from "../store/features/dataSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import useSetSiteData from "@/app/hooks/useSetSiteData";

interface SiteData {
  user_id?: string;
  team_id?: string;
  player_id?: string;
  game_id?: string;
}

const GameForm = () => {
  // const dispatch = useAppDispatch();
  // const users = useAppSelector((state) => state.data.users);
  // const teams = useAppSelector((state) => state.data.teams);
  // const games = useAppSelector((state) => state.data.games);
  // const players = useAppSelector((state) => state.data.players);
  
  // const setSiteData = useSetSiteData();
  

   // Fetch data on mount
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       await dispatch(getUsers());
  //       await dispatch(getTeams());
  //       await dispatch(getGames());
  //       await dispatch(getPlayers());
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };
  //   fetchData();
  // }, [dispatch]);

  // // Update `siteData` when users, teams, players, or games change
  // useEffect(() => {
  //   console.log("users:", users)
  //   console.log("teams:", teams)
    
  //   if (users.length && teams.length) {
  //     setSiteData((prev: SiteData) => ({
  //       user_id: users[0]?.id || prev.user_id || '',
  //       team_id: teams[0]?.id || prev.team_id || '',
  //       player_id: players[0]?.id || prev.team_id || '',
  //       game_id: prev.game_id || '',
  //     }));
  //   }
  // }, [users, teams, players]);
  
  const saveGame = async (opponent_name: string) => {
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponent_name }),
      });

      if (!response.ok) throw new Error("Failed to save game information.");

      const data = await response.json();
      console.log("Game saved successfully:", data);

    } catch (error) {
      console.error("Error adding game:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const opponent_name = formData.get("opponent_name") as string;

    // Save the game
    saveGame(opponent_name);

    // Reset form
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="opponent_name" placeholder="Opponent Name" required />
      <button type="submit">Add Game</button>
    </form>
  );
};

export default GameForm;
