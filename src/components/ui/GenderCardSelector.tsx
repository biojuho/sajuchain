
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface GenderCardSelectorProps {
    value: 'M' | 'F' | null; // Allow null for initial state
    onChange: (value: 'M' | 'F') => void;
}

export const GenderCardSelector = ({ value, onChange }: GenderCardSelectorProps) => {
    return (
        <div className="flex gap-3 w-full">
            {/* Male Card */}
            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onChange('M')}
                className={`flex-1 h-[72px] rounded-2xl flex items-center justify-center gap-2 relative transition-all duration-200 ${value === 'M'
                        ? 'bg-purple-600/20 border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
            >
                <span className="text-3xl">👨</span>
                <span className={`text-lg font-bold ${value === 'M' ? 'text-white' : 'text-white/60'}`}>남성</span>

                {value === 'M' && (
                    <div className="absolute top-2 left-2 bg-purple-500 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                )}
            </motion.button>

            {/* Female Card */}
            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onChange('F')}
                className={`flex-1 h-[72px] rounded-2xl flex items-center justify-center gap-2 relative transition-all duration-200 ${value === 'F'
                        ? 'bg-purple-600/20 border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
            >
                <span className="text-3xl">👩</span>
                <span className={`text-lg font-bold ${value === 'F' ? 'text-white' : 'text-white/60'}`}>여성</span>

                {value === 'F' && (
                    <div className="absolute top-2 left-2 bg-purple-500 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                )}
            </motion.button>
        </div>
    );
};
