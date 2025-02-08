'use client'

import { SignIn } from '@clerk/clerk-react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
 
const HomePage = () => {
  const { isSignedIn, user } = useUser();
  console.log(isSignedIn);
  console.log(user);
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
    <div>
      {/* Show the SignIn form when user is not signed in and not on sign-up page */}
        <SignIn
          fallbackRedirectUrl="/register"
        />
    </div>
  );
};

export default HomePage;
