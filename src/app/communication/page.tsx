"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useUser } from '@clerk/clerk-react';
import EmailForm from "@/app/components/EmailForm";
import NavBar from '../components/NavBar';
import Link from 'next/link';
import { PacmanLoader } from 'react-spinners'; // Import a spinner component

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_PRODUCTION_STRIPE_PUBLISHABLE_KEY);

const MyRestrictedComponent = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailLogs, setEmailLogs] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchEmailLogs = async () => {
      try {
        const response = await fetch("/api/getEmailLogs?email=" + user?.primaryEmailAddress?.emailAddress);

        if (!response.ok) throw new Error("Failed to fetch email logs");

        const logs = await response.json();
        console.log("logs", logs);
        setEmailLogs(logs);
      } catch (error) {
        console.error("Error fetching email logs:", error);
      }
    };

    if (user?.primaryEmailAddress?.emailAddress) {
      fetchEmailLogs();
    }
  }, [user]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
        try {
          const response = await fetch("/api/checkSubscription?email=" + user.primaryEmailAddress.emailAddress);

          console.log("response", response);

          if (response.ok) {
            const data = await response.json();
            setHasAccess(data.isSubscribed);
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
        setLoading(true);
        setHasAccess(false);
      }
    };

    checkSubscription();
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!sessionId) return;

    const checkPaymentStatus = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/checkPayment?session_id=${sessionId}`);
        const data = await response.json();
        console.log("data", data);

        if (data.paymentStatus === "paid") {
          setStatus("Subscription Activated");
        } else {
          setStatus("Payment Not Completed");
        }
      } catch (error) {
        setStatus("Error checking payment status.");
      }
      setLoading(false);
    };

    checkPaymentStatus();
  }, [sessionId]);

  const handleSubscribe = async () => {
    if (!stripePromise) return;

    const stripe = await stripePromise;

    if (!user || !user.primaryEmailAddress) {
      console.error("User not logged in or email not available");
      return;
    }

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.primaryEmailAddress.emailAddress,
          // priceId: "price_1Qp04h4RUzFrzsGP5kH3y1Eo", //Dev Stripe price ID
          priceId: "price_1QpI1wGM8GtOeckX7MXADWFp", // Production Stripe Price ID
        }),
      });

      const data = await response.json();

      if (data.sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        setSessionId(data.sessionId);

        if (error) {
          console.error("Stripe checkout error:", error);
        }
      } else {
        console.error("No session ID received from server:", data);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PacmanLoader color="#36d7b7" size={30} /> {/* Use the spinner component */}
      </div>
    );
  }

  return hasAccess ? (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Team Communication</h1>
        <EmailForm />
        <h2 className="text-2xl font-semibold mt-8">Sent Emails</h2>
        <ul className="mt-4">
          {emailLogs.map((log, index) => (
            <li key={index} className="p-2 border-b">
              <strong>To:</strong> {log.recipients.join(", ")} <br />
              <strong>Message:</strong> {log.message} <br />
              <strong>Sent At:</strong> {new Date(log.created_at).toLocaleString()}
              {log.attachment_url && (
                <p>
                  <Link href={log.attachment_url} target="_blank">
                    View Attachment
                  </Link>
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  ) : (
    <>
      <NavBar />
      <div className="flex justify-center items-center h-screen flex-col mt-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Subscribe for Access</h1>
          <p className="mt-2">Please subscribe to access this content.</p>
          <button
            onClick={handleSubscribe}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Subscribe Now
          </button>
        </div>
        <div className="opacity-40 pointer-events-none container mx-auto p-6 mt-8">
          <h1 className="text-3xl font-bold mb-4">Team Communication</h1>
          <EmailForm />
          <h2 className="text-2xl font-semibold mt-8">Sent Emails</h2>
          <ul className="mt-4">
            {emailLogs.map((log, index) => (
              <li key={index} className="p-2 border-b">
                <strong>To:</strong> {log.recipients.join(", ")} <br />
                <strong>Message:</strong> {log.message} <br />
                <strong>Sent At:</strong> {new Date(log.created_at).toLocaleString()}
                {log.attachment_url && (
                  <p>
                    <Link href={log.attachment_url} target="_blank">
                      View Attachment
                    </Link>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default MyRestrictedComponent;