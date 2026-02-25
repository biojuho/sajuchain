import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SajuData } from '@/types';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

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
            reset: () => set({ sajuData: null, user: null }),
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
                            const dbHistory = data.map(row => row.saju_data as SajuData);
                            set({ history: dbHistory });
                        }
                    }
                } catch (e) {
                    console.error('Supabase sync error:', e);
                }
            },
            isPremium: false,
            setPremium: (status) => set({ isPremium: status }),
            paymentMethod: null,
            setPaymentMethod: (method) => set({ paymentMethod: method }),
        }),
        {
            name: 'saju-storage',
        }
    )
);
