
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Generic function to fetch specific data type
const fetchDataFromAPI = async (type: string) => {
  const res = await fetch(`/api/data/${type}`);
  if (!res.ok) throw new Error(`Failed to fetch ${type}`);
  return await res.json();
};

export const getUsers = createAsyncThunk("data/getUsers", async () => {
  return await fetchDataFromAPI("users");
});

export const getTeams = createAsyncThunk("data/getTeams", async () => {
  return await fetchDataFromAPI("teams");
});

export const getGames = createAsyncThunk("data/getGames", async () => {
  return await fetchDataFromAPI("games");
});

export const getPlayers = createAsyncThunk("data/getPlayers", async () => {
  return await fetchDataFromAPI("players");
});

// State interface
interface DataState {
  users: any[];
  teams: any[];
  games: any[];
  players: any[];
  currentGame: any;
  activePlayers: any[];
  gameClock: number; // New state for game clock
  timeLeft: number;
  isGameRunning: boolean; // New state to track if the game is running
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: DataState = {
  users: [],
  teams: [],
  games: [],
  players: [],
  currentGame: null,
  activePlayers: [],
  gameClock: 0, // Initialize clock at 0
  timeLeft: 0,
  isGameRunning: false, // Initially, the game is not running
  loading: false,
  error: null,
};

// Slice
const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setCurrentGame: (state, action) => {
      state.currentGame = action.payload;
    },
    setTimeLeft: (state, action) => {
      state.timeLeft = action.payload;
    },
    decrementTimeLeft(state) {
      if (state.timeLeft > 0) {
          state.timeLeft -= 1;
          state.activePlayers.forEach((player) => {
              player.time_played += 1; // Track individual player time
          });
      }
    },
    startGameClock: (state) => {
      state.isGameRunning = true;
    },
    stopGameClock: (state) => {
      state.isGameRunning = false;
    },
    resetGameClock(state) {
      state.timeLeft = 0;
      state.gameClock = 0;
      state.activePlayers.forEach((player) => {
          player.time_played = 0; // Reset player times
      });
  },
    incrementGameClock: (state) => {
      if (state.isGameRunning) {
        state.gameClock += 1;
      }
    },
    addPlayerToGlobalActive: (state, action) => {
      const playerToAdd = action.payload;
      const playerIndex = state.activePlayers.findIndex(
        (player) => player.player_id === playerToAdd.player_id
      );

      if (playerIndex === -1) {
        state.activePlayers.push(playerToAdd); // Add new player
      } 
      else {
        // ***Crucial Change: Create a new activePlayers array***
        state.activePlayers = state.activePlayers.map((player, index) =>
          index === playerIndex ? { ...player, ...playerToAdd } : player
        );
      }
    },
    removePlayerFromGlobalActive: (state, action) => {
      state.activePlayers = state.activePlayers.filter((player) => player.player_id !== action.payload.player_id);
    },
    deletePlayer: (state, action) => {
      state.players = state.players.filter((player) => player.player_id !== action.payload.player_id);
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(getTeams.fulfilled, (state, action) => {
        state.teams = action.payload;
      })
      .addCase(getGames.fulfilled, (state, action) => {
        state.games = action.payload;
      })
      .addCase(getPlayers.fulfilled, (state, action) => {
        state.players = action.payload;
      });
  },
});

// Export actions and reducer
export const { 
  setCurrentGame, 
  startGameClock, 
  stopGameClock, 
  resetGameClock, 
  incrementGameClock ,
  decrementTimeLeft,
  setTimeLeft,
  addPlayerToGlobalActive,
  removePlayerFromGlobalActive,
  deletePlayer
} = dataSlice.actions;

export const selectCurrentGame = (state: { data: DataState }) => state.data.currentGame;
export const selectUsers = (state: { data: DataState }) => state.data.users;
export const selectTeams = (state: { data: DataState }) => state.data.teams;
export const selectGames = (state: { data: DataState }) => state.data.games;
export const selectPlayers = (state: { data: DataState }) => state.data.players;
export const selectActivePlayers = (state: { data: DataState }) => state.data.activePlayers;
export const selectGameClock = (state: { data: DataState }) => state.data.gameClock;
export const selectTimeLeft = (state: { data: DataState }) => state.data.timeLeft;
export const selectIsGameRunning = (state: { data: DataState }) => state.data.isGameRunning;

export const dataReducer = dataSlice.reducer;
