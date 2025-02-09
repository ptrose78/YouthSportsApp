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
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  //check if user exists
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

  //handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const team_name = formData.get('team_name') as string;
    const result = await saveUser(user?.primaryEmailAddress?.emailAddress, team_name);
    console.log(result);
    if (result.success) {
      router.push('/scoreboard');
    } else {
      console.error("Error saving user:", result.status);
    }
  };


  //if user does not exist, show the form
  if (userExists === false) {  
    return (
        <form onSubmit={handleSubmit}>
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
    );
  }
};

export default Register;