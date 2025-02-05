// app/RootLayout.client.tsx (Client-side component)
"use client"; // Marks this as a Client Component

import { ClerkProvider} from "@clerk/nextjs";
import { Provider } from "react-redux";
import { store } from "./store/store"; // Your Redux store
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import NavBar from "@/app/components/NavBar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
          <NavBar />
          {children}
        </DndProvider>
      </Provider>
    </ClerkProvider>
  );
}
