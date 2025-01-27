// lib/data.ts
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { isUUID } from "@/app/utils/isUUID"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if variables are missing and handle gracefully
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY are set."
  );
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Define PlayerStats interface
interface PlayerStats {
  enter_time: string;
  leave_time: string;
  points: number;
  rebounds: number;
  assists: number;
}

export async function saveUser(email: string, user_name: string, team_name: string) {
  console.log(user_name);

  try {
    // Step 1: Insert into the "users" table and retrieve the newly created user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: randomUUID(),
          created_at: new Date().toISOString(),
          email,
          user_name,
        },
      ])
      .select(); // This returns the inserted row(s)

    if (userError) {
      console.error("Error saving user:", userError.message);
      throw new Error(userError.message);
    }

    // Ensure the user was inserted and we got an ID
    const userId = userData?.[0]?.id;
    if (!userId) {
      throw new Error("Failed to retrieve user ID after insertion.");
    }

    // Step 2: Insert into the "teams" table using the retrieved user ID
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert([
        {
          id: randomUUID(),
          created_at: new Date().toISOString(),
          team_name,
          users_id: userId, // Use the user ID as the foreign key
        },
      ])
      .select(); // This returns the inserted row(s)

    if (teamError) {
      console.error("Error saving team:", teamError.message);
      throw new Error(teamError.message);
    }

    // Return both the user and team data for confirmation
    return { user: userData[0], team: teamData[0] };
  } catch (error) {
    console.error("Error in saveUser:", error);
    throw new Error(error as string);
  }
}

// Fetch team_id from teams table
export async function getTeamId() {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("id")
      .single(); // Ensure only one row is returned

    if (error) {
      console.error("Error fetching team_id:", error.message);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Team not found.`);
    }

    return data.id; // Return the team_id
  } catch (error) {
    console.error("Error in getTeamId:", error);
    throw error;
  }
}
// Save a player to the roster with team_id
export async function savePlayer(player_name: string) {
  try {
    // Step 1: Get the team_id from the team_name
    const team_id = await getTeamId();

    // Step 2: Insert the player with the team_id
    const { data, error } = await supabase
      .from("players")
      .insert([
        {
          id: randomUUID(),
          created_at: new Date().toISOString(),
          team_id: team_id,
          player_name,
        },
      ])
      .select();

    if (error) {
      console.error("Error saving player:", error.message);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error in savePlayer:", error);
    throw error;
  }
}

// Fetch all players from the roster
export async function fetchPlayers() {
  const { data, error } = await supabase.from("players").select("*");
  console.log(data);
  if (error) {
    console.error("Error fetching roster:", error.message);
    throw new Error(error.message);
  }
  return data;
}

export async function savePlayerStats(playerId: string, gameId: string, stats: PlayerStats) {

  const { enter_time, leave_time, points, rebounds, assists } = stats;

  const { data, error } = await supabase
    .from("in-progress-stats")
    .insert([
      {
        id: randomUUID(),
        created_at: new Date().toISOString(),
        player_id: playerId, // Link to the correct player
        game_id: gameId, // Link to the correct game
        enter_time,
        leave_time,
        points,
        rebounds,
        assists,
      },
    ])
    .select();

  if (error) {
    console.error("Error inserting stats:", error.message);
    throw new Error(error.message);
  }

  return data;
}

export async function fetchPlayerStats(playerId: string, gameId: string) {
  if (!isUUID(playerId) || !isUUID(gameId)) {
    throw new Error("Invalid UUID format for playerId or gameId.");
  }

  const { data, error } = await supabase
    .from("in-progress-stats")
    .select("*")
    .eq("player_id", playerId) // Match the correct player
    .eq("game_id", gameId); // Match the correct game

  if (error) {
    console.error("Error fetching stats:", error.message);
    throw new Error(error.message);
  }

  return data;
}



