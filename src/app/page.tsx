import RosterForm from "@/app/components/PlayerForm";
import Players from "@/app/components/Players";
import UserForm from "@/app/components/UserForm";
import ActivePlayers from "./components/ActivePlayers";
import GameForm from "@/app/components/GameForm";
import Clock from "@/app/components/Clock";
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Main content area */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
        <div className="flex flex-col items-center w-full">
          <UserForm />
          <RosterForm />
          <GameForm />
        </div>
        {/* Flexbox container for Roster and ActivePlayers */}
        <div className="flex w-full gap-8">
          <div className="flex-1">
            <Players />
          </div>
          <div className="flex-1">
            <ActivePlayers />
          </div>
        </div>
        {/* Additional components */}
        <Clock />
      </main>
    </div>
  );
}
