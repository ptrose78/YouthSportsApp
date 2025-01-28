"use client";
import { useState } from "react";
import { useDrop } from "react-dnd";

interface Player {
  id: string | number;
  player_name: string;
}

const ActivePlayers = () => {
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

  const addPlayerToActive = (player: Player) => {
    if (!activePlayers.find((p) => p.id === player.id)) {
      setActivePlayers((prev) => [...prev, player]);
    }
  };

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
            className="bg-green-500 text-white p-4 mb-2 rounded-lg text-center font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {player.player_name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivePlayers;
