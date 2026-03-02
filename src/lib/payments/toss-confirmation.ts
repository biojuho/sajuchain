interface ConfirmedPayment {
  orderId: string;
  totalAmount: number;
  status: string;
}

interface ConfirmationMismatch {
  field: 'orderId' | 'amount' | 'status';
  expected: string | number;
  actual: string | number;
}

type ValidationSuccess = {
  ok: true;
  payment: ConfirmedPayment;
};

type ValidationFailure = {
  ok: false;
  error: string;
  mismatch?: ConfirmationMismatch;
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

export function validateTossConfirmation(
  payload: unknown,
  expected: { orderId: string; amount: number }
): ValidationSuccess | ValidationFailure {
  if (!Number.isSafeInteger(expected.amount) || expected.amount <= 0) {
    return { ok: false, error: 'Expected payment amount is invalid' };
  }

  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Toss response must be an object' };
  }

  const parsed = payload as Partial<Record<'orderId' | 'totalAmount' | 'status', unknown>>;
  const orderId = typeof parsed.orderId === 'string' ? parsed.orderId.trim() : '';
  const totalAmount = toIntegerAmount(parsed.totalAmount);
  const status = typeof parsed.status === 'string' ? parsed.status.trim() : '';

  if (!orderId || !Number.isSafeInteger(totalAmount) || totalAmount <= 0 || !status) {
    return { ok: false, error: 'Toss response is missing required fields' };
  }

  if (orderId !== expected.orderId) {
    return {
      ok: false,
      error: 'orderId mismatch',
      mismatch: { field: 'orderId', expected: expected.orderId, actual: orderId },
    };
  }

  if (totalAmount !== expected.amount) {
    return {
      ok: false,
      error: 'amount mismatch',
      mismatch: { field: 'amount', expected: expected.amount, actual: totalAmount },
    };
  }

  if (status !== 'DONE') {
    return {
      ok: false,
      error: 'payment status is not DONE',
      mismatch: { field: 'status', expected: 'DONE', actual: status },
    };
  }

  return {
    ok: true,
    payment: {
      orderId,
      totalAmount,
      status,
    },
  };
}
