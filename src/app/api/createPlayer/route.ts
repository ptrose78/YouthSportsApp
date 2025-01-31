import { NextResponse } from "next/server";
import { createPlayer, getPlayerStats } from "@/app/lib/data";


// Handle POST requests: Add a new player
export async function POST(request: Request) {
  const body = await request.json();
  const { player_name } = body;

  if (!player_name) {
    return NextResponse.json({ error: "Missing required field: player_name" }, { status: 400 });
  }

  try {
    const result = await createPlayer(player_name);
    return NextResponse.json({ message: "Player added to roster!", result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

}

// Note: This is not used in the app, instead the ActivePlayers component 
// uses the getPlayerStats function to get the latest stats for a player

// Handle GET requests: Get the latest stats for a player
export async function GET(request: Request) {
  const body = await request.json();
  const { player_id } = body;
  const result = await getPlayerStats(player_id);
  console.log("result:",result)
  return NextResponse.json({ result }, { status: 200 });
}