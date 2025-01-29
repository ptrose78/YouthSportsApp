import { NextResponse } from "next/server";
import { createSiteData, updateSiteData } from "@/app/lib/data";

// Create SiteData Entry (POST)
export async function POST(request: Request) {
  const body = await request.json();
  console.log("Received Data:", body);
  const { user_id, team_id, game_id, player_id } = body;

  if (!user_id || !team_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await createSiteData(user_id, team_id, game_id, player_id);
    return NextResponse.json({ message: "Site data added!", result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// Update SiteData Entry (PUT)
export async function PUT(request: Request) {
  const body = await request.json();
  console.log("Received Update Data:", body);
  const { user_id, team_id, game_id, player_id } = body;
  console.log(body)

  try {
    const result = await updateSiteData(user_id, team_id, game_id, player_id);
    return NextResponse.json({ message: "Site data updated!", result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
