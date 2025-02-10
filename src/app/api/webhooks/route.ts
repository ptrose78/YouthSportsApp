import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateSubscriptionStatusInDB } from "@/app/lib/data";  

const stripe = new Stripe(process.env.PRODUCTION_STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      // update subscription status
      await updateSubscriptionStatusInDB("canceled");     
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
