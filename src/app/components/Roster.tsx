'use client';

import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag } from "react-dnd";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { getRoster } from "../store/features/rosterSlice";

const DraggablePlayer = ({ player }: { player: { id: string | number; player_name: string } }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "PLAYER",
    item: player,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <li
      ref={dragRef as unknown as React.RefObject<HTMLLIElement>}
      className={`${
        isDragging ? 'bg-gray-300' : 'bg-blue-500'
      } text-white p-4 rounded-lg text-center font-bold text-xl cursor-grab shadow-lg ${
        isDragging ? 'transform scale-105 shadow-xl' : 'shadow-sm'
      } transition-transform transition-shadow my-2`}
    >
      {player.player_name}
    </li>
  );
};

const Roster = () => {
  const dispatch = useAppDispatch();
  const { players, loading, error } = useAppSelector((state) => state.roster);

  useEffect(() => {
    dispatch(getRoster());
  }, [dispatch]);

  if (loading) return <p className="text-center">Loading roster...</p>;
  if (error) return <p className="text-center text-red-500">Error loading roster: {error}</p>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 bg-gray-100 rounded-lg">
        <h2 className="text-center mb-4 text-xl font-semibold">Roster</h2>
        <ul className="list-none p-0">
          {players.map((player) => (
            <DraggablePlayer 
              key={player.id} 
              player={{ id: player.id, player_name: player.player_name }} 
            />
          ))}
        </ul>
      </div>
    </DndProvider>
  );
};

export default Roster;
