export interface PaymentVerificationPayload {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PayloadParseError {
  field: 'paymentKey' | 'orderId' | 'amount';
  message: string;
}

type ParseSuccess = {
  ok: true;
  value: PaymentVerificationPayload;
};

type ParseFailure = {
  ok: false;
  error: PayloadParseError;
};

function toIntegerAmount(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    return Number(value.trim());
  }

  return Number.NaN;
}

export function parsePaymentVerificationPayload(input: unknown): ParseSuccess | ParseFailure {
  if (!input || typeof input !== 'object') {
    return {
      ok: false,
      error: { field: 'paymentKey', message: 'Request body must be a JSON object' },
    };
  }

  const payload = input as Partial<Record<'paymentKey' | 'orderId' | 'amount', unknown>>;
  const paymentKey = typeof payload.paymentKey === 'string' ? payload.paymentKey.trim() : '';
  const orderId = typeof payload.orderId === 'string' ? payload.orderId.trim() : '';
  const amount = toIntegerAmount(payload.amount);

  if (!paymentKey) {
    return {
      ok: false,
      error: { field: 'paymentKey', message: 'paymentKey is required' },
    };
  }

  if (!orderId) {
    return {
      ok: false,
      error: { field: 'orderId', message: 'orderId is required' },
    };
  }

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return {
      ok: false,
      error: { field: 'amount', message: 'amount must be a positive integer' },
    };
  }

  return {
    ok: true,
    value: {
      paymentKey,
      orderId,
      amount,
    },
  };
}
