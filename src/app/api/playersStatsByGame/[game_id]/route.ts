import { NextResponse } from "next/server";
import { fetchPlayersStatsByGame } from "@/app/lib/data";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request, { params }: { params: Promise<{ game_id: string }> }) {
  try {
    const auth_result = await auth();
    const userId = auth_result?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const game_id  = (await params).game_id; 

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