'use client'; // Important for client-side interaction

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js'; 
import { useUser } from '@clerk/clerk-react';
import { getEmailLogs } from "@/app/lib/data";
import EmailForm from "@/app/components/EmailForm";


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY); // Initialize Stripe

const MyRestrictedComponent = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailLogs, setEmailLogs] = useState([]);

  useEffect(() => {
    const fetchEmailLogs = async () => {
      const logs = await getEmailLogs(); // Fetch logs on the server
      setEmailLogs(logs);
    };
    fetchEmailLogs();
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
        try {
          const response = await fetch(`/api/checkSubscription?email=${user.primaryEmailAddress.emailAddress}`);
          console.log("response", response.ok);
          if (response.ok) {
            const data = await response.json();
            console.log("data", data);
            setHasAccess(data.isSubscribed);
            // setHasAccess(false);
          } else {
            console.error("Error checking subscription:", response.status);
            setHasAccess(false);
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
          setHasAccess(false);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true); // Keep loading true if not loaded or signed in
        setHasAccess(false);
      }
    };

    checkSubscription();
  }, [isLoaded, isSignedIn, user]);

  const handleSubscribe = async () => {
    console.log("handleSubscribe");
    if (!stripePromise) return;
  
    const stripe = await stripePromise;
    console.log(stripe);
  
    if (!user || !user.primaryEmailAddress) {
      console.error("User not logged in or email not available");
      return;
    }
    console.log(user.primaryEmailAddress.emailAddress);
    console.log(user);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.primaryEmailAddress.emailAddress,
          productId: 'price_1Qp04h4RUzFrzsGP5kH3y1Eo', // Stripe Price ID
        }),
      });    
      console.log("response", response);
      const data = await response.json();
      console.log('Stripe API response:', data); // Log response
  
      if (data.sessionId) {
        console.log("data.sessionId", data.sessionId);
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
  
        if (error) {
          console.error('Stripe checkout error:', error);
        }
      } else {
        console.error('No session ID received from server:', data);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  return hasAccess ? (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Team Communication</h1>

      {/* Email Form */}
      <EmailForm />

      {/* Email Log */}
      <h2 className="text-2xl font-semibold mt-8">Sent Emails</h2>
      <ul className="mt-4">
        {emailLogs.map((log, index) => (
          <li key={index} className="p-2 border-b">
            <strong>To:</strong> {log.recipients.join(", ")} <br />
            <strong>Message:</strong> {log.message} <br />
            <strong>Sent At:</strong> {new Date(log.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Subscribe for Access</h1>
      <p className="mt-2">Please subscribe to access this content.</p>
      <button
        onClick={handleSubscribe}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Subscribe Now
      </button>
      <div className="opacity-40 pointer-events-none container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Team Communication</h1>

        {/* Email Form */}
        <EmailForm />

        {/* Email Log */}
        <h2 className="text-2xl font-semibold mt-8">Sent Emails</h2>
        <ul className="mt-4">
          {emailLogs.map((log, index) => (
            <li key={index} className="p-2 border-b">
              <strong>To:</strong> {log.recipients.join(", ")} <br />
              <strong>Message:</strong> {log.message} <br />
              <strong>Sent At:</strong> {new Date(log.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyRestrictedComponent;
