import { NextResponse } from "next/server";
import { getPlayerStats } from "@/app/lib/data"; // Example function

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playerId = searchParams.get("playerId");
  console.log("playerId:",playerId)

  if (!playerId) {
    return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
  }

  const stats = await getPlayerStats(playerId);
  return NextResponse.json(stats);
}
