
import { fetchPlayersByGame } from "@/app/lib/data"; 
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest, context) { 
  const game_id = context.params.game_id; // Access params directly

  console.log("game_id:", game_id); 

  if (!game_id) {
    return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
  }

  try {
    // Fetch players for the specific game
    const players = await fetchPlayersByGame(game_id);

    if (!players || players.length === 0) {
      return NextResponse.json({ error: "No players found for this game" }, { status: 404 });
    }

    return NextResponse.json(players, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
