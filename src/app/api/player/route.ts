import { NextResponse } from "next/server";
import { assignPlayersToGame, getLatestStats } from "@/app/lib/data";

// Handle POST requests: Add a new player
export async function POST(request: Request) {
  const body = await request.json();
  const { player_name } = body;

  if (!player_name) {
    return NextResponse.json({ error: "Missing required field: player_name" }, { status: 400 });
  }

  try {
    const result = await assignPlayersToGame(player_name);
    return NextResponse.json({ message: "Player added to roster!", result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const body = await request.json();
  const { player_id } = body;
  const result = await getLatestStats(player_id);
  console.log("result:",result)
  return NextResponse.json({ result }, { status: 200 });
}
