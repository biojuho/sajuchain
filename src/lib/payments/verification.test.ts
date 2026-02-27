import { describe, expect, it } from 'vitest';

import { parsePaymentVerificationPayload } from '@/lib/payments/verification';

describe('parsePaymentVerificationPayload', () => {
  it('parses a valid payload', () => {
    const result = parsePaymentVerificationPayload({
      paymentKey: 'pay_123',
      orderId: 'order_987',
      amount: '12000',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        paymentKey: 'pay_123',
        orderId: 'order_987',
        amount: 12000,
      });
    }
  });

  it('rejects an invalid amount', () => {
    const result = parsePaymentVerificationPayload({
      paymentKey: 'pay_123',
      orderId: 'order_987',
      amount: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe('amount');
    }
  });
});
