'use client';

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchUsers, fetchTeams, fetchGames, fetchPlayers } from "@/app/lib/data";

// Define SiteData interface
interface SiteData {
  user_id?: string;
  team_id?: string;
  player_id?: string;
  game_id?: string;
}

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

// Async thunk to save siteData
export const saveCreatedSiteData = createAsyncThunk("data/saveCreatedSiteData", async (siteData: SiteData) => {
  const response = await fetch("/api/siteData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(siteData),
  });

  if (!response.ok) throw new Error("Failed to save site-data");

  return siteData;
});

// Async thunk to update siteData
export const saveUpdatedSiteData = createAsyncThunk("data/saveUpdatedSiteData", async (siteData: SiteData) => {
  const response = await fetch("/api/siteData", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(siteData),
  });

  if (!response.ok) throw new Error("Failed to save site-data");

  return siteData;
});

// Async thunk to update playerData
export const saveUpdatedPlayerData = createAsyncThunk("data/saveUpdatedPlayerData", async (siteData: SiteData) => {
  const response = await fetch("/api/player", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(siteData),
  });

  if (!response.ok) throw new Error("Failed to save site-data");

  return siteData;
});

// State interface
interface DataState {
  users: any[];
  teams: any[];
  games: any[];
  players: any[];
  currentGameId: string | null;
  siteData: SiteData;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: DataState = {
  users: [],
  teams: [],
  games: [],
  players: [],
  currentGameId: null,
  siteData: {},  // Store siteData in Redux
  loading: false,
  error: null,
};

// Slice
const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    updateSiteData(state, action: PayloadAction<SiteData>) {
      state.siteData = { ...state.siteData, ...action.payload };
    },
    setSiteData(state, action: PayloadAction<SiteData>) {
      state.siteData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Users
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      // Teams
      .addCase(getTeams.fulfilled, (state, action) => {
        state.teams = action.payload;
      })
      // Games
      .addCase(getGames.fulfilled, (state, action) => {
        state.games = action.payload;
      })
      // Players
      .addCase(getPlayers.fulfilled, (state, action) => {
        state.players = action.payload;
      })
      // Save created siteData
      .addCase(saveCreatedSiteData.fulfilled, (state, action) => {
        state.siteData = action.payload;
      })
      // Save updated siteData
      .addCase(saveUpdatedSiteData.fulfilled, (state, action) => {
        state.siteData = action.payload;
      })
      // Save updated playerData
      .addCase(saveUpdatedPlayerData.fulfilled, (state, action) => {
        state.siteData = action.payload;
      });
  },
});

// Export actions and reducer
export const { updateSiteData, setSiteData } = dataSlice.actions;
export const selectUsers = (state: { data: { users: any } }) => state.data.users;
export const selectTeams = (state: { data: { teams: any } }) => state.data.teams;
export const selectGames = (state: { data: { games: any } }) => state.data.games;
export const selectPlayers = (state: { data: { players: any } }) => state.data.players;
export const dataReducer = dataSlice.reducer;
