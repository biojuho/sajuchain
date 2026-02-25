
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const TIME_OPTIONS = [
    { id: '子', label: '자시', time: '23:30-01:30', modern: 0 },
    { id: '축', label: '축시', time: '01:30-03:30', modern: 2 },
    { id: '인', label: '인시', time: '03:30-05:30', modern: 4 },
    { id: '묘', label: '묘시', time: '05:30-07:30', modern: 6 },
    { id: '진', label: '진시', time: '07:30-09:30', modern: 8 },
    { id: '사', label: '사시', time: '09:30-11:30', modern: 10 },
    { id: '오', label: '오시', time: '11:30-13:30', modern: 12 },
    { id: '미', label: '미시', time: '13:30-15:30', modern: 14 },
    { id: '신', label: '신시', time: '15:30-17:30', modern: 16 },
    { id: '유', label: '유시', time: '17:30-19:30', modern: 18 },
    { id: '술', label: '술시', time: '19:30-21:30', modern: 20 },
    { id: '해', label: '해시', time: '21:30-23:30', modern: 22 },
    { id: 'unknown', label: '모름', time: '시간 미상', modern: -1 },
];

interface TimeGridProps {
    value: string | null;
    onChange: (value: string) => void;
}

export const TimeGrid = ({ value, onChange }: TimeGridProps) => {
    return (
        <div className="grid grid-cols-4 gap-2">
            {TIME_OPTIONS.map((option) => {
                const isSelected = value === option.id;
                return (
                    <motion.button
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        whileTap={{ scale: 0.95 }}
                        className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${isSelected
                                ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className="text-lg font-bold">{option.label}</div>
                        <div className="text-[10px] opacity-60">{option.time.split('-')[0]}</div>
                        {isSelected && (
                            <div className="absolute top-1 right-1">
                                <Check className="w-3 h-3 text-purple-400" />
                            </div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
};
