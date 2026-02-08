
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui-new/GlassCard';
import { useSajuStore } from '@/lib/store';
import { StarfieldBackground } from '@/components/ui-new/StarfieldBackground';
import { DateScrollPicker } from '@/components/ui-new/DateScrollPicker';
import { TimeGridV2 } from '@/components/ui-new/TimeGridV2';
import { GenderCardSelector } from '@/components/ui-new/GenderCardSelector';
import { RegionInput } from '@/components/ui-new/RegionInput';
import { ProcessIndicator } from '@/components/ui-new/ProcessIndicator';
import { SegmentControl } from '@/components/ui-new/SegmentControl'; // Re-use simpler segment or build pill toggle
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Sparkles, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SajuResult, calculateSaju } from '@/lib/saju-engine';
import { AIResult } from '@/types';

interface SajuFormRedesignedProps {
    onComplete: (data: { saju: SajuResult; ai: AIResult; basic: { year: number; month: number; day: number; hour: number; minute: number; gender: 'M' | 'F', calendarType: 'solar' | 'lunar', birthPlace: string } }) => void;
}

export default function SajuFormRedesigned({ onComplete }: SajuFormRedesignedProps) {
    // --- State ---
    const [loading, setLoading] = useState(false);
    const [basic, setBasic] = useState({
        year: 1990,
        month: 1,
        day: 1,
        hourTime: null as string | null, // '子', '축' etc ID
        gender: null as 'M' | 'F' | null, // Explicit null start
        calendarType: 'solar' as 'solar' | 'lunar',
        birthPlace: ''
    });

    // Derived State for Progress
    const completedSteps = [
        !!(basic.year && basic.month && basic.day), // Step 1 always true if defaults set, but conceptually
        !!basic.gender,
        !!basic.hourTime,
        basic.birthPlace.length > 0
    ].filter(Boolean).length;

    // --- Handlers ---
    const handleDateChange = (y: number, m: number, d: number) => {
        setBasic(prev => ({ ...prev, year: y, month: m, day: d }));
    };

    const isFormValid = basic.gender !== null && basic.hourTime !== null && basic.birthPlace.length > 0;

    const { addToHistory, setSajuData } = useSajuStore();

    const handleSubmit = async () => {
        if (!isFormValid) return;
        setLoading(true);

        // Map hour character to number
        const timeMap: Record<string, number> = {
            '子': 0, '축': 2, '인': 4, '묘': 6, '진': 8, '사': 10,
            '오': 12, '미': 14, '신': 16, '유': 18, '술': 20, '해': 22, 'unknown': 12
        };
        const hour = timeMap[basic.hourTime || 'unknown'] || 12;
        const minute = 30; // Default middle of the hour

        try {
            // 1. Calculate Basic Saju (Engine)
            const sajuResult = calculateSaju(
                basic.year, basic.month, basic.day, hour, minute,
                basic.gender || 'M',
                basic.calendarType
            );

            // 2. Call AI API
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

            // 3. Construct Complete SajuData
            // We need to map the AI result to the expected format
            // The API returns fields like headline, threeLineSummary, personality, etc.
            // We'll trust the API returns the correct shape for now, or fallback

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

            // Construct SajuData for Store/History
            // Note: We need to import SajuData type if we want full type safety, but here we can structurally match it.
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

            // 4. Save to Store & History
            setSajuData(newSajuData);
            addToHistory(newSajuData);

            // 5. Complete
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
            // Fallback to local engine calculation if AI fails
            // ... (Simple fallback implementation could go here, for now just alerting or re-throwing)
            alert("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full min-h-screen flex flex-col items-center p-4 overflow-hidden text-white font-sans scrollbar-hide">
            {/* Starfield handled by Page or Global, but kept here for isolation if needed. 
          Assuming Page has it, but redundancy is safe as absolute positioned. */}
            {/* <StarfieldBackground /> */}

            {/* --- Main Card --- */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md z-10 my-4"
            >
                <GlassCard className="p-6 md:p-8 relative overflow-hidden flex flex-col gap-8">

                    {/* 0. Progress */}
                    <ProcessIndicator totalSteps={4} currentStep={completedSteps + 1} completedSteps={completedSteps} />

                    {/* 1. Date Section */}
                    <section className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                📅 생년월일
                                <CheckCircle2 className={`w-4 h-4 text-purple-400 opacity-0 transition-opacity ${true ? 'opacity-100' : ''}`} />
                            </h2>

                            {/* Compact Solar/Lunar Toggle */}
                            <div className="bg-black/20 p-1 rounded-full flex border border-white/10">
                                {(['solar', 'lunar'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setBasic(p => ({ ...p, calendarType: type }))}
                                        className={`px-3 py-1 text-xs rounded-full transition-all ${basic.calendarType === type
                                            ? 'bg-purple-600 text-white shadow-sm'
                                            : 'text-white/40 hover:text-white/60'
                                            }`}
                                    >
                                        {type === 'solar' ? '☀️ 양력' : '🌙 음력'}
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
                            <h2 className="text-base font-bold">🧑 성별</h2>
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
                            <h2 className="text-base font-bold">🕐 태어난 시간</h2>
                            <span className="text-xs text-white/30 italic">정확하지 않아도 괜찮아요</span>
                        </div>
                        {basic.hourTime && (
                            <div className="px-1 mb-2 text-xs text-purple-300">
                                {basic.hourTime === 'unknown' ? '시간 미상 선택됨' : `선택됨: ${basic.hourTime}`}
                                <CheckCircle2 className="inline w-3 h-3 ml-1" />
                            </div>
                        )}
                        <TimeGridV2
                            value={basic.hourTime}
                            onChange={(v) => setBasic(p => ({ ...p, hourTime: v }))}
                        />
                    </section>

                    {/* 4. Region Section */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <h2 className="text-base font-bold">📍 출생 지역</h2>
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50">선택</span>
                        </div>
                        <RegionInput
                            value={basic.birthPlace}
                            onChange={(v) => setBasic(p => ({ ...p, birthPlace: v }))}
                        />
                    </section>

                    {/* Submit Button */}
                    <div className="pt-4 space-y-3">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={!isFormValid || loading}
                            className={`w-full h-[60px] rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all relative overflow-hidden group ${isFormValid && !loading
                                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-purple-900/40'
                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                                }`}
                        >
                            {/* Shimmer effect */}
                            {isFormValid && !loading && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />
                            )}

                            {loading ? (
                                <span className="animate-spin text-2xl">🔮</span>
                            ) : (
                                <>
                                    <span>✨ 운세 보기</span>
                                </>
                            )}
                        </motion.button>

                        {!isFormValid && (
                            <div className="text-center text-xs text-amber-500/80 flex justify-center gap-2">
                                {!basic.gender && <span>* 성별을 선택해주세요</span>}
                                {!basic.hourTime && <span>* 태어난 시간을 선택해주세요</span>}
                            </div>
                        )}
                    </div>

                </GlassCard>
            </motion.div>

            {/* NFT Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.5 } }}
                className="w-full max-w-md px-2 opacity-80 hover:opacity-100 transition-opacity"
            >
                <div className="w-full h-16 rounded-2xl bg-blue-500/5 border border-blue-400/20 flex items-center justify-between px-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">💎</span>
                        <div>
                            <p className="text-sm font-bold text-blue-100">NFT 영구 소장</p>
                            <p className="text-[10px] text-blue-200/50">블록체인에 당신의 운명을 기록하세요</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                </div>
            </motion.div>
        </div>
    );
}
