import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SajuData } from '@/types';

interface SajuState {
    sajuData: SajuData | null;
    setSajuData: (data: SajuData) => void;
    reset: () => void;
}

export const useSajuStore = create<SajuState>()(
    persist(
        (set) => ({
            sajuData: null,
            setSajuData: (data) => set({ sajuData: data }),
            reset: () => set({ sajuData: null }),
        }),
        {
            name: 'saju-storage', // unique name for localStorage
        }
    )
);
