// app/layout.tsx (Server-side component)
import { Metadata } from "next";
import ClientLayout from '@/app/RootLayout.client'; // Import ClientLayout

// Define the metadata for the app
export const metadata: Metadata = {
  title: "Youth Sports App",
  description: "Youth Sports App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ClientLayout wraps the client-side logic */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
