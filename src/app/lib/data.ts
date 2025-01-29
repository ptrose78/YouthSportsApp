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
  points: number;
  rebounds: number;
  assists: number;
}
// Define Player interface
interface Player {
  id?: string;
  player_name: string;
  points: number;
  rebounds: number;
  assists: number;
}

// Save a user to the users table and create a team and siteData entry
export async function saveUser(email: string, team_name: string) {
  try {
    // Step 1: Insert into the "users" table and retrieve the newly created user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: randomUUID(),
          created_at: new Date().toISOString(),
          email,
          team_name,
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

    // Ensure the team was inserted and we got the team ID
    const teamId = teamData?.[0]?.id;
    if (!teamId) {
      throw new Error("Failed to retrieve team ID after insertion.");
    }

    // Step 3: Insert into the "siteData" table with user_id and team_id
    const { data: siteData, error: siteDataError } = await supabase
      .from("site-data")
      .insert([
        {
          id: randomUUID(),
          created_at: new Date().toISOString(),
          user_id: userId, // Link the user ID to the SiteData
          team_id: teamId,  // Link the team ID to the SiteData
          game_id: null, // You can set game_id to null if it's not available at the time of creation
        },
      ])
      .select();

    if (siteDataError) {
      console.error("Error saving site data:", siteDataError.message);
      throw new Error(siteDataError.message);
    }

    // Return the user, team, and site data for confirmation
    return {
      user: userData[0],
      team: teamData[0],
      siteData: siteData[0], // Include site data in the response
    };
  } catch (error) {
    console.error("Error in saveUser:", error);
    throw new Error(error as string);
  }
}


// Function to assign players (existing and new) to a game
export async function assignPlayersToGame(newPlayerName?: string, new_game_id?: string) {
  try {
    let existingPlayerEntries: any[] = [];
    console.log("newPlayerName:", newPlayerName);
    console.log("new_game_id:", new_game_id);

    // Step 1: Get the team_id and game_id from the siteData table
    const { data: siteData, error: siteDataError } = await supabase
      .from("site-data")
      .select("team_id, game_id")
      .single(); // Assuming there's only one row for the current user

    if (siteDataError) {
      console.error("Error fetching site data:", siteDataError.message);
      throw new Error(siteDataError.message);
    }

    const team_id = siteData?.team_id;
    const game_id_fromSiteData = siteData?.game_id; // Renaming for clarity
    if (!team_id) {
      throw new Error("Team not found in site data.");
    }

    // Step 2: If game_id is passed as a parameter, use it, else fallback to game_id from siteData
    const game_id_toUse = new_game_id || game_id_fromSiteData;
    if (!game_id_toUse) {
      throw new Error("Game ID not provided and not found in site data.");
    }

    console.log("Using team_id from siteData:", team_id);
    console.log("Using game_id:", game_id_toUse);

    // Step 3: Fetch all existing players for the team (if any)
    const { data: allPlayers, error } = await supabase
      .from("players")
      .select("player_id, player_name, team_id, created_at")
      .eq("team_id", team_id)
      .order("created_at", { ascending: false }); // Ensures latest entries are first

    if (error) {
      console.error("Error fetching players:", error.message);
      throw new Error(error.message);
    }

    // Step 4: Filter unique players by `player_id`
    const existingPlayers = Array.from(
      new Map(allPlayers.map(player => [player.player_id, player])).values()
    );

    console.log("existingPlayers:", existingPlayers);
    // Step 5: If existing players are found, create new entries for them with the new game_id
    if (new_game_id && existingPlayers && existingPlayers.length > 0) {
      existingPlayerEntries = existingPlayers.map((player) => ({
        id: randomUUID(), // Generate a new ID for each new game entry
        player_id: player.player_id, 
        player_name: player.player_name, // Keep the same name
        team_id,
        game_id: new_game_id, // New game
        points: 0,
        rebounds: 0,
        assists: 0,
        time_played: 0,
      }));
    }

    console.log("Existing player entries:", existingPlayerEntries);

    // Step 6: Add the new player if provided
    if (newPlayerName) {
      existingPlayerEntries.push({
        id: randomUUID(), //Create new id
        player_id: randomUUID(), //Create new player id
        player_name: newPlayerName, // The new player being added
        team_id,
        game_id: game_id_fromSiteData,
        points: 0,
        rebounds: 0,
        assists: 0,
        time_played: 0,
      });
    }

    // Step 7: If there's nothing to insert, exit early
    if (existingPlayerEntries.length === 0) {
      console.log("No players to insert.");
      return { message: "No players were assigned to the game." };
    }

    // Step 8: Insert new records into the database
    const { error: insertError } = await supabase.from("players").insert(existingPlayerEntries);

    if (insertError) {
      console.error("Error inserting new players:", insertError.message);
      throw new Error(insertError.message);
    }

    return { message: "Players assigned to game!", players: existingPlayerEntries };
  } catch (error) {
    console.error("Error assigning players to game:", error);
    throw error;
  }
}

// Create a new game and update the siteData table with the new game_id
export async function createGame(opponent_name: string) {
  try {
    // Step 1: Get the team_id and user_id from the siteData table
    const { data: siteData, error: siteDataError } = await supabase
      .from("site-data")
      .select("id, team_id, user_id")
      .single(); // Assuming there's only one row for the current user

    if (siteDataError) {
      console.error("Error fetching site data:", siteDataError.message);
      throw new Error(siteDataError.message);
    }

    const id = siteData?.id;
    const team_id = siteData?.team_id;
    const user_id = siteData?.user_id;

    if (!team_id) {
      throw new Error("Team not found in site data.");
    }

    console.log("Using team_id from siteData:", team_id);

    // Step 2: Insert the game into the games table
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .insert([
        {
          id: randomUUID(),
          created_at: new Date().toISOString(),
          team_id,
          opponent_name,
        },
      ])
      .select(); // This returns the inserted row(s)

    if (gameError) {
      console.error("Error saving game:", gameError.message);
      throw new Error(gameError.message);
    }

    const game_id = gameData?.[0]?.id;
    if (!game_id) {
      throw new Error("Failed to retrieve game ID.");
    }

    // Step 3: Update the siteData table with the new game_id
    const { data: updatedSiteData, error: updateSiteDataError } = await supabase
      .from("site-data")
      .update({ game_id: game_id }) // Only update the game_id
      .eq("id", id); // Match the siteData row by its ID

    if (updateSiteDataError) {
      console.error("Error updating site data:", updateSiteDataError.message);
      throw new Error(updateSiteDataError.message);
    }

    return gameData;
  } catch (error) {
    console.error("Error in createGame:", error);
    throw error; // Rethrow the error to propagate it up
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

// Fetch player_id from players table
export async function getPlayerId() {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("id")
      .single(); // Ensure only one row is returned

    if (error) {
      console.error("Error fetching player_id:", error.message);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Player not found.`);
    }

    return data.id; // Return the team_id
  } catch (error) {
    console.error("Error in getPlayerId:", error);
    throw error;
  }
}

// Fetch game_id from games table
export async function getGameId() {
  try {
    const { data, error } = await supabase
      .from("games")
      .select("id")
      .single(); // Ensure only one row is returned

    if (error) {
      console.error("Error fetching game_id:", error.message);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Game not found.`);
    }

    return data.id; // Return the team_id
  } catch (error) {
    console.error("Error in getGameId:", error);
    throw error;
  }
}



// Fetch all users
export async function fetchUsers() {
  const { data, error } = await supabase.from("users").select("*");
  console.log(data);
  if (error) {
    console.error("Error fetching roster:", error.message);
    throw new Error(error.message);
  }
  return data;
}

// Fetch all teams
export async function fetchTeams() {
  const { data, error } = await supabase.from("teams").select("*");
  console.log(data);
  if (error) {
    console.error("Error fetching roster:", error.message);
    throw new Error(error.message);
  }
  return data;
}

// Fetch all games
export async function fetchGames() {
  const { data, error } = await supabase.from("games").select("*");
 
  if (error) {
    console.error("Error fetching roster:", error.message);
    throw new Error(error.message);
  }
  return data;
}

// Fetch all players
export async function fetchPlayers() {

  const { data: siteData, error: siteDataError } = await supabase.from("site-data").select("game_id");

  if (siteDataError) {
    console.error("Error fetching site data:", siteDataError.message);
    throw new Error(siteDataError.message);
  }

  if (!siteData) {
    throw new Error("Site data not found.");
  }

  const game_id = siteData[0].game_id;

  if (!game_id) {
    throw new Error("Game ID not found in site data.");
  }

  const { data, error } = await supabase.from("players").select("*").eq("game_id", game_id);
  if (error) {
    console.error("Error fetching roster:", error.message);
    throw new Error(error.message);
  }
  return data;
}


// Fetch site-data from site-data table
export const getSiteData = async () => {
  const { data, error } = await supabase.from("site-data").select("*");
  if (error) {
    console.error("Error fetching site-data:", error.message);
    throw new Error(error.message);
  }
  return data;
}

export async function updateSiteData(user_id?: string, team_id?: string, game_id?: string, player_id?: string) {
  try {
    
     // Get the site data
     const siteData = await getSiteData();

     if (!siteData) {
       throw new Error("Site data not found.");
     }

     const updatedData: any = { 
          user_id: user_id || siteData[0]?.user_id || null,
          team_id: team_id || siteData[0]?.team_id || null,
          game_id: game_id || siteData[0]?.game_id || null,
          player_id: player_id || siteData[0]?.player_id || null,
          updated_at: new Date().toISOString(),
     }

    // Remove undefined values to avoid overwriting with null
    Object.keys(updatedData).forEach(key => updatedData[key] === undefined && delete updatedData[key]);

    const { data, error } = await supabase
      .from("site-data")
      .update(updatedData)
      .eq("id", siteData[0].id)
      .select();
    
     
    if (error) {
      console.error("Error updating site-data:", error.message);
      throw new Error(error.message);
    }

    // Return the updated data
    console.log("Site-data updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in updateSiteData:", error);
    throw error;
  }
}

export async function createSiteData(user_id?: string, team_id?: string, game_id?: string, player_id?: string) {
  try {
   
    const newData = {
      id: randomUUID(),
      user_id: user_id,
      team_id: team_id,  
      game_id: game_id || null,  
      player_id: player_id || null,
      created_at: new Date().toISOString(), 
    };

    const { data, error } = await supabase
      .from("site-data") 
      .insert([newData])
      .select();

      console.log(data)

    if (error) {
      console.error("Error creating site-data entry:", error.message);
      throw new Error(error.message);
    }

    // Return the newly created entry
    console.log("Site-data entry created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in createSiteDataEntry:", error);
    throw error;
  }
}





export async function savePlayerStats(playerId: string | number, gameId: string, stats: PlayerStats) {
  const { points, rebounds, assists } = stats;

  const { data, error } = await supabase
    .from("players")
    .update({
      points,
      rebounds,
      assists,
      updated_at: new Date().toISOString(), // Optionally track when the update happened
    })
    .eq("id", playerId) // Match the correct player
    .eq("game_id", gameId); // Match the correct game

  if (error) {
    console.error("Error updating stats:", error.message);
    throw new Error(error.message);
  }

  return data;
}
