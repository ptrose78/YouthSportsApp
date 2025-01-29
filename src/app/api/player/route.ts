import { NextResponse } from "next/server";
import { assignPlayersToGame, fetchPlayers  } from "@/app/lib/data";

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

// // Handle PUT requests: Create new entries for all players with a new game_id
// export async function PUT(request: Request) {
//   const { game_id } = await request.json();

//   if (!game_id) {
//     return NextResponse.json({ error: "Missing required field: game_id" }, { status: 400 });
//   }

//   try {
//     // Fetch all players from the database
//     const players = await fetchPlayers();

//     // Create new entries for each player with the new game_id
//     const newEntries = await Promise.all(
//       players.map(async (player: any) => {
//         const newPlayer = await savePlayer(player.player_name);
//         return newPlayer;
//       })
//     );

//     return NextResponse.json({ message: "New entries created for all players!", result: newEntries }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error: (error as Error).message }, { status: 500 });
//   }
// }