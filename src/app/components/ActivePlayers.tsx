"use client";

import { useEffect } from "react";
import { useDrop } from "react-dnd";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  selectActivePlayers,
  selectTimeLeft,
  addPlayerToGlobalActive,
  removePlayerFromGlobalActive,
} from "../store/features/dataSlice";
import { postPlayerStats } from "../lib/data";

interface Player {
  id: string | number;
  player_name: string;
  points: number;
  rebounds: number;
  assists: number;
  game_id: string;
  player_id: string;
  time_played: number;
}

export default function ActivePlayers() {
  const dispatch = useAppDispatch();

  // Global state
  const activePlayers = useAppSelector(selectActivePlayers);
  const timeLeft = useAppSelector(selectTimeLeft);

  // DnD
  const [{ isOver }, dropRef] = useDrop<Player, void, { isOver: boolean }>({
    accept: "PLAYER",
    drop: (item) => {
      if (activePlayers.length >= 5) {
        alert("Maximum number of active players reached.");
        return;
      }
      addPlayerToActive(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Fetch player stats
  const fetchPlayerStats = async (playerId: string) => {
    try {
      const res = await fetch(`/api/getPlayerStats?playerId=${playerId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      console.log("res:",res)
      if (!res.ok) throw new Error("Failed to fetch player stats");

      return await res.json();
    } catch (error) {
      console.error("Error fetching player stats:", error);
      return null;
    }
  };

  // Add player to active players
  const addPlayerToActive = async (player: Player) => {
    if (activePlayers.find((p) => p.player_id === player.player_id)) return;

    try {
      const latestStats = await fetchPlayerStats(player.player_id);
      const updatedPlayer = {
        ...player,
        points: latestStats?.[0]?.points ?? 0,
        rebounds: latestStats?.[0]?.rebounds ?? 0,
        assists: latestStats?.[0]?.assists ?? 0,
        time_played: latestStats?.[0]?.time_played || 0,
      };

      dispatch(addPlayerToGlobalActive(updatedPlayer));
    } catch (err) {
      console.error("Error adding player:", err);
    }
  };

  // Remove player from active players
  const removePlayerFromActive = async (player: Player) => {
    try {
       // Save player stats to database
       const stats = {
        points: player.points,
        rebounds: player.rebounds,
        assists: player.assists,
        time_played: player.time_played,
       }

       const res = await fetch("/api/postPlayerStats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player.player_id,
          stats: stats,
        }),
       });

      if (!res.ok) throw new Error("Failed to post player stats");

      dispatch(removePlayerFromGlobalActive(player));
    } catch (error) {
      console.error("Error removing player:", error);
    }
  };

  // Save player stats when time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      activePlayers.forEach(async (player) => {
        try {
          const stats = {
            points: player.points,
            rebounds: player.rebounds,
            assists: player.assists,
            time_played: player.time_played,
          }

          await fetch("/api/postPlayerStats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playerId: player.player_id,
              stats: stats,
            }),
          });
        } catch (error) {
          console.error(`Error saving stats for ${player.player_name}:`, error);
        }
      });
    }
  }, [timeLeft, activePlayers]);

  // Update player's stats in global active players
  const handleStatUpdate = (
    player: Player,
    statName: "points" | "rebounds" | "assists" | "time_played",
    newValue: number
  ) => {
    dispatch(addPlayerToGlobalActive({ ...player, [statName]: newValue }));
  };

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Render
  return (
    <div
      ref={dropRef as unknown as React.RefObject<HTMLDivElement>}
      className={`border-2 border-dashed p-4 rounded-lg min-h-[200px] ${
        isOver ? "bg-gray-200" : "bg-white"
      }`}
    >
      <h1 className="text-center text-3xl font-bold mb-4 text-gray-700">Active Players</h1>

      <div className="list-none">
        {activePlayers.map((player) => (
          <div key={player.player_id.toString()} className="relative bg-purple-500 text-white p-4 mb-4 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">{player.player_name}</h3>
            <button
              onClick={() => removePlayerFromActive(player)}

              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded"
            >
              X
            </button>
            <div>
              Time on Court: <span className="text-lg font-bold">{formatTime(player.time_played)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              {["points", "rebounds", "assists"].map((stat) => (
                <div key={stat} className="flex flex-col items-center">
                  <div className="text-sm text-gray-100">
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleStatUpdate(player, stat as any, player[stat as keyof Player] + 1)
                      }
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-1 rounded"
                    >
                      +
                    </button>
                    <span className="text-lg font-bold">{player[stat as keyof Player]}</span>
                    <button
                      onClick={() =>
                        handleStatUpdate(
                          player,
                          stat as any,
                          Math.max(player[stat as keyof Player] - 1, 0)
                        )
                      }
                      className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-2 py-1 rounded"
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-center text-lg mb-4">
        Drop a player here to add them to the game
      </h2>
    </div>
  );
}
