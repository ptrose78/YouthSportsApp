import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { fetchUsers, fetchTeams, fetchGames, fetchPlayers } from "@/app/lib/data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {  
  try {
    const auth_result = await auth();
    const userId = auth_result?.userId;


    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type  = (await params).type;

    let data;
    switch (type) {
      case "users":
        data = await fetchUsers();
        break;
      case "teams":
        data = await fetchTeams();
        break;
      case "games":
        data = await fetchGames();
        break;
      case "players":
        data = await fetchPlayers();
        break;
      default:
        return NextResponse.json({ error: "Invalid data type" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}