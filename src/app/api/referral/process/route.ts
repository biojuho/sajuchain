import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SAJU-${code}`;
}

export async function POST(request: NextRequest) {
    try {
        const { userId, refCode } = await request.json();

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });
        }

        // Verify the requesting user matches the userId (CSRF protection)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user profile already exists
        const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', userId)
            .single();

        if (existing) {
            return NextResponse.json({ message: 'Profile already exists' });
        }

        // Create new profile with unique referral code
        let code = generateReferralCode();
        let attempts = 0;
        while (attempts < 5) {
            const { error } = await supabase
                .from('user_profiles')
                .insert({ id: userId, referral_code: code });

            if (!error) break;

            // If code conflict, regenerate
            code = generateReferralCode();
            attempts++;
        }

        // Process referral if ref_code provided
        if (refCode) {
            const { data: referrer } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('referral_code', refCode)
                .single();

            if (referrer && referrer.id !== userId) {
                // Check for duplicate referral
                const { data: existingRef } = await supabase
                    .from('referrals')
                    .select('id')
                    .eq('referred_id', userId)
                    .single();

                if (!existingRef) {
                    // Record referral
                    await supabase.from('referrals').insert({
                        referrer_id: referrer.id,
                        referred_id: userId,
                        referral_code: refCode,
                        status: 'completed',
                    });

                    // Grant reward: +1 free premium
                    await supabase.rpc('increment_free_premium', {
                        target_user_id: referrer.id,
                    });
                }
            }
        }

        return NextResponse.json({ message: 'OK', referralCode: code });
    } catch (err) {
        console.error('Referral process error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
