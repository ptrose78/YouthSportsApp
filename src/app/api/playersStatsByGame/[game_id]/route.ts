import { NextResponse } from "next/server";
import { fetchPlayersStatsByGame } from "@/app/lib/data";

export async function GET(request: Request, context) {
  try {
    const { game_id } = context.params; // No need to await, it's already available

    console.log("game_id:", game_id); 

    if (!game_id) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    // Fetch players for the specific game
    const players = await fetchPlayersStatsByGame(game_id);
    console.log('players', players)

    if (!players || players.length === 0) {
      return NextResponse.json({ error: "No players found for this game" }, { status: 404 });
    }

    return NextResponse.json(players, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}