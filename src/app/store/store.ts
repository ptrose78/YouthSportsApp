'use client'

import { configureStore } from "@reduxjs/toolkit";

import { dataReducer } from "./features/dataSlice";

export const store = configureStore({
  reducer: {
    data: dataReducer
  },
});

export default store;

// TypeScript helpers (optional for strong typing in the app)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
