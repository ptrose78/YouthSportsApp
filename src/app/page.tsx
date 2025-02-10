'use client'

import { SignIn } from '@clerk/clerk-react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
 
const HomePage = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  // This effect runs when the user is signed in
  useEffect(() => {
    if (isSignedIn && user) {
      // Redirect to the register page if the user is signed in
      console.log("redirecting to register1");

      router.push('/register');
      console.log("redirecting to register2");
    }
  }, [isSignedIn, user, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
    <div className="grid place-items-center h-screen min-h-screen"> {/* Center with Grid */}
      <SignIn
        fallbackRedirectUrl="/register"
      />
    </div>
    </div>
  );
};

export default HomePage;
