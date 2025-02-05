"use client";

import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const saveUser = async (email: string, team_name: string) => {
  try {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, team_name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add user.");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error adding user:", error);
    alert(error.message);
  }
};

const UserForm = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userExists, setUserExists] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  useEffect(() => {
    const checkUserExists = async () => {
      if (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
        try {
          const response = await fetch(`/api/user?email=${user.primaryEmailAddress.emailAddress}`);
          if (response.ok) {
            const data = await response.json();
            setUserExists(data.exists);
          } else {
            console.error("Error checking user existence:", response.status);
            setUserExists(false);
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
          setUserExists(false);
        }
      } else {
        setUserExists(null);
      }
    };

    checkUserExists();
  }, [isLoaded, isSignedIn, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isLoaded ||!isSignedIn) {
      return;
    }

    setIsLoading(true); // Set loading to true

    const formData = new FormData(e.currentTarget);
    const team_name = formData.get("team_name") as string;

    const clerkEmail = user?.primaryEmailAddress?.emailAddress;

    if (!clerkEmail) {
      console.error("Clerk email not available.");
      setIsLoading(false); // Reset loading state
      return;
    }

    try {
      const result = await saveUser(clerkEmail, team_name);
      console.log("User saved:", result);
      const form = e.target as HTMLFormElement;
      if (form) {
        form.reset();
      }
      alert("User registered successfully!");
      router.push('/scoreboard');
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setIsLoading(false); // Reset loading state even on error
    } finally {
      setIsLoading(false); // Ensure loading is reset regardless of success/failure
    }
  };

  if (!isLoaded ||!isSignedIn) {
    return <div className="flex justify-center items-center">Loading or Please Sign In</div>;
  }

  if (userExists === true) {
    return null;
  }

  if (userExists === false) {
    return (
      <div className="flex justify-center items-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">
            Register User
          </h2>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={user?.primaryEmailAddress?.emailAddress || ""}
              readOnly
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Team Name
            </label>
            <input
              type="text"
              name="team_name"
              placeholder="Enter team name"
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold p-2 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isLoading} // Disable the button while loading
          >
            {isLoading? "Submitting...": "Submit"} {/* Show loading text */}
          </button>
        </form>
      </div>
    );
  }

  return <div className="flex justify-center items-center h-screen">Loading...</div>;
};

export default UserForm;