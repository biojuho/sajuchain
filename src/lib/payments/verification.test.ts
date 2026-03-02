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

  it('rejects a decimal amount', () => {
    const result = parsePaymentVerificationPayload({
      paymentKey: 'pay_123',
      orderId: 'order_987',
      amount: 10.5,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe('amount');
      expect(result.error.message).toBe('amount must be a positive integer');
    }
  });

  it('rejects an unsafe integer amount', () => {
    const result = parsePaymentVerificationPayload({
      paymentKey: 'pay_123',
      orderId: 'order_987',
      amount: Number.MAX_SAFE_INTEGER + 1,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe('amount');
    }
  });
});
