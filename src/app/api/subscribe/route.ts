import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    if (req.headers.get('content-type') !== 'application/json') {
      return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 400 });
    }

    const { userEmail, productId } = await req.json();
    console.log('Received:', userEmail, productId);

    if (!userEmail || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a customer (if not existing)
    const customer = await stripe.customers.create({
      email: userEmail,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customer.id, 
      line_items: [
        {
          price: productId, // Stripe Price ID
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/communication`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/communication`,
    });

    console.log('Created Stripe Session:', session.id);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
