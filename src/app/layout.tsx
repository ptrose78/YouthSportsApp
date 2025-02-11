// app/layout.tsx (Server-side component)
import "./globals.css";
import { Metadata } from "next";
import ClientLayout from '@/app/RootLayout.client'; // Import ClientLayout


// Define the metadata for the app
export const metadata: Metadata = {
  title: "HoopzTracker",
  description: "The HoopzTracker App is a web-based platform designed to track stats and streamline email communications for youth basketball teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ClientLayout wraps the client-side logic */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
