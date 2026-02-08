
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SegmentOption {
    value: string;
    label: string;
}

interface SegmentControlProps {
    options: SegmentOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    name?: string;
}

export const SegmentControl = ({ options, value, onChange, className }: SegmentControlProps) => {
    return (
        <div className={`relative flex p-1 bg-black/20 rounded-xl overflow-hidden backdrop-blur-sm border border-white/5 ${className}`}>
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`relative flex-1 py-2 text-sm font-medium transition-colors z-10 ${isSelected ? 'text-white' : 'text-white/40 hover:text-white/70'
                            }`}
                    >
                        {option.label}
                        {isSelected && (
                            <motion.div
                                layoutId={`segment-bg-${options[0].value}`} // unique ID for layout animation group
                                className="absolute inset-0 bg-purple-600 rounded-lg -z-10 shadow-lg shadow-purple-900/50"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};
