
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const TIME_OPTIONS = [
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

interface TimeGridV2Props {
    value: string | null;
    onChange: (value: string) => void;
}

export const TimeGridV2 = ({ value, onChange }: TimeGridV2Props) => {
    return (
        <div className="grid grid-cols-3 gap-2 w-full">
            {TIME_OPTIONS.map((option) => {
                const isSelected = value === option.id;
                return (
                    <motion.button
                        key={option.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onChange(option.id)}
                        className={`relative flex flex-col items-center justify-center h-16 rounded-xl border transition-all duration-200 ${isSelected
                                ? 'bg-purple-600/25 border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <div className="text-sm font-bold text-white">{option.label}</div>
                        <div className="text-[10px] text-white/45 mt-1">{option.time}</div>

                        {isSelected && (
                            <div className="absolute top-1 left-1 bg-purple-500 rounded-full p-0.5">
                                <Check className="w-2 h-2 text-white" />
                            </div>
                        )}
                    </motion.button>
                );
            })}

            {/* Unknown Option - Full Width */}
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange('unknown')}
                className={`col-span-3 h-12 rounded-xl border border-dashed flex items-center justify-center gap-2 transition-all ${value === 'unknown'
                        ? 'bg-purple-600/25 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] border-solid'
                        : 'border-white/20 text-white/50 hover:bg-white/5 hover:border-white/30'
                    }`}
            >
                <span className="text-sm">🤷 모름 · 시간 미상</span>
            </motion.button>
        </div>
    );
};
