import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { serverLogger } from '@/lib/server-logger';
import Stripe from 'stripe';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

    if (!STRIPE_WEBHOOK_SECRET) {
        serverLogger.error('stripe.webhook.missing_secret', { requestId });
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
        serverLogger.warn('stripe.webhook.missing_signature', { requestId });
        return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: unknown) {
        serverLogger.error('stripe.webhook.signature_verification_failed', { 
            requestId, 
            error: err instanceof Error ? err.message : String(err) 
        });
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const userId = session.client_reference_id || session.metadata?.user_id;
        const paymentKey = session.payment_intent;
        const orderId = session.id;
        const amount = session.amount_total;

        if (!userId || !paymentKey || !amount) {
            serverLogger.error('stripe.webhook.missing_critical_data', { 
                requestId, 
                sessionId: session.id,
                userId,
                paymentKey,
                amount
            });
            // We return 200 so Stripe doesn't endlessly retry an invalid payload
            return NextResponse.json({ received: true, error: 'Missing data' });
        }

        serverLogger.info('stripe.webhook.session_completed', { 
            requestId, 
            sessionId: session.id,
            userId,
            amount
        });

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
             serverLogger.error('stripe.webhook.supabase_credentials_missing', { requestId });
             return NextResponse.json({ received: true, error: 'Supabase credentials missing' });
        }

        try {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
            const { error: dbError } = await supabase
                .from('payments')
                .upsert({
                    payment_key: typeof paymentKey === 'string' ? paymentKey : paymentKey.id,
                    order_id: orderId,
                    amount: amount,
                    status: 'DONE',
                    user_id: userId,
                }, { onConflict: 'payment_key' });

            if (dbError) {
                serverLogger.error('stripe.webhook.persist_failed', {
                  requestId,
                  code: dbError.code || null,
                  message: dbError.message,
                });
                return NextResponse.json({ error: 'Database persist failed' }, { status: 500 });
            }
        } catch (dbEx) {
             serverLogger.error('stripe.webhook.db_exception', {
                  requestId,
                  error: dbEx instanceof Error ? dbEx.message : String(dbEx)
             });
             return NextResponse.json({ error: 'Internal server error during persist' }, { status: 500 });
        }
    } else {
        serverLogger.info('stripe.webhook.ignored_event', { requestId, type: event.type });
    }

    return NextResponse.json({ received: true });
}
