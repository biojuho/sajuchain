
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Briefcase, Heart, Activity } from 'lucide-react';

interface FortuneData {
    score: number;
    title: string;
    detail: string;
    dos?: string[];
    donts?: string[];
    organs?: string[];
    activities?: string[];
}

interface FortuneDetailTabsProps {
    data: {
        overall: FortuneData;
        career: FortuneData;
        love: FortuneData;
        health: FortuneData;
    };
}

const TABS = [
    { key: 'overall', label: '총합운' },
    { key: 'career', label: '직업/재물' },
    { key: 'love', label: '연애/대인' },
    { key: 'health', label: '건강' },
] as const;

export const FortuneDetailTabs = ({ data }: FortuneDetailTabsProps) => {
    const [activeTab, setActiveTab] = useState<keyof typeof data>('overall');
    const [displayScore, setDisplayScore] = useState(0);

    const activeData = data[activeTab];

    // Count up animation when tab changes
    useEffect(() => {
        let start = 0;
        const end = activeData.score;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            setDisplayScore(Math.floor(start + (end - start) * ease));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [activeTab, activeData.score]);

    const renderStars = (score: number) => {
        const stars = Math.round((score / 20)); // 0-5
        return (
            <div className="flex gap-1 justify-center my-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star
                        key={i}
                        className={`w-5 h-5 ${i <= stars ? 'fill-amber-400 text-amber-400' : 'fill-none text-zinc-700'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <section className="mx-5 mb-8">
            {/* Tabs */}
            <div className="flex p-1 bg-zinc-900 border border-white/5 rounded-2xl mb-3">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex-1 py-2.5 text-[13px] font-medium rounded-xl transition-all relative ${activeTab === tab.key ? 'text-zinc-50 font-bold' : 'text-zinc-500'
                            }`}
                    >
                        {activeTab === tab.key && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-zinc-800 rounded-xl shadow-sm border border-white/5 -z-10"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-white/5 rounded-[20px] p-6 min-h-[220px]"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center text-center"
                    >
                        {/* Score */}
                        <div className="mb-2">
                            <span className="text-[48px] font-bold text-purple-400">{displayScore}</span>
                            <span className="text-xl text-zinc-600 font-medium">/100</span>
                        </div>
                        <span className="text-sm text-zinc-500 mb-2">운세 점수</span>

                        {/* Stars (only for Overall generally, or all? User mock said stars for overall) */}
                        {renderStars(activeData.score)}

                        <h3 className="text-[15px] font-bold text-zinc-50 mt-4 mb-3 leading-relaxed">
                            {activeData.title}
                        </h3>
                        <p className="text-[14px] text-zinc-400 leading-relaxed whitespace-pre-wrap">
                            {activeData.detail}
                        </p>

                        {/* Extra Lists (Career DOs/DONTS or Health Tips) */}
                        {activeTab === 'career' && activeData.dos && (
                            <div className="w-full mt-6 text-left bg-zinc-800/50 rounded-xl p-4">
                                <p className="text-xs font-bold text-green-400 mb-2">✨ 추천 (DO)</p>
                                <ul className="space-y-1 mb-4">
                                    {activeData.dos.map((d, i) => (
                                        <li key={i} className="text-xs text-zinc-300 flex gap-2">
                                            <span>✅</span> {d}
                                        </li>
                                    ))}
                                </ul>
                                {activeData.donts && (
                                    <>
                                        <p className="text-xs font-bold text-red-400 mb-2">⚠️ 주의 (DON'T)</p>
                                        <ul className="space-y-1">
                                            {activeData.donts.map((d, i) => (
                                                <li key={i} className="text-xs text-zinc-300 flex gap-2">
                                                    <span>🚫</span> {d}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'health' && activeData.organs && (
                            <div className="w-full mt-6 flex justify-center gap-2">
                                {activeData.organs.map((o, i) => (
                                    <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-xs">
                                        🩺 {o}
                                    </span>
                                ))}
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </section>
    );
};
