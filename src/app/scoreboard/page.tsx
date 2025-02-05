import PlayerForm from "@/app/components/PlayerForm";
import Players from "@/app/components/Players";
import UserForm from "@/app/components/UserForm";
import ActivePlayers from "@/app/components/ActivePlayers";
import GameForm from "@/app/components/GameForm";
import GameManager from "@/app/components/GameManager";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      {/* Main content area */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
        <div className="flex w-full gap-8 ">
          <div className="flex-1 bg-red-100">
            <GameForm />
          </div>
          <div className="flex-1 bg-blue-100">
            <GameManager />
          </div>
        </div>
        {/* Flexbox container for Roster and ActivePlayers */}
        <div className="flex w-full gap-8 p-4 rounded-lg">
          <div className="flex-1 bg-green-100">
            <Players />
            <PlayerForm />
          </div>
          <div className="flex-1 bg-green-100">
            <ActivePlayers />
          </div>
        </div>
        {/* Additional components */}
        
      </main>
    </div>
  );
}
