import { NextResponse } from "next/server";
import { deletePlayer } from "@/app/lib/data";


// Handle POST requests: Add a new player
export async function POST(request: Request) {
  const body = await request.json();
  const { player_id } = body;

  if (!player_id) {
    return NextResponse.json({ error: "Missing required field: player_id" }, { status: 400 });
  }

  try {
    const result = await deletePlayer(player_id);
    console.log("Result:", result);
    return NextResponse.json({ message: "Player deleted from roster!", result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

}