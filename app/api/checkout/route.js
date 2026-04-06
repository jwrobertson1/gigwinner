import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  starter: 'price_1TJEAjPBg5BgUcMppMxObJQQ',
  pro: 'price_1TJE7tPBg5BgUcMpIwl6SQem'
};

export async function POST(request) {
  try {
    const { tier } = await request.json();
    const priceId = PRICES[tier] || PRICES.starter;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?tier=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}