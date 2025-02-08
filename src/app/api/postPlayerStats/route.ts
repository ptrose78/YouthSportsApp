// app/api/stats/route.ts

import { NextResponse } from "next/server";
import { postPlayerStats } from "@/app/lib/data"; // Import data.ts functions

// Note: This is not used in the app, instead the ActivePlayers component 
// uses the postPlayerStats function to save stats for a player

// Handle POST requests to save stats
export async function POST(request: Request) {
  const body = await request.json();
  const { playerId, stats } = body;
  console.log(body)

  if (!playerId || !stats) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await postPlayerStats(playerId, stats);
    return NextResponse.json({ message: "Stats saved!", result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

}
