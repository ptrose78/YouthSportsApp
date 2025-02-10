import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { setSubscriptionStatus } from '@/app/lib/data';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Retrieve customer from Stripe using email
    const customers = await stripe.customers.list({ email });

    if (!customers.data.length) {
      return NextResponse.json({ isSubscribed: false, message: 'Customer not found' });
    }

    const customerId = customers.data[0].id;
    console.log("customerId", customerId);

    // Get customer's active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active', // Only retrieve active subscriptions
    });

    const hasActiveSubscription = subscriptions.data.length > 0;
    console.log("hasActiveSubscription", hasActiveSubscription);

    if (!hasActiveSubscription) {
      await setSubscriptionStatus("inactive");
    }

    return NextResponse.json({ isSubscribed: hasActiveSubscription });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

}
