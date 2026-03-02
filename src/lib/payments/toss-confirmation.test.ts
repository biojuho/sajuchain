import { describe, expect, it } from 'vitest';

import { validateTossConfirmation } from '@/lib/payments/toss-confirmation';

describe('validateTossConfirmation', () => {
  it('accepts a valid Toss confirmation', () => {
    const result = validateTossConfirmation(
      {
        orderId: 'order_123',
        totalAmount: 990,
        status: 'DONE',
      },
      { orderId: 'order_123', amount: 990 }
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payment.totalAmount).toBe(990);
    }
  });

  it('rejects mismatched amount', () => {
    const result = validateTossConfirmation(
      {
        orderId: 'order_123',
        totalAmount: 1200,
        status: 'DONE',
      },
      { orderId: 'order_123', amount: 990 }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.mismatch?.field).toBe('amount');
    }
  });

  it('rejects non-DONE payment status', () => {
    const result = validateTossConfirmation(
      {
        orderId: 'order_123',
        totalAmount: 990,
        status: 'CANCELED',
      },
      { orderId: 'order_123', amount: 990 }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.mismatch?.field).toBe('status');
    }
  });

  it('rejects decimal totalAmount even when orderId/status match', () => {
    const result = validateTossConfirmation(
      {
        orderId: 'order_123',
        totalAmount: 990.5,
        status: 'DONE',
      },
      { orderId: 'order_123', amount: 990 }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Toss response is missing required fields');
    }
  });

  it('rejects invalid expected amount before comparing payload', () => {
    const result = validateTossConfirmation(
      {
        orderId: 'order_123',
        totalAmount: 990,
        status: 'DONE',
      },
      { orderId: 'order_123', amount: 0 }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Expected payment amount is invalid');
    }
  });
});
