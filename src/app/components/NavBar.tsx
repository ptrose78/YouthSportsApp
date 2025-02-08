"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";

const DotIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  )
}

export default function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const cancelSubscription = async () => {
    alert("Are you sure you want to cancel your subscription?");
    setLoading(true);
    try {
      const res = await fetch("/api/cancelSubscription", { method: "POST" });
      const data = await res.json();
      alert(data.message || "Subscription canceled!");
      window.location.reload();
    } catch (err) {
      alert("Failed to cancel subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 w-full">
      {/* Top bar for mobile: Contains hamburger menu */}
      <div className="sm:hidden flex justify-between items-center">
        <button onClick={toggleSidebar} className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar (Only visible on small screens when open) */}
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-95 z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-start p-4 h-full w-64">
          {/* Close button aligned to the left */}
          <button onClick={toggleSidebar} className="text-white mb-4">
            ✕
          </button>

          {/* User button at the top on small screens */}
          <SignedIn>
            <div className="text-gray-300 hover:text-white mb-4">
              <UserButton />
            </div>
          </SignedIn>

          {/* Navigation links */}
          <Link
            href="/scoreboard"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300 mb-2"
            onClick={toggleSidebar} // Close sidebar on click
          >
            Scoreboard
          </Link>
          <Link
            href="/stats"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300 mb-2"
            onClick={toggleSidebar}
          >
            Stats
          </Link>
          <Link
            href="/communication"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300 mb-2"
            onClick={toggleSidebar}
          >
            Communication
          </Link>
        </div>
      </div>

      {/* Main Navbar for Large Screens */}
      <div className="hidden sm:flex justify-between items-center mx-auto w-full">
        <div>
          <Link href="/scoreboard" className="text-white font-bold text-xl">
            HoopzTracker
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/scoreboard"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300"
          >
            Scoreboard
          </Link>
          <Link
            href="/stats"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300"
          >
            Stats
          </Link>
          <Link
            href="/communication"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300"
          >
            Communication
          </Link>

          {/* User button on large screens */}
          
          
          <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label={loading ? "Cancelling..." : "Cancel Subscription"}
            labelIcon={<DotIcon />}
            onClick={cancelSubscription}
          />
        </UserButton.MenuItems>
      </UserButton>




        </div>
      </div>

    </nav>
  );
}
