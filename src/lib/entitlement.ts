import { createClient } from '@supabase/supabase-js';

export interface EntitlementResult {
    isPremium: boolean;
    freePremiumRemaining: number;
    latestPaymentAt: string | null;
}

export function resolveEntitlementState({
    latestPaymentAt,
    freePremiumRemaining,
}: {
    latestPaymentAt?: string | null;
    freePremiumRemaining?: unknown;
}): EntitlementResult {
    const remaining = Math.max(0, Number(freePremiumRemaining || 0));
    const normalizedLatestPaymentAt = latestPaymentAt || null;

    return {
        isPremium: Boolean(normalizedLatestPaymentAt) || remaining > 0,
        freePremiumRemaining: remaining,
        latestPaymentAt: normalizedLatestPaymentAt,
    };
}

function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
        return null;
    }

    return createClient(url, serviceKey);
}

export async function getEntitlementForUser(userId: string): Promise<EntitlementResult> {
    const supabase = createAdminClient();
    if (!supabase || !userId) {
        return {
            isPremium: false,
            freePremiumRemaining: 0,
            latestPaymentAt: null,
        };
    }

    const [{ data: payment }, { data: profile }] = await Promise.all([
        supabase
            .from('payments')
            .select('created_at')
            .eq('user_id', userId)
            .eq('status', 'DONE')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        supabase
            .from('user_profiles')
            .select('free_premium_remaining')
            .eq('id', userId)
            .maybeSingle(),
    ]);

    return resolveEntitlementState({
        latestPaymentAt: payment?.created_at,
        freePremiumRemaining: profile?.free_premium_remaining,
    });
}
