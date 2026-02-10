
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui-new/GlassCard';
import { useSajuStore } from '@/lib/store';
import { DateScrollPicker } from '@/components/ui-new/DateScrollPicker';
import { TimeGridV2 } from '@/components/ui-new/TimeGridV2';
import { GenderCardSelector } from '@/components/ui-new/GenderCardSelector';
import { RegionInput } from '@/components/ui-new/RegionInput';
import { ProcessIndicator } from '@/components/ui-new/ProcessIndicator';
import { Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SajuResult, calculateSaju } from '@/lib/saju-engine';
import { AIResult } from '@/types';

interface SajuFormRedesignedProps {
    onComplete: (data: { saju: SajuResult; ai: AIResult; basic: { year: number; month: number; day: number; hour: number; minute: number; gender: 'M' | 'F', calendarType: 'solar' | 'lunar', birthPlace: string } }) => void;
}

const LOADING_MESSAGES = [
    { text: "사주 팔자를 계산하고 있습니다...", icon: "🔮" },
    { text: "천간과 지지를 분석하는 중...", icon: "📜" },
    { text: "오행의 균형을 살피는 중...", icon: "⚖️" },
    { text: "AI 도사님이 해석하는 중...", icon: "🧙" },
    { text: "당신의 운명을 읽고 있습니다...", icon: "✨" },
];

export default function SajuFormRedesigned({ onComplete }: SajuFormRedesignedProps) {
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);
    const [basic, setBasic] = useState({
        year: 1990,
        month: 1,
        day: 1,
        hourTime: null as string | null,
        gender: null as 'M' | 'F' | null,
        calendarType: 'solar' as 'solar' | 'lunar',
        birthPlace: ''
    });

    const completedSteps = [
        !!(basic.year && basic.month && basic.day),
        !!basic.gender,
        !!basic.hourTime,
        basic.birthPlace.length > 0
    ].filter(Boolean).length;

    const handleDateChange = (y: number, m: number, d: number) => {
        setBasic(prev => ({ ...prev, year: y, month: m, day: d }));
    };

    const isFormValid = basic.gender !== null && basic.hourTime !== null && basic.birthPlace.length > 0;

    const { addToHistory, setSajuData } = useSajuStore();

    // Loading animation
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [loading]);

    const handleStartClick = () => {
        setShowForm(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleSubmit = async () => {
        if (!isFormValid) return;
        setLoading(true);
        setLoadingStep(0);

        const timeMap: Record<string, number> = {
            '子': 0, '축': 2, '인': 4, '묘': 6, '진': 8, '사': 10,
            '오': 12, '미': 14, '신': 16, '유': 18, '술': 20, '해': 22, 'unknown': 12
        };
        const hour = timeMap[basic.hourTime || 'unknown'] || 12;
        const minute = 30;

        try {
            const sajuResult = calculateSaju(
                basic.year, basic.month, basic.day, hour, minute,
                basic.gender || 'M',
                basic.calendarType
            );

            const response = await fetch('/api/interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthDate: `${basic.year}-${basic.month}-${basic.day} ${hour}:${minute}`,
                    gender: basic.gender === 'M' ? 'male' : 'female',
                    dayMaster: sajuResult.dayMaster,
                    yearPillar: sajuResult.fourPillars.year,
                    monthPillar: sajuResult.fourPillars.month,
                    dayPillar: sajuResult.fourPillars.day,
                    hourPillar: sajuResult.fourPillars.hour,
                    daewoon: sajuResult.daewoon,
                    fiveElements: sajuResult.fiveElements
                })
            });

            if (!response.ok) throw new Error('AI Interpretation failed');
            const aiData = await response.json();

            const fullAiResult: AIResult = {
                headline: aiData.headline || sajuResult.interpretation.dominanceMsg,
                threeLineSummary: aiData.threeLineSummary || ['운명의 흐름을 읽는 중...', '잠시만 기다려주세요.'],
                personality: aiData.personality || sajuResult.interpretation.personalityKeywords.join(', '),
                career: aiData.career || '직업운 분석 중...',
                relationship: aiData.relationship || '애정운 분석 중...',
                health: aiData.health || '건강운 분석 중...',
                yearFortune2026: aiData.yearFortune2026 || '2026년 운세 분석 중...',
                luckyItems: aiData.luckyItems || { color: 'Purple', number: 7, direction: 'East' },
                advice: aiData.advice || '행운이 함께하기를 바랍니다.',
                daewoonAnalysis: aiData.daewoonAnalysis
            };

            const newSajuData = {
                birthDate: `${basic.year}-${basic.month}-${basic.day}`,
                birthTime: `${hour}:${minute}`,
                gender: (basic.gender === 'M' ? 'male' : 'female') as 'male' | 'female',
                calendarType: basic.calendarType,
                birthPlace: basic.birthPlace,
                fourPillars: sajuResult.fourPillars,
                fiveElements: sajuResult.fiveElements,
                dayMaster: sajuResult.dayMaster,
                aiResult: fullAiResult,
                sajuInterpretation: sajuResult.interpretation,
                daewoon: sajuResult.daewoon,
                shinsal: sajuResult.shinsal,
                generatedAt: new Date().toISOString()
            };

            setSajuData(newSajuData);
            addToHistory(newSajuData);

            onComplete({
                saju: sajuResult,
                ai: fullAiResult,
                basic: {
                    year: basic.year,
                    month: basic.month,
                    day: basic.day,
                    hour,
                    minute,
                    gender: basic.gender!,
                    calendarType: basic.calendarType,
                    birthPlace: basic.birthPlace
                }
            });

        } catch (e) {
            console.error("Calculation/AI Error", e);
            alert("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            setLoading(false);
        }
    };

    // Loading Screen
    if (loading) {
        return (
            <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden text-white">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px]" />
                    <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-blue-600/10 blur-[80px]" />
                </div>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative z-10 flex flex-col items-center"
                >
                    {/* Spinning crystal ball */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="w-28 h-28 rounded-full border-2 border-purple-500/30 flex items-center justify-center mb-8 relative"
                    >
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm" />
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-5xl relative z-10"
                        >
                            🔮
                        </motion.span>
                        {/* Orbiting dots */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-purple-400" />
                        </motion.div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0"
                        >
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
                        </motion.div>
                    </motion.div>

                    {/* Progress bar */}
                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-6">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: `${((loadingStep + 1) / LOADING_MESSAGES.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        />
                    </div>

                    {/* Message */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={loadingStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-3 text-center"
                        >
                            <span className="text-xl">{LOADING_MESSAGES[loadingStep].icon}</span>
                            <span className="text-sm text-white/70">{LOADING_MESSAGES[loadingStep].text}</span>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen flex flex-col items-center overflow-hidden text-white font-sans">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md z-10 text-center pt-12 pb-6 px-4"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mb-4"
                >
                    <span className="text-5xl">🔮</span>
                </motion.div>
                <h1 className="text-2xl font-black mb-2 font-serif">
                    <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
                        SajuChain
                    </span>
                </h1>
                <p className="text-sm text-white/50 leading-relaxed">
                    AI가 분석하는 당신의 사주팔자<br />
                    <span className="text-white/30">운명을 블록체인에 영원히 기록하세요</span>
                </p>

                {!showForm && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleStartClick}
                        className="mt-8 px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-bold text-base shadow-lg shadow-purple-900/30 flex items-center gap-2 mx-auto"
                    >
                        <Sparkles className="w-4 h-4" />
                        사주 분석 시작하기
                    </motion.button>
                )}
            </motion.div>

            {/* Form Card */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        ref={formRef}
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full max-w-md z-10 px-4 pb-6"
                    >
                        <GlassCard className="p-6 md:p-8 relative overflow-hidden flex flex-col gap-7">

                            {/* Progress */}
                            <ProcessIndicator totalSteps={4} currentStep={completedSteps + 1} completedSteps={completedSteps} />

                            {/* 1. Date Section */}
                            <section className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <h2 className="text-base font-bold flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">1</span>
                                        생년월일
                                        <CheckCircle2 className="w-4 h-4 text-purple-400 opacity-100" />
                                    </h2>
                                    <div className="bg-black/20 p-0.5 rounded-full flex border border-white/10">
                                        {(['solar', 'lunar'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setBasic(p => ({ ...p, calendarType: type }))}
                                                className={`px-3 py-1.5 text-xs rounded-full transition-all ${basic.calendarType === type
                                                    ? 'bg-purple-600 text-white shadow-sm'
                                                    : 'text-white/40 hover:text-white/60'
                                                    }`}
                                            >
                                                {type === 'solar' ? '양력' : '음력'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <DateScrollPicker
                                    year={basic.year}
                                    month={basic.month}
                                    day={basic.day}
                                    onChange={handleDateChange}
                                />
                            </section>

                            {/* 2. Gender Section */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <h2 className="text-base font-bold flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${basic.gender ? 'bg-purple-500/20' : 'bg-white/10'}`}>2</span>
                                        성별
                                    </h2>
                                    {basic.gender && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                                </div>
                                <GenderCardSelector
                                    value={basic.gender}
                                    onChange={(v) => setBasic(p => ({ ...p, gender: v }))}
                                />
                            </section>

                            {/* 3. Time Section */}
                            <section className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <h2 className="text-base font-bold flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${basic.hourTime ? 'bg-purple-500/20' : 'bg-white/10'}`}>3</span>
                                        태어난 시간
                                        {basic.hourTime && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                                    </h2>
                                    <span className="text-[11px] text-white/30">정확하지 않아도 괜찮아요</span>
                                </div>
                                <TimeGridV2
                                    value={basic.hourTime}
                                    onChange={(v) => setBasic(p => ({ ...p, hourTime: v }))}
                                />
                            </section>

                            {/* 4. Region Section */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <h2 className="text-base font-bold flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${basic.birthPlace.length > 0 ? 'bg-purple-500/20' : 'bg-white/10'}`}>4</span>
                                        출생 지역
                                        {basic.birthPlace.length > 0 && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                                    </h2>
                                </div>
                                <RegionInput
                                    value={basic.birthPlace}
                                    onChange={(v) => setBasic(p => ({ ...p, birthPlace: v }))}
                                />
                            </section>

                            {/* Submit Button */}
                            <div className="pt-2 space-y-3">
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={!isFormValid || loading}
                                    className={`w-full h-[56px] rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-xl transition-all relative overflow-hidden ${isFormValid && !loading
                                        ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-purple-900/40'
                                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                                        }`}
                                >
                                    {isFormValid && !loading && (
                                        <motion.div
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                                        />
                                    )}
                                    <Sparkles className="w-4 h-4" />
                                    <span>운세 분석하기</span>
                                </motion.button>

                                {!isFormValid && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center text-xs text-white/40 space-x-3"
                                    >
                                        {!basic.gender && <span>성별</span>}
                                        {!basic.hourTime && <span>시간</span>}
                                        {basic.birthPlace.length === 0 && <span>지역</span>}
                                        <span className="text-white/25">을 선택해주세요</span>
                                    </motion.div>
                                )}
                            </div>

                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* NFT Banner */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.3 } }}
                    className="w-full max-w-md px-6 pb-8 opacity-70 hover:opacity-100 transition-opacity"
                >
                    <div className="w-full h-14 rounded-2xl bg-blue-500/5 border border-blue-400/15 flex items-center justify-between px-4 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">💎</span>
                            <div>
                                <p className="text-xs font-bold text-blue-100">사주 NFT 발행</p>
                                <p className="text-[10px] text-blue-200/40">블록체인에 당신의 운명을 영구 기록</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </motion.div>
            )}
        </div>
    );
}
