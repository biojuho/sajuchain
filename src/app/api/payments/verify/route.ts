import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getEntitlementForUser } from '@/lib/entitlement';
import { parsePaymentVerificationPayload } from '@/lib/payments/verification';
import { validateTossConfirmation } from '@/lib/payments/toss-confirmation';
import { serverLogger } from '@/lib/server-logger';

const TOSS_PAYMENTS_SECRET_KEY = process.env.TOSS_PAYMENTS_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function readJsonLikeResponse(response: Response): Promise<unknown> {
  const rawBody = await response.text();
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return { rawBody };
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  try {
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      serverLogger.warn('payments.verify.invalid_json', { requestId });
      return NextResponse.json(
        { error: 'Request body must be valid JSON', requestId },
        { status: 400 }
      );
    }

    const parseResult = parsePaymentVerificationPayload(requestBody);
    if (!parseResult.ok) {
      serverLogger.warn('payments.verify.invalid_payload', {
        requestId,
        field: parseResult.error.field,
      });
      return NextResponse.json(
        { error: parseResult.error.message, field: parseResult.error.field, requestId },
        { status: 400 }
      );
    }
    const { paymentKey, orderId, amount } = parseResult.value;

    const authSupabase = await createServerClient();
    if (!authSupabase) {
      serverLogger.error('payments.verify.auth_service_missing', { requestId });
      return NextResponse.json({ error: 'Auth service not configured', requestId }, { status: 503 });
    }

    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      serverLogger.warn('payments.verify.unauthorized', {
        requestId,
        authError: authError?.message || null,
      });
      return NextResponse.json({ error: 'Unauthorized', requestId }, { status: 401 });
    }

    if (!TOSS_PAYMENTS_SECRET_KEY) {
      serverLogger.error('payments.verify.toss_key_missing', { requestId });
      return NextResponse.json({ error: 'Payment service not configured', requestId }, { status: 503 });
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

    const tossBody = await readJsonLikeResponse(response);

    if (!response.ok) {
        const tossErrorCode =
          tossBody && typeof tossBody === 'object' && !Array.isArray(tossBody) && 'code' in tossBody
            ? (tossBody as { code?: unknown }).code
            : null;
        serverLogger.error('payments.verify.toss_verification_failed', {
          requestId,
          status: response.status,
          code: tossErrorCode,
        });
        return NextResponse.json(
          { error: 'Payment verification failed', details: tossBody, requestId },
          { status: response.status }
        );
    }

    if (!tossBody || typeof tossBody !== 'object' || Array.isArray(tossBody)) {
      serverLogger.error('payments.verify.invalid_toss_response', {
        requestId,
        status: response.status,
      });
      return NextResponse.json(
        { error: 'Payment service returned an invalid response', requestId },
        { status: 502 }
      );
    }

    const paymentData = tossBody;

    const confirmationResult = validateTossConfirmation(paymentData, { orderId, amount });
    if (!confirmationResult.ok) {
      serverLogger.error('payments.verify.confirmation_mismatch', {
        requestId,
        error: confirmationResult.error,
        mismatch: confirmationResult.mismatch || null,
      });
      return NextResponse.json(
        { error: 'Payment confirmation mismatch', requestId },
        { status: 409 }
      );
    }

    // 2. Save to Supabase (only if verification succeeded)
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        serverLogger.error('payments.verify.supabase_credentials_missing', { requestId });
        const entitlement = await getEntitlementForUser(user.id);
        return NextResponse.json({
            success: true,
            data: paymentData,
            entitlement,
            warning: 'Payment verified but record not saved',
            requestId,
        });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: existingPayment, error: existingPaymentError } = await supabase
      .from('payments')
      .select('user_id, order_id, amount, status')
      .eq('payment_key', paymentKey)
      .maybeSingle();

    if (existingPaymentError) {
      serverLogger.error('payments.verify.lookup_failed', {
        requestId,
        code: existingPaymentError.code || null,
        message: existingPaymentError.message,
      });
      return NextResponse.json({ error: 'Payment lookup failed', requestId }, { status: 500 });
    }

    if (existingPayment && existingPayment.user_id !== user.id) {
      serverLogger.warn('payments.verify.payment_key_conflict', {
        requestId,
        paymentKey,
        ownerUserId: existingPayment.user_id,
        actorUserId: user.id,
      });
      return NextResponse.json(
        { error: 'Payment already claimed by another user', requestId },
        { status: 409 }
      );
    }

    if (
      existingPayment &&
      (existingPayment.order_id !== orderId || Number(existingPayment.amount) !== amount)
    ) {
      serverLogger.warn('payments.verify.payment_payload_conflict', {
        requestId,
        paymentKey,
        existingOrderId: existingPayment.order_id,
        incomingOrderId: orderId,
        existingAmount: existingPayment.amount,
        incomingAmount: amount,
      });
      return NextResponse.json({ error: 'Payment payload conflict', requestId }, { status: 409 });
    }

    const { error: dbError } = await supabase
        .from('payments')
        .upsert({
            payment_key: paymentKey,
            order_id: orderId,
            amount,
            status: 'DONE',
            user_id: user.id,
        }, { onConflict: 'payment_key' });
        
    if (dbError) {
        serverLogger.error('payments.verify.persist_failed', {
          requestId,
          code: dbError.code || null,
          message: dbError.message,
        });
        // We don't fail the request to the client because payment ITSELF was successful.
    }

    const entitlement = await getEntitlementForUser(user.id);
    return NextResponse.json({ success: true, data: paymentData, entitlement, requestId });

  } catch (e: unknown) {
    serverLogger.error('payments.verify.exception', {
      requestId,
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: 'Internal Server Error', requestId }, { status: 500 });
  }
}
