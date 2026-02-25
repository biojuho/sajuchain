
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface GenderCardRowProps {
    value: 'M' | 'F' | null;
    onChange: (value: 'M' | 'F') => void;
}

export const GenderCardRow = ({ value, onChange }: GenderCardRowProps) => {
    return (
        <div className="flex gap-2.5 w-full">
            {/* Male Card */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onChange('M')}
                className={`flex-1 h-[52px] rounded-[14px] flex items-center justify-center gap-2 relative transition-all duration-200 ${value === 'M'
                    ? 'bg-purple-500/10 border-[1.5px] border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                    : 'bg-zinc-800 border border-white/5 hover:bg-zinc-700'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">👨</span>
                    <span className={`text-[14px] font-bold ${value === 'M' ? 'text-zinc-100' : 'text-zinc-400'}`}>남성</span>
                </div>

                {value === 'M' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1.5 left-1.5 bg-purple-500 rounded-full p-[1px]"
                    >
                        <Check className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                )}
            </motion.button>

            {/* Female Card */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onChange('F')}
                className={`flex-1 h-[52px] rounded-[14px] flex items-center justify-center gap-2 relative transition-all duration-200 ${value === 'F'
                    ? 'bg-purple-500/10 border-[1.5px] border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                    : 'bg-zinc-800 border border-white/5 hover:bg-zinc-700'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">👩</span>
                    <span className={`text-[14px] font-bold ${value === 'F' ? 'text-zinc-100' : 'text-zinc-400'}`}>여성</span>
                </div>

                {value === 'F' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1.5 left-1.5 bg-purple-500 rounded-full p-[1px]"
                    >
                        <Check className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                )}
            </motion.button>
        </div>
    );
};
