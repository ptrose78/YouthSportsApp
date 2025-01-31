import { createGame, createPlayer } from "@/app/lib/data";
import { NextResponse } from "next/server";

// Handle POST request - Create a new game
export async function POST(request: Request) {
  try {
    const { opponent_name, game_length } = await request.json();

    if (!opponent_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 1: Create the game
    const game = await createGame(opponent_name, game_length);
    console.log("game:", game);
    console.log("game[0].id:", game[0].id);

    // Step 2: Create players for the new game
    await createPlayer(undefined, game[0].id);

    return NextResponse.json({ message: "Game created!", game, refresh: true }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
