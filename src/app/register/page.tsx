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

const Register = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userExists, setUserExists] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUserExists = async () => {
      if (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
        try {
          const response = await fetch(`/api/user?email=${user.primaryEmailAddress.emailAddress}`);
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            if (data.exists) {
              router.push('/scoreboard');
            } else {
              setUserExists(false);
            }
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
  }, [isLoaded, isSignedIn, user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true); // Set loading to true
    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const team_name = formData.get('team_name') as string;
      const result = await saveUser(user?.primaryEmailAddress?.emailAddress, team_name);
      console.log(result);
      if (result.success) {
        router.push('/scoreboard');
      } else {
        console.error("Error saving user:", result.status);
      }
    } finally {
      setIsLoading(false); // Set loading to false in finally block
    }
  };

  if (userExists === false) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-semibold mb-4 text-center">Register Team</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
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
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null; // or a loading indicator or other content while checking user existence
};

export default Register;