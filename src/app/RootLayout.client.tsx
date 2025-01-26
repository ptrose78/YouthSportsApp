// app/RootLayout.client.tsx (Client-side component)
"use client"; // Marks this as a Client Component

import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Provider } from "react-redux";
import { store } from "./store/store"; // Your Redux store

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <Provider store={store}>
        {/* Conditional rendering for SignedIn and SignedOut states */}
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        {children}
      </Provider>
    </ClerkProvider>
  );
}
