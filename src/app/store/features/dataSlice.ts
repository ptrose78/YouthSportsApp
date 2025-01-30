'use client';

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUsers, fetchTeams, fetchGames, fetchPlayers } from "@/app/lib/data";

// Async thunks for fetching data
export const getUsers = createAsyncThunk("data/getUsers", async () => {
  return await fetchUsers();
});

export const getTeams = createAsyncThunk("data/getTeams", async () => {
  return await fetchTeams();
});

export const getGames = createAsyncThunk("data/getGames", async () => {
  return await fetchGames();
});

export const getPlayers = createAsyncThunk("data/getPlayers", async () => {
  const players = await fetchPlayers();
  
  // Remove duplicates based on `id`
  return players.filter(
    (value, index, self) => index === self.findIndex((t) => t.id === value.id)
  );
});

// State interface
interface DataState {
  users: any[];
  teams: any[];
  games: any[];
  players: any[];
  currentGame: any;
  gameClock: number; // New state for game clock
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
  gameClock: 0, // Initialize clock at 0
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
    startGameClock: (state) => {
      state.isGameRunning = true;
    },
    stopGameClock: (state) => {
      state.isGameRunning = false;
    },
    resetGameClock: (state) => {
      state.gameClock = 0;
      state.isGameRunning = false;
    },
    incrementGameClock: (state) => {
      if (state.isGameRunning) {
        state.gameClock += 1;
      }
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
  incrementGameClock 
} = dataSlice.actions;

export const selectCurrentGame = (state: { data: DataState }) => state.data.currentGame;
export const selectUsers = (state: { data: DataState }) => state.data.users;
export const selectTeams = (state: { data: DataState }) => state.data.teams;
export const selectGames = (state: { data: DataState }) => state.data.games;
export const selectPlayers = (state: { data: DataState }) => state.data.players;
export const selectGameClock = (state: { data: DataState }) => state.data.gameClock;
export const selectIsGameRunning = (state: { data: DataState }) => state.data.isGameRunning;

export const dataReducer = dataSlice.reducer;
