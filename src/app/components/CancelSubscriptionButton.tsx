import { useState } from "react";

export default function CancelSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCancelSubscription = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/cancel-subscription", { method: "POST" });
      const result = await response.json();

      if (response.ok) {
        setMessage("Subscription canceled successfully.");
      } else {
        setMessage(result.error || "Failed to cancel subscription.");
      }
    } catch (error) {
      setMessage("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleCancelSubscription} disabled={loading}>
        {loading ? "Canceling..." : "Cancel Subscription"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
