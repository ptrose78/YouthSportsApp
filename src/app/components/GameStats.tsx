// components/GameStats.tsx
'use client'

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/app/store/hooks";
import { getPlayerStats } from "@/app/store/features/statsSlice";

const GameStats = ({ gameId }: { gameId: string }) => {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useSelector((state: any) => state.stats);

  useEffect(() => {
    dispatch(getPlayerStats(gameId));
  }, [dispatch, gameId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {stats.map((stat: any) => (
        <li key={stat.id}>
          Player: {stat.player_id}, Points: {stat.points}, Rebounds: {stat.rebounds}, Assists:{" "}
          {stat.assists}
        </li>
      ))}
    </ul>
  );
};

export default GameStats;
