'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Helper for Element Colors
const ELEMENT_STYLES: Record<string, { color: string; bg: string; emoji: string }> = {
    '목': { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', emoji: '🌳' },
    '화': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', emoji: '🔥' },
    '토': { color: '#eab308', bg: 'rgba(234,179,8,0.1)', emoji: '⛰️' },
    '금': { color: '#e2e8f0', bg: 'rgba(226,232,240,0.1)', emoji: '⚔️' },
    '수': { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', emoji: '💧' },
    'Tree': { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', emoji: '🌳' },
    'Fire': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', emoji: '🔥' },
    'Earth': { color: '#eab308', bg: 'rgba(234,179,8,0.1)', emoji: '⛰️' },
    'Metal': { color: '#e2e8f0', bg: 'rgba(226,232,240,0.1)', emoji: '⚔️' },
    'Water': { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', emoji: '💧' },
};

export interface PillarData {
    stem: string; // 甲
    stemElement: string; // 목
    branch: string; // 子
    branchElement: string; // 수
}

interface FourPillarsGridProps {
    pillars: {
        year: PillarData;
        month: PillarData;
        day: PillarData;
        hour: PillarData;
    };
}

export const FourPillarsGrid = ({ pillars }: FourPillarsGridProps) => {
    // Order: Hour | Day | Month | Year
    const orderedPillars = [
        { label: '시주', data: pillars.hour, isDay: false },
        { label: '일주', data: pillars.day, isDay: true },
        { label: '월주', data: pillars.month, isDay: false },
        { label: '년주', data: pillars.year, isDay: false },
    ];

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-5 mb-4 bg-[#18181b] border border-white/5 rounded-[18px] p-4 overflow-hidden shadow-sm"
        >
            <div className="flex justify-between items-center mb-3.5 pb-2.5 border-b border-white/5">
                <span className="text-[15px] font-bold text-zinc-50">사주 원국</span>
                <span className="text-[11px] text-zinc-500">四柱八字</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
                {orderedPillars.map((p, idx) => {
                    const stemStyle = ELEMENT_STYLES[p.data.stemElement] || { color: '#a1a1aa', bg: '#27272a', emoji: '' };
                    const branchStyle = ELEMENT_STYLES[p.data.branchElement] || { color: '#a1a1aa', bg: '#27272a', emoji: '' };

                    return (
                        <motion.div
                            key={p.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 + (idx * 0.15) }}
                            className={`flex flex-col items-center py-2.5 px-1 rounded-[14px] gap-1 relative ${p.isDay
                                    ? 'bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.25)]'
                                    : 'bg-[#27272a] border border-[rgba(255,255,255,0.06)]'
                                }`}
                        >
                            {p.isDay && (
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#7c3aed] text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 whitespace-nowrap shadow-sm">
                                    ★ 나
                                </div>
                            )}
                            <span className={`text-[10px] ${p.isDay ? 'mt-1' : ''} text-zinc-500`}>{p.label}</span>

                            {/* Stem (40px) */}
                            <div
                                className="w-10 h-10 rounded-[10px] flex flex-col items-center justify-center border relative"
                                style={{
                                    backgroundColor: `${stemStyle.color}15`,
                                    borderColor: `${stemStyle.color}40`
                                }}
                            >
                                <span className="text-[18px] font-bold leading-none" style={{ color: stemStyle.color }}>
                                    {p.data.stem}
                                </span>
                                <span className="text-[8px] opacity-70 leading-none mt-0.5 transform scale-90" style={{ color: stemStyle.color }}>
                                    {p.data.stemElement}
                                </span>
                            </div>

                            {/* Emoji */}
                            <span className="text-[12px] leading-none my-0.5 opacity-80">{stemStyle.emoji}</span>

                            {/* Branch (40px) */}
                            <div
                                className="w-10 h-10 rounded-[10px] flex flex-col items-center justify-center border relative"
                                style={{
                                    backgroundColor: `${branchStyle.color}15`,
                                    borderColor: `${branchStyle.color}40`
                                }}
                            >
                                <span className="text-[18px] font-bold leading-none" style={{ color: branchStyle.color }}>
                                    {p.data.branch}
                                </span>
                                <span className="text-[8px] opacity-70 leading-none mt-0.5 transform scale-90" style={{ color: branchStyle.color }}>
                                    {p.data.branchElement}
                                </span>
                            </div>

                            {/* Branch Name */}
                            <span className="text-[9px] text-zinc-500">{p.data.branch}</span>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};
