import { NextResponse } from "next/server";
import Stripe from "stripe";
import { setSubscriptionStatus } from "@/app/lib/data"; // Your function to update DB

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const paymentStatus = session.payment_status; // "paid", "unpaid", "no_payment_required"

    if (paymentStatus === "paid") {
      await setSubscriptionStatus("active"); // Save in DB
    }

    return NextResponse.json({ paymentStatus });
  } catch (error) {
    return NextResponse.json({ error: "Error retrieving session" }, { status: 500 });
  }
}
