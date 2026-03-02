import { describe, expect, it } from 'vitest';

import { resolveEntitlementState } from '@/lib/entitlement';

describe('resolveEntitlementState', () => {
  it('marks premium when payment exists', () => {
    const result = resolveEntitlementState({
      latestPaymentAt: '2026-02-26T10:00:00.000Z',
      freePremiumRemaining: 0,
    });

    expect(result.isPremium).toBe(true);
    expect(result.freePremiumRemaining).toBe(0);
  });

  it('normalizes free premium count and keeps non-premium state', () => {
    const result = resolveEntitlementState({
      latestPaymentAt: null,
      freePremiumRemaining: -5,
    });

    expect(result.isPremium).toBe(false);
    expect(result.freePremiumRemaining).toBe(0);
  });
});
