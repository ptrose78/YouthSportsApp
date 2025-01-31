"use client";

import { useEffect } from "react";
import { useDrop } from "react-dnd";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { getLatestStats, savePlayerStats } from "../lib/data";
import {
  selectActivePlayers,
  selectTimeLeft,
  addPlayerToGlobalActive,
  removePlayerFromGlobalActive,
} from "../store/features/dataSlice";

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

  // Add player to active players
  const addPlayerToActive = async (player: Player) => {
    if (activePlayers.find((p) => p.player_id === player.player_id)) return;

    try {
      const latestStats = await getLatestStats(player.player_id);
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
  const removePlayerFromActive = async (playerId: string, player: Player) => {
    
    // Save player stats to database
    await savePlayerStats(player.player_id, {
      points: player.points,
      rebounds: player.rebounds,
      assists: player.assists,
      time_played: player.time_played,
    });
    
    // Remove player from global active players
    dispatch(removePlayerFromGlobalActive(player));
  };

  // Save player stats when time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      activePlayers.forEach(async (player) => {
        try {
          await savePlayerStats(player.player_id, {
            points: player.points,
            rebounds: player.rebounds,
            assists: player.assists,
            time_played: player.time_played,
          });
        } catch (error) {
          console.error(`Error saving stats for ${player.player_name}:`, error);
        }
      });
    }
  }, [timeLeft, activePlayers]);

  // Update player's stats in global active players
  const handleStatUpdate = (player: Player, statName: 'points' | 'rebounds' | 'assists' | 'time_played', newValue: number) => {
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
      <h1 className="text-center text-2xl font-bold mb-4">Active Players</h1>

      <div className="list-none">
        {activePlayers.map((player) => {
          return (
            <div
              key={player.id.toString()}
              className="relative bg-purple-500 text-white p-4 mb-4 rounded-lg"
            >
              <h3>{player.player_name}</h3>
              <button
                onClick={() => removePlayerFromActive(player.player_id, player)}
                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded"
              >
                X
              </button>
              <div>Time on Court: {formatTime(player.time_played)}</div>

              <div className="grid grid-cols-3 gap-4 mt-2">
                {/* Points */}
                <div className="flex flex-col items-center">
                  <div className="text-sm text-gray-100">Points</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatUpdate(player, "points", player.points + 1)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-1 rounded"
                    >
                      +
                    </button>
                    <span className="text-lg font-bold">{player.points}</span>
                    <button
                      onClick={() => handleStatUpdate(player, "points", Math.max(player.points - 1, 0))}
                      className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-2 py-1 rounded"
                    >
                      -
                    </button>
                  </div>
                </div>

                {/* Rebounds */}
                <div className="flex flex-col items-center">
                  <div className="text-sm text-gray-100">Rebounds</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatUpdate(player, "rebounds", player.rebounds + 1)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-1 rounded"
                    >
                      +
                    </button>
                    <span className="text-lg font-bold">{player.rebounds}</span>
                    <button
                      onClick={() => handleStatUpdate(player, "rebounds", Math.max(player.rebounds - 1, 0))}
                      className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-2 py-1 rounded"
                    >
                      -
                    </button>
                  </div>
                </div>

                {/* Assists */}
                <div className="flex flex-col items-center">
                  <div className="text-sm text-gray-100">Assists</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatUpdate(player, "assists", player.assists + 1)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-1 rounded"
                    >
                      +
                    </button>
                    <span className="text-lg font-bold">{player.assists}</span>
                    <button
                      onClick={() => handleStatUpdate(player, "assists", Math.max(player.assists - 1, 0))}
                      className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-2 py-1 rounded"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}