'use client';

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { getGames } from "@/app/store/features/dataSlice";

const Games = () => {
  const dispatch = useAppDispatch();
  const { games, loading, error } = useAppSelector((state) => state.data);
  const currentGameId = useAppSelector((state) => state.data.currentGameId);

  // Fetch games when the component mounts
  useEffect(() => {
    dispatch(getGames());
  }, [dispatch]);

  const currentGame = games.find((game) => game.id === currentGameId);

  if (loading) return <p className="text-center">Loading games...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-center text-2xl font-bold mb-4">Games</h2>
      {currentGame && (
        <div className="mt-8 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Current Game: {currentGame.opponent}</h3>
          <p className="text-gray-600">Game ID: {currentGame.id}</p>
          <p className="text-gray-600">Length: {currentGame.length} minutes</p>
        </div>
      )}
    </div>
  );
};

export default Games;
