'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ... interface unchanged
import { AIResult } from '@/types';

export default function FortuneCard({ data }: { data: AIResult }) {
    const [activeTab, setActiveTab] = useState<'total' | 'career' | 'love' | 'health'>('total');

    const tabs = [
        { id: 'total', label: '종합운' },
        { id: 'career', label: '직업/재물' },
        { id: 'love', label: '연애/대인' },
        { id: 'health', label: '건강' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }} // 3D Perspective
            className="w-full max-w-3xl bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_50px_-12px_rgba(255,215,0,0.1)] ring-1 ring-white/5 perspective-1000"
        >
            <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-200 mb-3 drop-shadow-sm"
                >
                    {data.headline}
                </motion.h2>
                <div className="flex flex-wrap gap-2 mt-4">
                    {data.threeLineSummary.map((item, idx) => (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + (idx * 0.1) }}
                            key={idx}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs md:text-sm text-white/90 font-medium"
                        >
                            #{item}
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 p-1 bg-black/20">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 text-sm font-medium transition-all rounded-lg ${activeTab === tab.id
                            ? 'bg-white/10 text-white shadow-lg shadow-purple-500/10'
                            : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 min-h-[300px] bg-gradient-to-b from-transparent to-black/20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-white/80 leading-relaxed whitespace-pre-line text-sm md:text-base"
                    >
                        {activeTab === 'total' && (
                            <div className="space-y-6">
                                <p className="text-white/90 leading-7">{data.personality}</p>

                                <div className="mt-6 p-5 bg-white/5 rounded-xl border border-white/5">
                                    <h4 className="text-yellow-400/90 text-sm font-bold mb-3 uppercase tracking-wider">🍀 Lucky Items</h4>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-2 rounded-lg bg-black/20">
                                            <span className="block text-white/40 text-[10px] uppercase mb-1">Color</span>
                                            <span className="font-medium text-white">{data.luckyItems.color}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-black/20">
                                            <span className="block text-white/40 text-[10px] uppercase mb-1">Number</span>
                                            <span className="font-medium text-white">{data.luckyItems.number}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-black/20">
                                            <span className="block text-white/40 text-[10px] uppercase mb-1">Direction</span>
                                            <span className="font-medium text-white">{data.luckyItems.direction}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 relative p-5 border border-purple-500/30 bg-purple-500/5 rounded-xl">
                                    <div className="absolute -top-3 left-4 bg-[#100c25] px-2 text-purple-400 text-xs font-bold">
                                        💡 Sage Advice
                                    </div>
                                    <p className="italic text-white/90 font-serif text-lg text-center">&quot;{data.advice}&quot;</p>
                                </div>
                            </div>
                        )}
                        {activeTab === 'career' && <p className="leading-7">{data.career}</p>}
                        {activeTab === 'love' && <p className="leading-7">{data.relationship}</p>}
                        {activeTab === 'health' && (
                            <div>
                                <p className="mb-6 leading-7">{data.health}</p>
                                <div className="p-5 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/10">
                                    <h4 className="text-purple-300 font-bold mb-3 flex items-center gap-2">
                                        <span className="text-lg">📅</span> 2026년 미리보기
                                    </h4>
                                    <p className="text-sm text-white/80 leading-6">{data.yearFortune2026}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/30 backdrop-blur-md">
                <span className="text-[10px] text-white/30 uppercase tracking-widest">SajuChain AI Engine v1.0</span>
                <button className="text-xs px-4 py-1.5 bg-yellow-500/10 text-yellow-400/90 border border-yellow-500/20 rounded-full hover:bg-yellow-500/20 transition-all font-medium">
                    공유하기
                </button>
            </div>
        </motion.div>
    );
}
