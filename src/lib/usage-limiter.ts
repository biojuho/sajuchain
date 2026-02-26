import { createClient } from '@/lib/supabase/client';

export const FREE_INTERPRET_LIMIT = 3;
export const FREE_CHAT_LIMIT = 10;

type UsageType = 'interpret' | 'chat';

function getLimit(type: UsageType): number {
    return type === 'interpret' ? FREE_INTERPRET_LIMIT : FREE_CHAT_LIMIT;
}

// --- Guest (localStorage) ---

function getGuestStorageKey(): string {
    const today = new Date().toISOString().slice(0, 10);
    return `saju-usage-${today}`;
}

function getGuestUsage(): { interpret: number; chat: number } {
    if (typeof window === 'undefined') return { interpret: 0, chat: 0 };
    try {
        const raw = localStorage.getItem(getGuestStorageKey());
        if (!raw) return { interpret: 0, chat: 0 };
        return JSON.parse(raw);
    } catch {
        return { interpret: 0, chat: 0 };
    }
}

function setGuestUsage(usage: { interpret: number; chat: number }) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getGuestStorageKey(), JSON.stringify(usage));
}

// --- Public API ---

export async function checkAndIncrementUsage(
    type: UsageType,
    userId?: string | null
): Promise<{ allowed: boolean; remaining: number }> {
    const limit = getLimit(type);

    if (!userId) {
        // Guest: use localStorage
        const usage = getGuestUsage();
        const current = usage[type];
        if (current >= limit) {
            return { allowed: false, remaining: 0 };
        }
        usage[type] = current + 1;
        setGuestUsage(usage);
        return { allowed: true, remaining: limit - current - 1 };
    }

    // Authenticated: use Supabase RPC
    const supabase = createClient();
    if (!supabase) {
        // Fallback: allow if Supabase not configured
        return { allowed: true, remaining: limit };
    }

    const { data, error } = await supabase.rpc('check_and_increment_usage', {
        p_user_id: userId,
        p_usage_type: type,
        p_limit: limit,
    });

    if (error) {
        console.error('Usage check failed:', error);
        return { allowed: true, remaining: limit }; // Fail open
    }

    return {
        allowed: data.allowed,
        remaining: data.remaining,
    };
}

export async function getUsageRemaining(
    type: UsageType,
    userId?: string | null
): Promise<number> {
    const limit = getLimit(type);

    if (!userId) {
        const usage = getGuestUsage();
        return Math.max(0, limit - usage[type]);
    }

    const supabase = createClient();
    if (!supabase) return limit;

    const { data, error } = await supabase.rpc('get_usage_count', {
        p_user_id: userId,
        p_usage_type: type,
    });

    if (error) {
        console.error('Usage count fetch failed:', error);
        return limit;
    }

    return Math.max(0, limit - (data || 0));
}

export async function checkIsPremium(userId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    // Check if user has a successful payment
    const { data: payment } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'DONE')
        .limit(1)
        .single();

    if (payment) return true;

    // Check if user has free premium remaining
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('free_premium_remaining')
        .eq('id', userId)
        .single();

    if (profile && profile.free_premium_remaining > 0) return true;

    return false;
}
