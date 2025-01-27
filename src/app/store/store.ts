'use client'

import { configureStore } from "@reduxjs/toolkit";
import { statsReducer } from "./features/statsSlice"; // Update the path if necessary
import { rosterReducer } from "./features/rosterSlice";

export const store = configureStore({
  reducer: {
    stats: statsReducer,
    roster: rosterReducer
  },
});

export default store;

// TypeScript helpers (optional for strong typing in the app)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
