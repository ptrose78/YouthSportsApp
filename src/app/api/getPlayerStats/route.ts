import { NextResponse } from "next/server";
import { getPlayerStats } from "@/app/lib/data";

// Handle GET requests: Get the latest stats for a player
export async function GET(request: Request) {
  const body = await request.json();
  const { player_id } = body;
  const result = await getPlayerStats(player_id);
  console.log("result:",result)
  return NextResponse.json({ result }, { status: 200 });
}
