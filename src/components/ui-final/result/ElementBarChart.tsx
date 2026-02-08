'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ElementBarChartProps {
    scores: {
        wood: number;
        fire: number;
        earth: number;
        metal: number;
        water: number;
    };
}

const ELEMENTS = [
    { key: 'wood', label: '목', emoji: '🌳', color: '#22c55e', bg: 'rgba(34,197,94,0.2)' },
    { key: 'fire', label: '화', emoji: '🔥', color: '#ef4444', bg: 'rgba(239,68,68,0.2)' },
    { key: 'earth', label: '토', emoji: '⛰️', color: '#eab308', bg: 'rgba(234,179,8,0.2)' },
    { key: 'metal', label: '금', emoji: '⚔️', color: '#e2e8f0', bg: 'rgba(226,232,240,0.2)' },
    { key: 'water', label: '수', emoji: '💧', color: '#3b82f6', bg: 'rgba(59,130,246,0.2)' },
] as const;

export const ElementBarChart = ({ scores }: ElementBarChartProps) => {
    return (
        <section className="mx-5 mb-6 px-4 py-4 bg-[#18181b] border border-white/5 rounded-[18px]">
            <h3 className="text-[14px] font-bold text-zinc-50 mb-3">오행 분포</h3>
            <div className="space-y-1.5">
                {ELEMENTS.map((el, i) => {
                    const score = scores[el.key as keyof typeof scores] || 0;
                    // Max score assumed around 6-8 usually
                    const maxVal = Math.max(...Object.values(scores), 1);
                    const percent = maxVal > 0 ? (score / maxVal) * 100 : 0;

                    return (
                        <div key={el.key} className="flex items-center gap-2">
                            <span className="w-11 text-[12px] text-zinc-400 flex items-center gap-1.5 whitespace-nowrap">
                                <span className="text-sm">{el.emoji}</span> {el.label}
                            </span>

                            <div className="flex-1 h-4 bg-[#27272a] rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${percent}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.0, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                                    className="h-full rounded-full absolute left-0 top-0 opacity-60"
                                    style={{ backgroundColor: el.color }}
                                />
                            </div>

                            <span className="text-[12px] text-zinc-500 font-medium w-4 text-right">{score}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
