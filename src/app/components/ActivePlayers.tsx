"use client";

import { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import { useAppDispatch } from "@/app/store/hooks";
import { getLatestStats, savePlayerStats } from "../lib/data";
import { useSelector } from "react-redux";
import { 
  selectGameClock, 
  selectIsGameRunning, 
  startGameClock, 
  stopGameClock, 
  incrementGameClock 
} from "../store/features/dataSlice"; 

interface Player {
  id: string | number;
  player_name: string;
  points: number;
  rebounds: number;
  assists: number;
  game_id: string;
  player_id: string;
}

const ActivePlayers = () => {
  const dispatch = useAppDispatch();
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [playerTimers, setPlayerTimers] = useState<Record<string, number>>({});

  const gameClock = useSelector(selectGameClock);
  const isGameRunning = useSelector(selectIsGameRunning);

  // Drop player into active players list
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

  // Increment game clock and update player timers
  useEffect(() => {
    if (!isGameRunning) return;

    const interval = setInterval(() => {
      dispatch(incrementGameClock());
      setPlayerTimers((prevTimers) =>
        Object.fromEntries(
          Object.entries(prevTimers).map(([playerId, time]) => [
            playerId,
            time + 1,
          ])
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameRunning, dispatch]);

  // Add player to active players list
  const addPlayerToActive = async (player: Player) => {
    if (activePlayers.find((p) => p.player_id === player.player_id)) return;

    try {
      const latestStats = await getLatestStats(player.player_id);
      const updatedPlayer = {
        ...player,
        points: latestStats?.[0]?.points ?? 0,
        rebounds: latestStats?.[0]?.rebounds ?? 0,
        assists: latestStats?.[0]?.assists ?? 0,
        time_played: playerTimers[player.player_id] || 0,
      };

      setActivePlayers((prev) => [...prev, updatedPlayer]);
      setPlayerTimers((prev) => ({ ...prev, [player.player_id]: 0 }));
    } catch (err) {
      console.error("Error adding player:", err);
    }
  };

  // Remove player from active players list and save stats
  const removePlayerFromActive = async (playerId: string, player: Player) => {
    setActivePlayers((prev) => prev.filter((p) => p.player_id !== playerId));
    setPlayerTimers((prev) => {
      const { [player.id]: _, ...rest } = prev;
      return rest;
    });    

    // Save stats to database
    await savePlayerStats(player.player_id, {
      points: player.points,
      rebounds: player.rebounds,
      assists: player.assists,
      time_played: playerTimers[player.id] || 0,
    });
  };

  const toggleGameClock = () => {
    isGameRunning ? dispatch(stopGameClock()) : dispatch(startGameClock());
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  // Render component
  return (
    <div
      ref={dropRef as unknown as React.RefObject<HTMLDivElement>}
      className={`border-2 border-dashed p-4 rounded-lg min-h-[200px] ${
        isOver ? "bg-gray-200" : "bg-white"
      }`}
    >
      <h1 className="text-center text-2xl font-bold mb-4">Active Players</h1>

      {/* Game Clock Controls */}
      <button
        onClick={toggleGameClock}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg mx-auto block"
      >
        {isGameRunning ? "Pause Game" : "Start Game"}
      </button>

      {/* Display Game Clock */}
      <div className="text-center text-lg font-bold">
        Game Clock: {formatTime(gameClock)}
      </div>

      {/* Active Players List */}
      <div className="list-none">
        {activePlayers.map((player) => (
          <div key={player.id.toString()} className="relative bg-purple-500 text-white p-4 mb-4 rounded-lg">
            <h3>{player.player_name}</h3>
            <button onClick={() => removePlayerFromActive(player.player_id, player)}className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded">X</button>
            <div>Time on Court: {formatTime(playerTimers[player.id] || 0)}</div>

            <div className="grid grid-cols-3 gap-4 mt-2">
              {/* Points */}
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-100">Points</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setActivePlayers((prev) =>
                        prev.map((p) =>
                          p.id === player.id ? { ...p, points: p.points + 1 } : p
                        )
                      )
                    }
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <span className="text-lg font-bold">{player.points}</span>
                  <button
                    onClick={() =>
                      setActivePlayers((prev) =>
                        prev.map((p) =>
                          p.id === player.id ? { ...p, points: Math.max(p.points - 1, 0) } : p
                        )
                      )
                    }
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
                    onClick={() =>
                      setActivePlayers((prev) =>
                        prev.map((p) =>
                          p.id === player.id ? { ...p, rebounds: p.rebounds + 1 } : p
                        )
                      )
                    }
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <span className="text-lg font-bold">{player.rebounds}</span>
                  <button
                    onClick={() =>
                      setActivePlayers((prev) =>
                        prev.map((p) =>
                          p.id === player.id ? { ...p, rebounds: Math.max(p.rebounds - 1, 0) } : p
                        )
                      )
                    }
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
                    onClick={() =>
                      setActivePlayers((prev) =>
                        prev.map((p) =>
                          p.id === player.id ? { ...p, assists: p.assists + 1 } : p
                        )
                      )
                    }
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <span className="text-lg font-bold">{player.assists}</span>
                  <button
                    onClick={() =>
                      setActivePlayers((prev) =>
                        prev.map((p) =>
                          p.id === player.id ? { ...p, assists: Math.max(p.assists - 1, 0) } : p
                        )
                      )
                    }
                    className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-2 py-1 rounded"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivePlayers;
