'use client'

import PlayerForm from "@/app/components/PlayerForm";
import Players from "@/app/components/Players";
import ActivePlayers from "@/app/components/ActivePlayers";
import GameForm from "@/app/components/GameForm";
import GameManager from "@/app/components/GameManager";
import NavBar from "@/app/components/NavBar";
import { PacmanLoader } from 'react-spinners';
import { useState } from "react";

export default function Scoreboard() {
  const [playersLoading, setPlayersLoading] = useState(false);

  const handlePlayersLoading = (isLoading) => {
    setPlayersLoading(isLoading);
  };

  return (
    <div>
      <NavBar />
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 sm:p-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-screen-xl mx-auto">
          <h1 className="text-5xl font-semibold mb-4">Scoreboard</h1>

          <div className="flex flex-col w-full gap-8">
            <div className="w-full">
              <GameForm />
            </div>
            <div className="w-full bg-blue-100">
              <GameManager />
            </div>
          </div>

          <div className="flex w-full gap-8 p-4 rounded-lg">
            <div className="flex-1 bg-green-100 relative">
              {playersLoading && (
                <div className="absolute inset-0 flex justify-center items-center bg-gray-200/50">
                  <PacmanLoader color="#36d7b7" size={20} />
                </div>
              )}
              <Players onLoading={handlePlayersLoading} />
              <PlayerForm />
            </div>
            <div className="flex-1">
              <ActivePlayers />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}