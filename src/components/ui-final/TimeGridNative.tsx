
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const TIME_OPTIONS = [
    { id: '子', label: '자시 子', time: '23:30 ~ 01:30' },
    { id: '축', label: '축시 丑', time: '01:30 ~ 03:30' },
    { id: '인', label: '인시 寅', time: '03:30 ~ 05:30' },
    { id: '묘', label: '묘시 卯', time: '05:30 ~ 07:30' },
    { id: '진', label: '진시 辰', time: '07:30 ~ 09:30' },
    { id: '사', label: '사시 巳', time: '09:30 ~ 11:30' },
    { id: '오', label: '오시 午', time: '11:30 ~ 13:30' },
    { id: '미', label: '미시 未', time: '13:30 ~ 15:30' },
    { id: '신', label: '신시 申', time: '15:30 ~ 17:30' },
    { id: '유', label: '유시 酉', time: '17:30 ~ 19:30' },
    { id: '술', label: '술시 戌', time: '19:30 ~ 21:30' },
    { id: '해', label: '해시 亥', time: '21:30 ~ 23:30' },
];

interface TimeGridNativeProps {
    value: string | null;
    onChange: (value: string) => void;
}

export const TimeGridNative = ({ value, onChange }: TimeGridNativeProps) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-3 gap-1.5 w-full mb-1.5">
                {TIME_OPTIONS.map((option) => {
                    const isSelected = value === option.id;
                    return (
                        <motion.button
                            key={option.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onChange(option.id)}
                            className={`relative flex flex-col items-center justify-center h-[50px] rounded-[14px] border transition-all duration-200 ${isSelected
                                ? 'bg-purple-500/10 border-[1.5px] border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                                : 'bg-zinc-800 border-white/5 hover:bg-zinc-700'
                                }`}
                        >
                            <div className={`text-[13px] font-bold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>{option.label}</div>
                            <div className={`text-[10px] mt-[1px] ${isSelected ? 'text-purple-300' : 'text-zinc-500'}`}>{option.time}</div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Unknown Option */}
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange('unknown')}
                className={`w-full h-10 rounded-[14px] border border-dashed flex items-center justify-center transition-all ${value === 'unknown'
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.1)] border-solid'
                    : 'border-white/10 text-zinc-500 hover:bg-white/5 hover:border-white/20'
                    }`}
            >
                <span className="text-[12px]">🤷 모름 · 시간 미상</span>
            </motion.button>
        </div>
    );
};
