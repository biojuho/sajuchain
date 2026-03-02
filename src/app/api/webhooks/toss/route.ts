import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serverLogger } from '@/lib/server-logger';

// Setup Supabase admin client for webhooks (bypasses RLS)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Robust server-side Webhook listener for Toss Payments.
 * Securely verifies incoming events and updates the database.
 */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  try {
    const requestBody = await req.json();

    // Log the incoming webhook for auditing
    serverLogger.info('webhooks.toss.received', {
      requestId,
      eventType: requestBody.eventType, // e.g. PAYMENT_STATUS_CHANGED
      paymentKey: requestBody.data?.paymentKey,
    });

    if (!requestBody.data || !requestBody.data.paymentKey) {
      serverLogger.warn('webhooks.toss.invalid_payload', { requestId });
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { paymentKey, status, secret } = requestBody.data;

    // Optional: Validate the secret to ensure it's from Toss
    // (If you set up a secret in Toss Developer Console)
    if (process.env.TOSS_WEBHOOK_SECRET && secret !== process.env.TOSS_WEBHOOK_SECRET) {
      serverLogger.warn('webhooks.toss.unauthorized', { requestId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update payment status based on Toss webhook
    // This acts as a robust fail-safe incase the client disconnected before the client-side redirect finished.
    const { error: dbError } = await supabase
      .from('payments')
      .update({
        status: status, // e.g. "DONE", "CANCELED", "PARTIAL_CANCELED", "WAITING_FOR_DEPOSIT"
      })
      .eq('payment_key', paymentKey);

    if (dbError) {
      serverLogger.error('webhooks.toss.db_update_failed', {
        requestId,
        error: dbError.message,
      });
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    serverLogger.info('webhooks.toss.processed_successfully', {
      requestId,
      paymentKey,
      status,
    });

    return NextResponse.json({ success: true, message: 'Webhook processed' });

  } catch (err: unknown) {
    serverLogger.error('webhooks.toss.exception', {
      requestId,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
