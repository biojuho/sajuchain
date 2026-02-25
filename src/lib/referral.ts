import { createClient } from '@/lib/supabase/client';

export interface ReferralData {
    referralCode: string;
    inviteCount: number;
    freePremiumRemaining: number;
}

export async function getReferralData(userId: string): Promise<ReferralData | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('referral_code, free_premium_remaining')
        .eq('id', userId)
        .single();

    if (error || !profile) return null;

    const { count } = await supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('referrer_id', userId);

    return {
        referralCode: profile.referral_code,
        inviteCount: count || 0,
        freePremiumRemaining: profile.free_premium_remaining,
    };
}

export async function claimFreePremium(userId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { data, error } = await supabase
        .from('user_profiles')
        .select('free_premium_remaining')
        .eq('id', userId)
        .single();

    if (error || !data || data.free_premium_remaining <= 0) return false;

    const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ free_premium_remaining: data.free_premium_remaining - 1 })
        .eq('id', userId);

    return !updateError;
}
