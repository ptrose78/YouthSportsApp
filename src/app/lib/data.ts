// lib/data.ts
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

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

// Save in-progress stats to the database
export async function savePlayerStats(playerId: string, gameId: string, stats: PlayerStats) {
  const { enter_time, leave_time, points, rebounds, assists } = stats;

  // Insert the stats into the 'in-progress-stats' table
  const { data, error } = await supabase
    .from("in-progress-stats")
    .insert([
      {
        id: randomUUID(),  
        created_at: new Date().toISOString(),
        player_id: randomUUID(),
        game_id: randomUUID(),
        enter_time: enter_time,
        leave_time: leave_time,
        points: points,
        rebounds: rebounds,
        assists: assists,
      },
    ])
    .select();

  // Error handling
  if (error) {
    console.error("Error inserting stats:", error.message);
    throw new Error(error.message);
  }

  // Return the inserted data
  return data;
}

// Fetch all player stats for a game
export async function fetchPlayerStats(gameId: string) {
  const { data, error } = await supabase
    .from("in-progress-stats")
    .select("*")
    .eq("game_id", gameId);

  // Error handling
  if (error) {
    console.error("Error fetching stats:", error.message);
    throw new Error(error.message);
  }

  // Return fetched data
  return data;
}
