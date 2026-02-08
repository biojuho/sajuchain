import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover', // Latest API version
    })
    : null;

export async function POST(request: Request) {
    try {
        if (!stripe) {
            throw new Error('Stripe is not initialized. Please check server configuration.');
        }
        const { priceId } = await request.json();

        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    price: priceId || 'price_12345', // Default placeholder
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/?success=true`,
            cancel_url: `${request.headers.get('origin')}/?canceled=true`,
            automatic_tax: { enabled: true },
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode || 500 });
    }
}
