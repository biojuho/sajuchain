import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SajuData } from '@/types';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { migrateSajuDataToCurrentSchema, needsSajuDataMigration, normalizeSajuData } from '@/lib/saju-schema';

type SajuHistoryRow = {
    id: string;
    saju_data: SajuData;
};

async function migrateLegacyHistoryRows(rows: SajuHistoryRow[]): Promise<void> {
    if (rows.length === 0) return;

    const supabase = createClient();
    if (!supabase) return;

    const results = await Promise.allSettled(
        rows.map((row) => (
            supabase
                .from('saju_history')
                .update({ saju_data: migrateSajuDataToCurrentSchema(row.saju_data) })
                .eq('id', row.id)
        )),
    );

    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.warn('Failed to migrate history row:', rows[index]?.id, result.reason);
            return;
        }

        if (result.value.error) {
            console.warn('Failed to migrate history row:', rows[index]?.id, result.value.error.message);
        }
    });
}

interface SajuState {
    sajuData: SajuData | null;
    setSajuData: (data: SajuData) => void;
    user: User | null;
    setUser: (user: User | null) => void;
    history: SajuData[];
    addToHistory: (data: SajuData) => Promise<void>;
    reset: () => void;
    syncWithSupabase: () => Promise<void>;
    isPremium: boolean;
    setPremium: (status: boolean) => void;
    freePremiumRemaining: number;
    latestPaymentAt: string | null;
    refreshEntitlement: () => Promise<void>;
    paymentMethod: 'KRW' | 'CRYPTO' | null;
    setPaymentMethod: (method: 'KRW' | 'CRYPTO' | null) => void;
}

export const useSajuStore = create<SajuState>()(
    persist(
        (set, get) => ({
            sajuData: null,
            setSajuData: (data) => set({ sajuData: data }),
            user: null,
            setUser: (user) => set({ user }),
            history: [],
            addToHistory: async (data: SajuData) => {
                // ... (omitted for brevity, keep existing)
                // 1. Optimistic Update (Local)
                set((state) => {
                    const newHistory = [data, ...state.history].slice(0, 50);
                    return { history: newHistory };
                });

                // 2. Server Sync
                const { user } = get();
                if (user) {
                    const supabase = createClient();
                    if (!supabase) return;

                    const { error } = await supabase.from('saju_history').insert({
                        user_id: user.id,
                        birth_date: data.birthDate,
                        birth_time: data.birthTime,
                        gender: data.gender,
                        calendar_type: data.calendarType,
                        birth_place: data.birthPlace,
                        saju_data: data
                    });
                    if (error) {
                        console.error('Supabase Sync Error:', error);
                        set((state) => ({
                            history: state.history.filter((h) => h !== data),
                        }));
                    }
                }
            },
            reset: () => set({
                sajuData: null,
                user: null,
                isPremium: false,
                freePremiumRemaining: 0,
                latestPaymentAt: null,
            }),
            refreshEntitlement: async () => {
                const { user } = get();
                if (!user) {
                    set({ isPremium: false, freePremiumRemaining: 0, latestPaymentAt: null });
                    return;
                }

                try {
                    const res = await fetch('/api/me/entitlement', { cache: 'no-store' });
                    if (!res.ok) {
                        return;
                    }

                    const entitlement = await res.json();
                    set({
                        isPremium: Boolean(entitlement.isPremium),
                        freePremiumRemaining: Number(entitlement.freePremiumRemaining || 0),
                        latestPaymentAt: entitlement.latestPaymentAt || null,
                    });
                } catch (error) {
                    console.error('Failed to refresh entitlement:', error);
                }
            },
            syncWithSupabase: async () => {
                try {
                    const supabase = createClient();
                    if (!supabase) return;

                    const { data: { user }, error: authError } = await supabase.auth.getUser();
                    if (authError) {
                        console.warn('Supabase auth error during sync:', authError.message);
                        return;
                    }

                    if (user) {
                        set({ user });
                        const { data, error } = await supabase
                            .from('saju_history')
                            .select('*')
                            .order('created_at', { ascending: false })
                            .limit(50);

                        if (data && !error) {
                            const historyRows = data
                                .filter((row): row is typeof row & SajuHistoryRow => Boolean(row?.id && row?.saju_data))
                                .map((row) => ({
                                    id: String(row.id),
                                    saju_data: row.saju_data as SajuData,
                                }));

                            const dbHistory = historyRows.map((row) => normalizeSajuData(row.saju_data));
                            set({ history: dbHistory });

                            const legacyRows = historyRows.filter((row) => needsSajuDataMigration(row.saju_data));
                            if (legacyRows.length > 0) {
                                void migrateLegacyHistoryRows(legacyRows);
                            }
                        }

                        await get().refreshEntitlement();
                    } else {
                        set({ isPremium: false, freePremiumRemaining: 0, latestPaymentAt: null });
                    }
                } catch (e) {
                    console.error('Supabase sync error:', e);
                }
            },
            isPremium: false,
            setPremium: (status) => set({ isPremium: status }),
            freePremiumRemaining: 0,
            latestPaymentAt: null,
            paymentMethod: null,
            setPaymentMethod: (method) => set({ paymentMethod: method }),
        }),
        {
            name: 'saju-storage',
        }
    )
);
