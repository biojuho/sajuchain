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
                // 1. Optimistic Update (Local)
                set((state) => {
                    const newHistory = [data, ...state.history].slice(0, 50);
                    return { history: newHistory };
                });

                // 2. Server Sync
                const { user } = get();
                if (user) {
                    const supabase = createClient();
                    const { error } = await supabase.from('saju_history').insert({
                        user_id: user.id,
                        birth_date: data.birthDate,
                        birth_time: data.birthTime,
                        gender: data.gender,
                        calendar_type: data.calendarType,
                        birth_place: data.birthPlace,
                        saju_data: data
                    });
                    if (error) console.error('Supabase Sync Error:', error);
                }
            },
            reset: () => set({ sajuData: null, user: null }),
            syncWithSupabase: async () => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    set({ user });
                    // Fetch history from DB
                    const { data, error } = await supabase
                        .from('saju_history')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(50);

                    if (data && !error) {
                        const dbHistory = data.map(row => row.saju_data as SajuData);
                        // Merge strategies can be complex, for now, DB wins or we merge?
                        // Let's replace local history with DB history to ensure consistency across devices.
                        set({ history: dbHistory });
                    }
                }
            },
            isPremium: false,
            setPremium: (status) => set({ isPremium: status }),
        }),
        {
            name: 'saju-storage',
        }
    )
);
