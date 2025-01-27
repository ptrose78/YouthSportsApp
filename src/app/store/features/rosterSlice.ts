'use client'
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPlayers } from "@/app/lib/data";

export const getRoster = createAsyncThunk("roster/getRoster", async () => {
  const roster = await fetchPlayers();
  return roster;
});

interface RosterState {
  players: any[];
  loading: boolean;
  error: string | null;
}

const initialState: RosterState = {
  players: [],
  loading: false,
  error: null,
};

const rosterSlice = createSlice({
  name: "roster",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRoster.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRoster.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload;
      })
      .addCase(getRoster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export const rosterReducer = rosterSlice.reducer;
