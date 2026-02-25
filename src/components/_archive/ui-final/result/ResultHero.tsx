'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ResultHeroProps {
    dayMaster: {
        gan: string; // Hanja
        element: string; // Korean Element Name (e.g. 수)
        koreanName: string; // Full Name (e.g. 임수)
        color: string;
        bg: string;
    };
    userName: string;
    description: string; // "1990년..."
    keywords: string[];
}

export const ResultHero = ({ dayMaster, userName, description, keywords }: ResultHeroProps) => {
    return (
        <section className="relative w-full pt-6 pb-2 flex flex-col items-center overflow-hidden z-10">
            {/* Title Section (Snippet Style) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-6"
            >
                <h1 className="text-[22px] font-extrabold mb-1.5">
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#a78bfa] to-[#60a5fa]">
                        사주 분석 결과
                    </span>
                </h1>
                <p className="text-[13px] text-zinc-500 font-medium">
                    {description}
                </p>
            </motion.div>

            {/* Day Master Badge (72px) */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                className="flex flex-col items-center mb-4"
            >
                <div
                    className="w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center border-[2px] mb-2 relative shadow-[0_0_24px_rgba(168,85,247,0.15)]"
                    style={{
                        borderColor: dayMaster.color,
                        backgroundColor: `${dayMaster.color}18`, // 18% opacity hex
                        boxShadow: `0 0 24px ${dayMaster.color}30`
                    }}
                >
                    <span className="text-[26px] font-extrabold leading-none" style={{ color: dayMaster.color }}>{dayMaster.gan}</span>
                    <span className="text-[10px] opacity-70 mt-0.5" style={{ color: dayMaster.color }}>{dayMaster.element}</span>
                </div>
                <span className="text-[13px] text-zinc-400 font-medium">{dayMaster.koreanName}</span>
            </motion.div>

            {/* Keywords */}
            <div className="flex flex-wrap justify-center gap-1.5 max-w-[320px]">
                {keywords.map((kw, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + (i * 0.1) }}
                        className="px-3 py-1.5 rounded-[14px] bg-[#a855f714] border border-[#a855f733] text-[12px] text-[#c084fc]"
                    >
                        #{kw}
                    </motion.span>
                ))}
            </div>
        </section>
    );
};
