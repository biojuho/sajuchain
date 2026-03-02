'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSajuStore } from '@/lib/store';
import { motion } from 'framer-motion';

export default function MyDojoPage() {
    const router = useRouter();
    const history = useSajuStore((state) => state.history);
    const setSajuData = useSajuStore((state) => state.setSajuData);

    const handleLoad = (data: Parameters<typeof setSajuData>[0]) => {
        setSajuData(data);
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center md:items-center relative overflow-hidden">
            {/* Desktop Background: Subtle Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-zinc-950 to-zinc-950 pointer-events-none hidden md:block"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/20 via-zinc-950 to-zinc-950 pointer-events-none hidden md:block opacity-40"></div>

            {/* Main App Container */}
            <div className="w-full max-w-[430px] bg-zinc-950 min-h-screen md:min-h-[850px] md:h-[850px] md:rounded-[40px] md:border-[8px] md:border-zinc-900 md:shadow-2xl relative overflow-hidden flex flex-col mx-auto my-auto ring-1 ring-white/5 font-sans text-zinc-100 pb-20">
                {/* Mobile Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,_rgba(168,85,247,0.15),_transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                <div className="relative z-10 p-5 flex-1 overflow-y-auto scrollbar-hide">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-extrabold">내 도장 🏯</h1>
                        <button 
                            onClick={() => router.push('/')} 
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border-none cursor-pointer hover:bg-white/20 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* List */}
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] opacity-50">
                            <span className="text-5xl mb-4">📜</span>
                            <p>아직 저장된 사주가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {history.map((data, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handleLoad(data)}
                                    className="bg-zinc-900 rounded-2xl p-4 border border-white/6 cursor-pointer active:scale-98 transition-transform"
                                >
                                    <div className="flex justify-between mb-1">
                                        <span className="text-base font-bold">
                                            {data.birthDate} {data.birthTime}
                                        </span>
                                        <span className="text-xs text-purple-500 font-semibold">
                                            {typeof data.dayMaster === 'string' 
                                                ? data.dayMaster.split('(')[0]
                                                : data.dayMaster?.name || data.dayMaster?.hanja || 'Unknown'} 일간
                                        </span>
                                    </div>
                                    <div className="text-[13px] text-zinc-500 flex gap-2">
                                        <span>{data.gender === 'male' ? '남성' : '여성'}</span>
                                        <span>•</span>
                                        <span>{data.fiveElements?.dominant || '-'} 기운 강함</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
