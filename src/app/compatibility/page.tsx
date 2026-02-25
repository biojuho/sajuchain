'use client';

import { useState } from 'react';
import SajuFormRedesigned from '@/components/SajuFormRedesigned';
import CompatibilityResultView from '@/components/saju/CompatibilityResultView';
import { SajuData, CompatibilityResult, AIResult } from '@/types';
import { SajuResult, calculateCompatibility } from '@/lib/saju-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Infinity as InfinityIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function CompatibilityPage() {
    const [step, setStep] = useState<'input-A' | 'input-B' | 'analyzing' | 'result'>('input-A');
    const [sajuA, setSajuA] = useState<SajuData | null>(null);
    const [sajuB, setSajuB] = useState<SajuData | null>(null);
    const [result, setResult] = useState<CompatibilityResult | null>(null);

    const handleComplete = (data: { saju: SajuResult; ai: AIResult | null | undefined; basic: { year: number; month: number; day: number; hour: number; minute: number; gender: 'M' | 'F'; calendarType: 'solar' | 'lunar'; birthPlace: string; isSummerTime: boolean } }) => {
        // Construct standard SajuData from form output
        const fullData: SajuData = {
            birthDate: `${data.basic.year}-${data.basic.month}-${data.basic.day}`,
            gender: data.basic.gender,
            fourPillars: data.saju.fourPillars,
            fiveElements: data.saju.fiveElements,
            daewoon: data.saju.daewoon,
            dayMaster: data.saju.dayMaster
        };

        if (step === 'input-A') {
            setSajuA(fullData);
            window.scrollTo(0, 0);
            setStep('input-B');
        } else if (step === 'input-B') {
            setSajuB(fullData);
            setStep('analyzing');
            
            // Artificial delay for "Cosmic Connection" animation
            setTimeout(() => {
                if (sajuA) {
                    const compResult = calculateCompatibility(sajuA, fullData);
                    setResult(compResult);
                    setStep('result');
                }
            }, 3000);
        }
    };

    const resetProcess = () => {
        setSajuA(null);
        setSajuB(null);
        setResult(null);
        setStep('input-A');
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center md:items-center relative overflow-hidden">
            {/* Desktop Background: Subtle Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-zinc-950 to-zinc-950 pointer-events-none hidden md:block"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/20 via-zinc-950 to-zinc-950 pointer-events-none hidden md:block opacity-40"></div>

            {/* Main App Container */}
            <div className="w-full max-w-[430px] bg-zinc-950 min-h-screen md:min-h-[850px] md:h-[850px] md:rounded-[40px] md:border-[8px] md:border-zinc-900 md:shadow-2xl relative overflow-hidden flex flex-col mx-auto my-auto ring-1 ring-white/5 font-sans text-zinc-100">
                
                {/* Mobile Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,_rgba(168,85,247,0.15),_transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                {/* Header */}
                <header className="w-full p-6 flex justify-between items-center z-20 shrink-0">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm backdrop-blur-md bg-black/20 px-3 py-1.5 rounded-full border border-white/5"
                    >
                        <span>&larr;</span> 홈으로
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 uppercase tracking-widest">
                            GUNG-HAP
                        </span>
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
                    </div>
                </header>

                <div className="w-full flex-1 flex flex-col relative z-10 pb-20 overflow-y-auto scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {/* Step 1: User A Input */}
                        {step === 'input-A' && (
                            <motion.div
                                key="input-A"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="w-full px-4"
                            >
                                <div className="text-center mb-6 pt-4">
                                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 mb-2">
                                        나의 정보 입력
                                    </h1>
                                    <p className="text-zinc-400 text-sm">먼저 본인의 사주 정보를 알려주세요.</p>
                                </div>
                                <SajuFormRedesigned onComplete={handleComplete} />
                            </motion.div>
                        )}

                        {/* Step 2: User B Input */}
                        {step === 'input-B' && (
                            <motion.div
                                key="input-B"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full px-4"
                            >
                                <div className="text-center mb-6 pt-4">
                                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 mb-2">
                                        상대방 정보 입력
                                    </h1>
                                    <p className="text-zinc-400 text-sm">궁합을 볼 상대방의 정보를 알려주세요.</p>
                                </div>
                                {/* Key forces remount to reset form state */}
                                <SajuFormRedesigned key="form-B" onComplete={handleComplete} />
                            </motion.div>
                        )}

                        {/* Step 3: Analyzing Animation */}
                        {step === 'analyzing' && (
                            <motion.div
                                key="analyzing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center min-h-[60vh] w-full"
                            >
                                <div className="relative w-64 h-64">
                                    {/* Cosmic Orbits */}
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border border-pink-500/20 border-t-pink-500/50"
                                    />
                                    <motion.div 
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-4 rounded-full border border-purple-500/20 border-b-purple-500/50"
                                    />
                                    
                                    {/* User A Star */}
                                    <motion.div
                                        animate={{ x: [0, 50, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute top-1/2 left-1/3 w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_20px_rgba(96,165,250,0.8)]"
                                    >
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-blue-200 whitespace-nowrap">
                                            {sajuA?.dayMaster && (typeof sajuA.dayMaster === 'string' ? sajuA.dayMaster : sajuA.dayMaster.hanja)}
                                        </span>
                                    </motion.div>

                                    {/* User B Star */}
                                    <motion.div
                                        animate={{ x: [0, -50, 0], y: [0, 20, 0], scale: [1, 1.2, 1] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                                        className="absolute top-1/2 right-1/3 w-4 h-4 bg-pink-400 rounded-full shadow-[0_0_20px_rgba(244,114,182,0.8)]"
                                    >
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-pink-200 whitespace-nowrap">
                                            {sajuB?.dayMaster && (typeof sajuB.dayMaster === 'string' ? sajuB.dayMaster : sajuB.dayMaster.hanja)}
                                        </span>
                                    </motion.div>

                                    {/* Connecting Line */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <InfinityIcon className="w-12 h-12 text-white/80 animate-pulse" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold mt-8 text-white animate-pulse">
                                    두 개의 우주를 연결하는 중...
                                </h2>
                                <p className="text-white/40 text-sm mt-2">사주의 오행과 대운을 분석합니다</p>
                            </motion.div>
                        )}

                        {/* Step 4: Result */}
                        {step === 'result' && result && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full px-4 pb-20"
                            >
                                <h2 className="text-center text-sm font-bold text-white/50 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                                    Analysis Complete
                                </h2>
                                
                                <CompatibilityResultView result={result} />

                                <div className="mt-8">
                                    <GlassCard className="p-4 flex flex-col gap-3">
                                        <button
                                            onClick={resetProcess}
                                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <Sparkles className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform" />
                                            다른 궁합 보기
                                        </button>
                                    </GlassCard>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
