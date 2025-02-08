'use client';

import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag } from "react-dnd";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { getPlayers, deletePlayer } from "../store/features/dataSlice";

interface Player {
  id: string | number;
  game_id: string;
  team_id: string;
  player_name: string;
  points: number;
  rebounds: number;
  assists: number;
  time_played: number;
  player_id: string;
}


const DraggablePlayer = ({ player }: { player: Player }) => {
  const dispatch = useAppDispatch();
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "PLAYER",
    item: player,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleDelete = async (player: Player) => {
    await dispatch(deletePlayer(player.player_id));
    console.log("Player deleted");

    const response = await fetch("/api/deletePlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: player.player_id }),
    });
    console.log("Response:", response);

    if (!response.ok) {
      console.error("Failed to delete player");
    }

    dispatch(getPlayers());
  };

  return (
    <li 
      ref={dragRef as unknown as React.RefObject<HTMLLIElement>}

      className={`${
        isDragging ? 'bg-gray-300' : 'bg-red-500'
      } text-white p-4 rounded-lg text-center font-bold text-xl cursor-grab shadow-lg ${
        isDragging ? 'transform scale-105 shadow-xl' : 'shadow-sm'
      } transition-transform transition-shadow my-2 relative`} 

    >
      {player.player_name}
      <button className="absolute top-1 right-2 text-black-900" onClick={() => handleDelete(player)}>X</button>


    </li>

  );
};

const Players = () => {
  const dispatch = useAppDispatch();
  const { players, loading, error } = useAppSelector((state) => state.data);

  useEffect(() => {
    dispatch(getPlayers());
  }, [dispatch]);

  if (loading) return <p className="text-center">Loading roster...</p>;
  if (error) return <p className="text-center text-red-500">Error loading roster: {error}</p>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 rounded-lg border-b border-gray-300">
        <h2 className="text-center mb-4 text-3xl font-bold text-gray-700">Roster</h2>
        <ul className="list-none p-0 ">

          {players.map((player) => (
              <DraggablePlayer 
              key={player.player_id} 
              player={player} 
            />

          ))}
        </ul>
      </div>
    </DndProvider>
  );
};

export default Players;
