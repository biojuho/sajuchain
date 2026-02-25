import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover', // Stable API version
    })
    : null;

export async function POST(request: Request) {
    try {
        if (!stripe) {
            return NextResponse.json({ error: 'Stripe is not initialized. Please check server configuration.' }, { status: 503 });
        }
        const { priceId } = await request.json();

        if (!priceId) {
            return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/fail`,
            automatic_tax: { enabled: true },
        });

        if (!session.url) {
            return NextResponse.json({ error: 'Failed to create checkout URL' }, { status: 500 });
        }

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const statusCode = (err as { statusCode?: number }).statusCode || 500;
        return NextResponse.json({ error: message }, { status: statusCode });
    }
}
