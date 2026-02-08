
'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegionInputNativeProps {
    value: string;
    onChange: (value: string) => void;
}

const CITIES = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "제주", "해외"];

export const RegionInputNative = ({ value, onChange }: RegionInputNativeProps) => {
    return (
        <div className="w-full space-y-2.5">
            <div className="relative group">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="서울, 부산, 대구..."
                    className="w-full h-12 bg-zinc-800 border border-white/5 rounded-[16px] pl-4 pr-4 text-[14px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/40 focus:bg-zinc-800 transition-all shadow-sm"
                />
            </div>

            <div className="overflow-x-auto pb-2 scrollbar-none flex gap-1.5 -mx-1 px-1">
                {CITIES.map((city) => (
                    <motion.button
                        key={city}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onChange(city)}
                        className={`flex-shrink-0 px-3 h-8 rounded-full text-[12px] font-medium border transition-colors ${value === city
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                            : 'bg-zinc-800 border-white/5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                            }`}
                    >
                        {city}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
