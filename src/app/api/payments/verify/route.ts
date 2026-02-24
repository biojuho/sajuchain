import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TOSS_PAYMENTS_SECRET_KEY = process.env.TOSS_PAYMENTS_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!TOSS_PAYMENTS_SECRET_KEY) {
      console.error("Missing TOSS_PAYMENTS_SECRET_KEY");
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 });
    }

    // 1. Verify with Toss Payments
    const encryptedSecretKey = Buffer.from(`${TOSS_PAYMENTS_SECRET_KEY}:`).toString('base64');
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Toss Verification Failed:', errorData);
        return NextResponse.json({ error: 'Payment verification failed', details: errorData }, { status: response.status });
    }

    const paymentData = await response.json();

    // 2. Save to Supabase (only if verification succeeded)
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Missing Supabase credentials - payment verified but NOT persisted");
        return NextResponse.json({ success: true, data: paymentData, warning: 'Payment verified but record not saved' });
    } else {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Try to identify user if auth cookie exists, or pass userId from client if needed.
        // For now, we'll leave user_id null if not strictly authenticated in this request context, 
        // or you could verify the session token from headers.
        
        const { error: dbError } = await supabase
            .from('payments')
            .insert({
                payment_key: paymentKey,
                order_id: orderId,
                amount: amount,
                status: 'DONE',
                // user_id: ... (Optional identification)
            });
            
        if (dbError) {
            console.error('Failed to save payment record:', dbError);
            // We don't fail the request to the client because payment ITSELF was successful.
        }
    }

    return NextResponse.json({ success: true, data: paymentData });

  } catch (e: unknown) {
    console.error('Payment Confirm Error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
