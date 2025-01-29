"use client";
import { useState } from "react";
import { useDrop } from "react-dnd";
import { useAppDispatch } from "@/app/store/hooks";
import { getPlayers } from "@/app/store/features/dataSlice";
import { savePlayerStats } from "../lib/data";
import { supabase } from "../lib/supabaseClient";

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

  const addPlayerToActive = async (player: Player) => {
    if (activePlayers.find((p) => p.player_id === player.player_id)) {
      return; // Prevent duplicate entries
    }
  
    try {
      // Fetch the latest stats from Supabase using player_id
      const { data: latestStats, error } = await supabase
        .from("players")
        .select("points, rebounds, assists")
        .eq("player_id", player.player_id)
        .order("created_at", { ascending: false }) // Get the latest entry
        .limit(1)
        .single();
  
      if (error) {
        console.error("Error fetching latest stats:", error.message);
        return;
      }
  
      // Merge the latest stats with the player object
      const updatedPlayer = {
        ...player,
        points: latestStats?.points || 0,
        rebounds: latestStats?.rebounds || 0,
        assists: latestStats?.assists || 0,
      };
  
      // Add player to active list
      setActivePlayers((prev) => [...prev, updatedPlayer]);
    } catch (err) {
      console.error("Error adding player to active list:", err);
    }
  };

  const updateStat = (playerId: string | number, stat: string, change: number) => {
    setActivePlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, [stat]: (player as any)[stat] + change } : player
      )
    );
  };

  async function removePlayer(playerId : string | number, player: Player) {
    console.log("Player:", player);
    setActivePlayers((prev) =>
    prev.filter((player)=>player.id !== playerId)
    )
  
    await savePlayerStats(player.player_id, {
      points: player.points,
      rebounds: player.rebounds,
      assists: player.assists,
    });
  }

  return (
    <div
      ref={dropRef as unknown as React.RefObject<HTMLDivElement>}
      className={`border-2 border-dashed p-4 rounded-lg min-h-[200px]
         ${isOver ? "bg-gray-200" : "bg-white"}`}
    >
      <h2 className="text-center text-lg font-bold mb-4">Active Players</h2>
      <div className="list-none">
        {activePlayers.map((player) => (
          <div
            key={player.id}
            className="bg-purple-500 text-white p-4 mb-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold mb-4">{player.player_name}</h3>
            <button onClick={()=>removePlayer(player.id, player)}>x</button>
            <div className="grid grid-cols-3 gap-4">
              {/* Points */}
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-100">Points</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStat(player.id, "points", 1)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <span className="text-lg font-bold">{player.points}</span>
                  <button
                    onClick={() => updateStat(player.id, "points", -1)}
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
                    onClick={() => updateStat(player.id, "rebounds", 1)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <span className="text-lg font-bold">{player.rebounds}</span>
                  <button
                    onClick={() => updateStat(player.id, "rebounds", -1)}
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
                    onClick={() => updateStat(player.id, "assists", 1)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <span className="text-lg font-bold">{player.assists}</span>
                  <button
                    onClick={() => updateStat(player.id, "assists", -1)}
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
