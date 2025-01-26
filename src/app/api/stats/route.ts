// app/api/stats/route.ts

import { NextResponse } from "next/server";
import { savePlayerStats } from "@/app/lib/data"; // Import data.ts functions

// Handle POST requests to save stats
export async function POST(request: Request) {
  const body = await request.json();
  const { playerId, gameId, stats } = body;
  console.log(body)

  if (!playerId || !gameId || !stats) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await savePlayerStats(playerId, gameId, stats);
    return NextResponse.json({ message: "Stats saved!", result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
