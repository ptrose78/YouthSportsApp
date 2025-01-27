import { NextResponse } from "next/server";
import { savePlayer } from "@/app/lib/data";

export async function POST(request: Request) {
  const body = await request.json();
  const { player_name } = body;

  if (!player_name) {
    return NextResponse.json({ error: "Missing required field: player_name" }, { status: 400 });
  }

  try {
    const result = await savePlayer(player_name);
    return NextResponse.json({ message: "Player added to roster!", result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
