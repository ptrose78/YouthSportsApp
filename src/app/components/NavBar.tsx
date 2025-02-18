"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";

const DotIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  );
};

export default function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const cancelSubscription = async () => {
    const confirmed = confirm("Are you sure you want to cancel your subscription?");
    if (confirmed) {
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
    } else {
      console.log("Subscription cancellation cancelled by user.");
    }
  };

  return (
    <nav className="relative bg-orange-500 w-full">
      <div className="container mx-auto px-4 py-4 flex items-center z-10 relative">
        <div className="flex-grow">
          <Link href="/scoreboard" className="text-white font-bold text-xl">
            HoopzTracker
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex space-x-4">
            <Link
              href="/scoreboard"
              className="text-gray-100 hover:text-white px-3 py-2 rounded-md transition duration-300"
            >
              Scoreboard
            </Link>
            <Link
              href="/stats"
              className="text-gray-100 hover:text-white px-3 py-2 rounded-md transition duration-300"
            >
              Stats
            </Link>
            <Link
              href="/communication"
              className="text-gray-100 hover:text-white px-3 py-2 rounded-md transition duration-300"
            >
              Communication
            </Link>
          </div>

          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label={loading ? "Cancelling..." : "Cancel Subscription"}
                labelIcon={<DotIcon />}
                onClick={cancelSubscription}
              />
            </UserButton.MenuItems>
          </UserButton>

          <div className="sm:hidden">
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
        </div>

        <div
          className={`fixed inset-0 bg-gray-800 bg-opacity-95 z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col items-start p-4 h-full w-64">
            <button onClick={toggleSidebar} className="text-white mb-4">
              ✕
            </button>

            <SignedIn>
              <div className="text-gray-300 hover:text-white mb-4">
                <UserButton />
              </div>
            </SignedIn>

            <Link
              href="/scoreboard"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300 mb-2"
              onClick={closeSidebar}
            >
              Scoreboard
            </Link>
            <Link
              href="/stats"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300 mb-2"
              onClick={closeSidebar}
            >
              Stats
            </Link>
            <Link
              href="/communication"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300 mb-2"
              onClick={closeSidebar}
            >
              Communication
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
