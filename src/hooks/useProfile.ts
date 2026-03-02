'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSajuStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export function useProfile() {
    const router = useRouter();
    const { user, history, isPremium, freePremiumRemaining, syncWithSupabase } = useSajuStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        syncWithSupabase().finally(() => setLoading(false));
    }, [syncWithSupabase]);

    const handleLogout = useCallback(async () => {
        const supabase = createClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        useSajuStore.getState().reset();
        router.push('/');
    }, [router]);

    const handleLogin = useCallback(() => {
        router.push('/auth?next=/profile');
    }, [router]);

    const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

    const displayName = useMemo(() =>
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split('@')[0] ||
        '게스트',
    [user]);

    const email = user?.email || '';

    const totalAnalyses = history.length;

    const lastAnalysis = useMemo(() =>
        history[0]?.generatedAt
            ? new Date(history[0].generatedAt).toLocaleDateString('ko-KR')
            : '-',
    [history]);

    const dayMasterDisplay = useMemo(() => {
        const dm = history[0]?.dayMaster;
        if (typeof dm === 'string') return dm;
        if (typeof dm === 'object' && dm) {
            return `${(dm as { hanja?: string }).hanja || ''} ${(dm as { name?: string }).name || ''}`;
        }
        return null;
    }, [history]);

    return {
        user,
        loading,
        avatarUrl,
        displayName,
        email,
        isPremium,
        freePremiumRemaining,
        totalAnalyses,
        lastAnalysis,
        dayMasterDisplay,
        handleLogout,
        handleLogin,
    };
}
