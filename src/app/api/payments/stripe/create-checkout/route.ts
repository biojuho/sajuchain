import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { serverLogger } from '@/lib/server-logger';

export async function POST(req: NextRequest) {
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

    try {
        const authSupabase = await createServerClient();
        if (!authSupabase) {
            serverLogger.error('stripe.create_checkout.auth_missing', { requestId });
            return NextResponse.json({ error: 'Auth service not configured', requestId }, { status: 503 });
        }

        const { data: { user }, error: authError } = await authSupabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized', requestId }, { status: 401 });
        }

        const requestBody = await req.json().catch(() => ({}));
        const { priceId, successUrlParams } = requestBody;

        if (!priceId) {
            return NextResponse.json({ error: 'Missing priceId', requestId }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
        
        let successTarget = `${appUrl}/payment/success`;
        if (successUrlParams) {
             successTarget += `?${successUrlParams}&session_id={CHECKOUT_SESSION_ID}`;
        } else {
             successTarget += `?session_id={CHECKOUT_SESSION_ID}`;
        }

        const cancelUrl = `${appUrl}/`;

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successTarget,
            cancel_url: cancelUrl,
            client_reference_id: user.id, // VERY IMPORTANT: Links the session to the supabase UUID
            metadata: {
                user_id: user.id
            }
        });

        if (!session.url) {
            throw new Error('Failed to generate session URL from Stripe');
        }

        serverLogger.info('stripe.create_checkout.success', { requestId, userId: user.id, sessionId: session.id });

        return NextResponse.json({ url: session.url });

    } catch (error: Error | unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        serverLogger.error('stripe.create_checkout.error', { requestId, error: errorMessage });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
