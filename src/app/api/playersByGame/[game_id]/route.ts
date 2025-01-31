import { NextRequest, NextResponse } from 'next/server';
import { fetchPlayersByGame } from "@/app/lib/data";  // Your function to fetch players by game

export async function GET(req: NextRequest, { params }: { params: { game_id: string } }) {
  const { game_id } = params;

  console.log("game_id:", game_id); // This will output the value of the dynamic parameter


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
