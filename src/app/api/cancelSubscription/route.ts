import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server"; // Clerk for auth
import Stripe from "stripe";
import { setSubscriptionStatus } from "@/app/lib/data";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  try {
    // 1: Authenticate the user
    const auth_result = await auth();
    const userId = auth_result.userId;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

    // 2: Get user's email
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    // 3: Retrieve customerId from Stripe using email
    const customers = await stripe.customers.list({ email });
    console.log("customers", customers);

    if (!customers.data.length) {
      return NextResponse.json({ error: "User not found in Stripe" }, { status: 404 });
    }

    const customerId = customers.data[0].id;
    console.log("customerId", customerId);

    // 4: Get active subscription for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    console.log("subscriptions", subscriptions);

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: "No active subscriptions found" }, { status: 404 });
    }

    const subscriptionId = subscriptions.data[0].id; // Assuming user has one active subscription
    console.log("subscriptionId", subscriptionId);
    
    // 5: Cancel the subscription
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    console.log("canceledSubscription", canceledSubscription);

    // Set subscription status in the database
    await setSubscriptionStatus("inactive");

    return NextResponse.json({
      message: "Subscription canceled successfully",
      subscription: canceledSubscription,
    });

  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
