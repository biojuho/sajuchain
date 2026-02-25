
'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegionInputProps {
    value: string;
    onChange: (value: string) => void;
}

const CITIES = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "제주", "해외"];

export const RegionInput = ({ value, onChange }: RegionInputProps) => {
    return (
        <div className="w-full space-y-3">
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="서울, 부산, 대구..."
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all"
                />
            </div>

            <div className="overflow-x-auto pb-2 scrollbar-hide flex gap-2">
                {CITIES.map((city) => (
                    <motion.button
                        key={city}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onChange(city)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${value === city
                                ? 'bg-purple-600 border-purple-500 text-white'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        {city}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
