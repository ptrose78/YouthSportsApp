// features/statsSlice.ts
'use client'
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPlayerStats } from "@/app/lib/data";

// Async thunk to fetch stats
export const getPlayerStats = createAsyncThunk("stats/getPlayerStats", async (gameId: string) => {
  const stats = await fetchPlayerStats(gameId);
  return stats;
});

interface StatsState {
  stats: any[];
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  stats: [],
  loading: false,
  error: null,
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPlayerStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPlayerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getPlayerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export const statsReducer = statsSlice.reducer;
