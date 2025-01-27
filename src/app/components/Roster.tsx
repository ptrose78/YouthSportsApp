'use client'

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { getRoster } from "../store/features/rosterSlice";

const Roster = () => {
  const dispatch = useAppDispatch();
  const { players, loading, error } = useAppSelector((state) => state.roster);
  console.log(players);

  useEffect(() => {
    dispatch(getRoster());
  }, [dispatch]);

  if (loading) return <p>Loading roster...</p>;
  if (error) return <p>Error loading roster: {error}</p>;

  return (
    <ul>
      {players.map((player) => (
        <li key={player.id}>{player.player_name}</li>
      ))}
    </ul>
  );
};

export default Roster;
