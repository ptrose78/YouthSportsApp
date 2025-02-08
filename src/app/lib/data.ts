// lib/data.ts
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { auth, currentUser } from "@clerk/nextjs/server";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Function to get the authenticated user's email
export async function getUserEmail() {
  const auth_result = await auth(); // Must be called inside a request scope
  const userId = auth_result.userId;

  if (!userId) return null;

  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress || null;
}

// Check if variables are missing and handle gracefully
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY are set."
  );
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Define EmailLog interface
interface EmailLog {
  recipients: string[];
  subject: string;
  message: string;
  sender: string;
  created_at: string;
  attachmentUrl?: string;
}
// Define PlayerStats interface
interface PlayerStats {
  points: number;
  rebounds: number;
  assists: number;
  time_played: number;
}
// Define Player interface
interface Player {
  id?: string;
  player_name: string;
  points: number;
  rebounds: number;
  assists: number;
  time_played: number;
}


// Save a user to the users table and create a team and siteData entry
export async function saveUser(email: string, team_name: string) {
  try {
    // Step 1: Insert into the "users" table and retrieve the newly created user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          created_at: new Date().toISOString(),
          email, // Use the email as unique identifier
          team_name,
        },
      ])
      .select(); // This returns the inserted row(s)

    if (userError) {
      console.error("Error saving user:", userError.message);
      throw new Error(userError.message);
    }

    // Ensure the user was inserted and we got an ID
    const userId = userData?.[0]?.email;
    if (!userId) {
      throw new Error("Failed to retrieve user email after insertion.");
    }

    // Step 2: Insert into the "teams" table using the email as a foreign key
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert([
        {
          id: randomUUID(),
          created_at: new Date().toISOString(),
          team_name,
          email, // Use the email as a foreign key
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
          email, // Link the email to the SiteData
          team_id: teamId,  // Link the team ID to the SiteData
          game_id: null, // You can set game_id to null if it's not available at the time of creation
        },
      ])
      .select();

    if (siteDataError) {
      console.error("Error saving site data:", siteDataError.message);
      throw new Error(siteDataError.message);
    }

    console.log("userData:", userData);
    console.log("teamData:", teamData);
    console.log("siteData[0]", siteData[0])
    console.log("siteData:", siteData);


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

// Function to create players (existing from roster and new) for a new game
export async function createPlayer(newPlayerName?: string, new_game_id?: string) {
  try {
    console.log("newPlayerName:", newPlayerName);
    console.log("new_game_id:", new_game_id);

    let newStatsEntries = [];

    // Step 1: Get user's team_id and last known game_id
    const email = await getUserEmail();
    const { data: siteData, error: siteDataError } = await supabase

      .from("site-data")
      .select("team_id, game_id")
      .eq("email", email)
      .single();

    if (siteDataError) throw new Error(siteDataError.message);

    const team_id = siteData?.team_id;
    const game_id_toUse = new_game_id || siteData?.game_id;

    if (!team_id) throw new Error("Team not found in site data.");
    if (!game_id_toUse) throw new Error("Game ID not provided or found in site data.");

    console.log("Using team_id:", team_id);
    console.log("Using game_id:", game_id_toUse);

    // Step 2: Fetch existing players for the team and prepare stats entries for a new game
    if (new_game_id) {
      const { data: existingPlayers, error: fetchError } = await supabase
        .from("players")

        .select("player_id, player_name")
        .eq("team_id", team_id);

      if (fetchError) throw new Error(fetchError.message);

      newStatsEntries = existingPlayers.map((player) => ({
        id: randomUUID(), // New unique stat entry ID
        player_id: player.player_id,
        player_name: player.player_name,
        team_id,
        game_id: game_id_toUse,
        points: 0,
        rebounds: 0,
        assists: 0,   
        time_played: 0,
      }));
    }

    // Step 4: If a new player is provided, add to `players` table and prepare `player-stats` entry
    if (newPlayerName) {
      const newPlayerId = randomUUID();
      
      // Insert new player into `players`
      const { error: playerInsertError } = await supabase.from("players").insert([
        {
          player_id: newPlayerId,
          player_name: newPlayerName,
          team_id,
        }

      ]);

      if (playerInsertError) throw new Error(playerInsertError.message);

      // Create stats entry for the new player
      newStatsEntries.push({
        id: randomUUID(),
        player_id: newPlayerId,
        player_name: newPlayerName,
        team_id,
        game_id: game_id_toUse,
        points: 0,
        rebounds: 0,
        assists: 0,
        time_played: 0,
      });
    }

    console.log("newStatsEntries:",newStatsEntries)
    // Step 5: Insert `player-stats` entries
    if (newStatsEntries.length > 0) {
      const { error: statsInsertError } = await supabase.from("players-stats").insert(newStatsEntries);
      if (statsInsertError) {
        console.error("Supabase Insert Error:", statsInsertError);
        throw new Error(statsInsertError.message);
      }
    }

    return { message: "Players assigned to game!", stats: newStatsEntries };
  } catch (error) {
    console.error("Error assigning players to game:", error);
    throw error;
  }
}


// Delete a player from the players table
export async function deletePlayer(player_id: string) {

  console.log("Deleting player:", player_id);
  try {
    const { data, error } = await supabase.from("players").delete().eq("player_id", player_id);
    console.log("Data:", data);
    return data;
  } catch (error) {


    console.error("Error deleting player:", error);
    throw error;
    
  }
  
}




// Create a new game and update the siteData table with the new game_id
export async function createGame(opponent_name: string, game_length: number) {
  try {
    // Step 1: Get the team_id and user_id from the siteData table
    const email = await getUserEmail();
    const { data: siteData, error: siteDataError } = await supabase
      .from("site-data")
      .select("id, team_id")
      .eq("email", email)
      .single();

    if (siteDataError) {
      console.error("Error fetching site data:", siteDataError.message);
      throw new Error(siteDataError.message);
    }

    const team_id = siteData.team_id;

    if (!team_id) {
      throw new Error("Team not found in site data.");
    }

    // Step 2: Insert the game into the games table
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .insert([
        {
          id: randomUUID(),
          created_at: new Date().toISOString(),
          team_id,
          opponent_name,
          game_length
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
      .eq("email", email); // Match the siteData row by its ID

    if (updateSiteDataError) {
      console.error("Error updating site data:", updateSiteDataError.message);
      throw new Error(updateSiteDataError.message);
    }

    // Step 4: Reset player stats
    // await resetPlayerStats();

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



// Fetch user by email
export async function getUser(email: string) {
  
  const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

      if (existingUserError) {
        console.error("Error fetching user:", existingUserError.message);
        throw new Error(existingUserError.message);
      }
  return existingUser;
}
  

// Fetch all users
export async function fetchUsers() {
  const { data, error } = await supabase.from("users").select("*");

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
  const email = await getUserEmail();
  const { data: siteData, error: siteDataError } = await supabase
  .from("site-data")
  .select("team_id")
  .eq("email", email)
  .single();

  const { data, error } = await supabase.from("games").select("*").eq("team_id", siteData.team_id);
 
  if (error) {
    console.error("Error fetching roster:", error.message);
    throw new Error(error.message);
  }
  return data;
}

// Fetch all players
export async function fetchPlayers() {
  const email = await getUserEmail();
  const { data: siteData, error: siteDataError } = await supabase
    .from("site-data")
    .select("team_id")
    .eq("email", email)
    .single();

  if (siteDataError) {
    console.error("Error fetching site data:", siteDataError.message);
    throw new Error(siteDataError.message);
  }

  if (!siteData) {
    throw new Error("Site data not found.");
  }

  const { data, error } = await supabase.from("players").select("*").eq("team_id", siteData.team_id);

  if (error) {
    console.error("Error fetching roster:", error.message);
    throw new Error(error.message);
  }
  return data;
}

export async function fetchPlayersStatsByGame(game_id: string) {
  const { data, error } = await supabase.from("players-stats").select("*").eq("game_id", game_id);
  console.log("data:",data)
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



export async function postPlayerStats(player_id: string | number, stats: PlayerStats) {

  const email = await getUserEmail();
    const { data: siteData, error: siteDataError } = await supabase
    .from("site-data")
    .select("team_id, game_id")
    .eq("email", email)
    .single();

  const { points, rebounds, assists, time_played } = stats;
 
  if (!siteData) {
    throw new Error("Site data not found.");
  }

  const { data, error } = await supabase
    .from("players-stats")
    .update({
      points,
      rebounds,
      assists,
      time_played,
      updated_at: new Date().toISOString(), // Optionally track when the update happened
    })
    .eq("player_id", player_id) // Match the correct player
    .eq("team_id", siteData.team_id) // Match the correct team
    .eq("game_id", siteData.game_id); // Match the correct game

  if (error) {
    console.error("Error updating stats:", error.message);
    throw new Error(error.message);
  }


  return data;
}

export async function resetPlayerStats() {
  try {

    const siteData = await getSiteData();

    if (!siteData) {
      throw new Error("Site data not found.");
    }

    const team_id = siteData[0].team_id;
    const game_id = siteData[0].game_id;  

    const { error } = await supabase
      .from("players")
      .update({ points: 0, rebounds: 0, assists: 0 })
      .eq("team_id", team_id) // Reset only players belonging to this team
      .eq("game_id", game_id);

    if (error) {
      console.error("Error resetting player stats:", error.message);
      throw new Error(error.message);
    }

    console.log("✅ Player stats reset for team:", team_id);
  } catch (error) {
    console.error("Error in resetPlayerStats:", error);
    throw error;
  }
}

export async function getPlayerStats(player_id: string) {
 
  const { data, error } = await supabase
    .from("players-stats")
    .select("points, rebounds, assists, time_played")
    .eq("player_id", player_id)
    .order("created_at", { ascending: false })
    .limit(1);
  return data;
}



//email
const TABLE_NAME = "email-logs";  // Table name

export async function getEmailLogs() {
  const email = await getUserEmail();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false })
    .eq("email", email);


  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function saveEmailLog(emailLog: EmailLog) {
  const email = await getUserEmail();
  try {
    const { error } = await supabase.from(TABLE_NAME).insert([{email, ...emailLog}]);

    if (error) {
      console.error("Error saving email log:", error);
      throw new Error("Failed to save email log.");
    }
  } catch (error) {
    console.error("Unexpected error saving email log:", error);
    throw new Error("Failed to save email log.");
  }
}



// Upload file to Supabase and return the public URL
export const uploadFile = async (file: File): Promise<string | null> => {
  try {
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type });

    const fileName = `${Date.now()}_${file.name}`; // Generate file name outside the upload call
    const filePath = `public/${fileName}`; // Construct file path

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filePath, blob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload failed:", error); // Log the whole error object
      throw new Error(`File upload failed: ${error.message}`); // Throw an error with a message
    }

    const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(data.path);

    if (!publicUrl) {
      console.error("Could not generate public URL after successful upload.");
      throw new Error("Could not generate public URL.");
    }

    console.log("File uploaded successfully. Public URL:", publicUrl); // Log success

    return publicUrl;

  } catch (err) {
    console.error("Error in uploadFile function:", err);
    return null; // Or throw the error if you want the caller to handle it
  }
};


// Set subscription status in the database
export async function setSubscriptionStatus(status: string) {
  const email = await getUserEmail();

  if (!email) {
    throw new Error("User email not found");
  }

  try {
    // 1. Check if the email exists in the users table:
    const { data: userExists, error: userError } = await supabase
      .from('users') // Replace 'users' with the actual name of your users table
      .select('email')
      .eq('email', email)
      .limit(1);

    if (userError) {
      console.error("Error checking user existence:", userError);
      throw new Error("Failed to check user existence");
    }

    if (!userExists || userExists.length === 0) {
      console.error("User does not exist:", email);
      throw new Error("User does not exist.  Cannot create subscription.");
    }

    // 2. Now that we know the user exists, proceed with subscription logic:
    const { data: existingSubscription, error: existingError } = await supabase
      .from("subscriptions")
      .select('id')
      .eq('email', email)
      .limit(1);

    if (existingError) {
      console.error("Error checking existing subscription:", existingError);
      throw new Error("Failed to check existing subscription");
    }

    if (existingSubscription && existingSubscription.length > 0) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ status })
        .eq('email', email);

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        throw new Error("Failed to update subscription status in database");
      }
      console.log("Subscription updated successfully for", email);

    } else {
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert([
        {
          id: randomUUID(),
          status: status,
          email: email,
        },
      ])
      .select();

    if (subscriptionError) {
      console.error("Error inserting subscription:", subscriptionError);
      console.error("Full error object:", JSON.stringify(subscriptionError, null, 2));
      console.error("Error message:", subscriptionError.message);
      console.error("Error details:", subscriptionError.details);
      throw new Error("Failed to set subscription status in database");
    }
      console.log("Subscription created successfully for", email);
    }

  } catch (error) {
    console.error("Database operation error:", error);
    throw error;
  }
}

// Update subscription status in the database
export async function updateSubscriptionStatusInDB(status: string) {

  const email = await getUserEmail();

  if (!email) throw new Error("User email not found");

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: status,
    })
    .eq("email", email);

  if (error) throw new Error("Failed to update subscription status in database");
}