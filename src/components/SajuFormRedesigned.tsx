'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrystalCard } from '@/components/ui/CrystalCard';
import { useSajuStore } from '@/lib/store';
import { KineticHeading } from '@/components/ui/KineticHeading';
import { DateScrollPicker } from '@/components/ui/DateScrollPicker';
import { TimeGridV2 } from '@/components/ui/TimeGridV2';
import { ProcessIndicator } from '@/components/ui/ProcessIndicator';
import { LoadingOracle } from '@/components/ui/LoadingOracle';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { SajuResult, calculateSaju } from '@/lib/saju-engine';
import { AIResult, SajuData } from '@/types';
import { checkAndIncrementUsage, getUsageRemaining } from '@/lib/usage-limiter';
import UsageLimitBanner from '@/components/ui/UsageLimitBanner';
import { trackInterpretation } from '@/lib/analytics';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const PaymentModalKRW = dynamic(() => import('@/components/payment/PaymentModalKRW'), { ssr: false, loading: () => null });

interface SajuFormRedesignedProps {
    onComplete: (data: { saju: SajuResult; ai: AIResult | null | undefined; basic: { year: number; month: number; day: number; hour: number; minute: number; gender: 'M' | 'F', calendarType: 'solar' | 'lunar', birthPlace: string, isSummerTime: boolean } }) => void;
    skipAI?: boolean;
}

export default function SajuFormRedesigned({ onComplete, skipAI = false }: SajuFormRedesignedProps) {
    // --- State ---
    const [step, setStep] = useState(0); // 0: Date, 1: Time, 2: Gender/Region
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState(1); // 1: Next, -1: Back
    const [agreement, setAgreement] = useState(false);
    const [interpretRemaining, setInterpretRemaining] = useState<number | null>(null);
    const [limitReached, setLimitReached] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const searchParams = useSearchParams();
    const autoResumeAttemptedRef = useRef(false);

    const [basic, setBasic] = useState({
        year: 1990,
        month: 1,
        day: 1,
        hourTime: null as string | null,
        gender: null as 'M' | 'F' | null,
        calendarType: 'solar' as 'solar' | 'lunar',
        birthPlace: '',
        isSummerTime: false
    });

    // Validation per step
    const canProceed = [
        true, // Step 0 (Date) always valid (defaults)
        !!basic.hourTime, // Step 1 (Time)
        !!basic.gender && basic.birthPlace.length > 0 && agreement // Step 2 (Gender/Place + Agreement)
    ];

    const { addToHistory, setSajuData, user, isPremium } = useSajuStore();

    const persistInterpretContext = React.useCallback(() => {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem('saju-resume-interpret-context', JSON.stringify({ basic, step }));
    }, [basic, step]);

    const clearInterpretContext = React.useCallback(() => {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem('saju-resume-interpret-context');
    }, []);

    // Load remaining usage on mount
    React.useEffect(() => {
        if (skipAI || isPremium) return;
        getUsageRemaining('interpret', user?.id).then(setInterpretRemaining);
    }, [user?.id, skipAI, isPremium]);

    // Restore form context if user is coming back from payment flow.
    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const raw = sessionStorage.getItem('saju-resume-interpret-context');
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw) as {
                basic?: typeof basic;
                step?: number;
            };
            if (parsed.basic) {
                setBasic(parsed.basic);
            }
            if (typeof parsed.step === 'number') {
                setStep(Math.min(2, Math.max(0, parsed.step)));
            }
        } catch (error) {
            console.error('Failed to restore interpret context:', error);
        }
    }, []);

    React.useEffect(() => {
        const resume = searchParams.get('resume');
        if (resume !== 'interpret' || autoResumeAttemptedRef.current) {
            return;
        }

        autoResumeAttemptedRef.current = true;
        setLimitReached(false);

        // Strip the resume param after consumption.
        if (typeof window !== 'undefined') {
            const cleanPath = window.location.pathname;
            window.history.replaceState({}, '', cleanPath);
        }

        setTimeout(() => {
            void handleSubmit();
        }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, isPremium]);

    // Handlers
    const handleNext = () => {
        if (step < 2 && canProceed[step]) {
            setDirection(1);
            setStep(s => s + 1);
        } else if (step === 2) {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setDirection(-1);
            setStep(s => s - 1);
        }
    };

    const handleDateChange = (y: number, m: number, d: number) => {
        setBasic(prev => ({ ...prev, year: y, month: m, day: d }));
    };

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);

        const timeMap: Record<string, number> = {
            '子': 0, '축': 2, '인': 4, '묘': 6, '진': 8, '사': 10,
            '오': 12, '미': 14, '신': 16, '유': 18, '술': 20, '해': 22, 'unknown': 12
        };
        const hour = timeMap[basic.hourTime || 'unknown'] || 12;
        const minute = 30;

        try {
            // 1. Calculate Basic Saju (Engine)
            const sajuResult = calculateSaju(
                basic.year, basic.month, basic.day, hour, minute,
                basic.gender || 'M',
                basic.calendarType,
                basic.isSummerTime
            );

            let aiData: AIResult | undefined;

            // 2. Call AI API (Only if not skipped)
            if (!skipAI) {
                // Check usage limit client-side first
                if (!isPremium) {
                    const usageCheck = await checkAndIncrementUsage('interpret', user?.id);
                    if (!usageCheck.allowed) {
                        persistInterpretContext();
                        setLimitReached(true);
                        setLoading(false);
                        return;
                    }
                    setInterpretRemaining(usageCheck.remaining);
                }

                const response = await fetch('/api/interpret', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        birthDate: `${basic.year}-${basic.month}-${basic.day} ${hour}:${minute}`,
                        gender: basic.gender === 'M' ? 'male' : 'female',
                        dayMaster: `${sajuResult.dayMaster.hanja}(${sajuResult.dayMaster.element})`,
                        yearPillar: sajuResult.fourPillars.year,
                        monthPillar: sajuResult.fourPillars.month,
                        dayPillar: sajuResult.fourPillars.day,
                        hourPillar: sajuResult.fourPillars.hour,
                        daewoon: sajuResult.daewoon,
                        fiveElements: sajuResult.fiveElements,
                        userId: user?.id
                    })
                });

                if (response.status === 429) {
                    persistInterpretContext();
                    setLimitReached(true);
                    setLoading(false);
                    return;
                }
                if (!response.ok) throw new Error('AI Interpretation failed');
                aiData = await response.json();
                trackInterpretation();
            }

            // 3. Construct Complete SajuData
            const fullSajuData: SajuData = {
                birthDate: `${basic.year}-${String(basic.month).padStart(2, '0')}-${String(basic.day).padStart(2, '0')}`,
                birthTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
                gender: basic.gender || 'M',
                calendarType: basic.calendarType,
                birthPlace: basic.birthPlace,
                fourPillars: sajuResult.fourPillars,
                fiveElements: sajuResult.fiveElements,
                dayMaster: sajuResult.dayMaster,
                daewoon: sajuResult.daewoon,
                aiResult: aiData,
                generatedAt: new Date().toISOString(),
            };

            setSajuData(fullSajuData);
            addToHistory(fullSajuData);
            clearInterpretContext();

            onComplete({
                saju: sajuResult,
                ai: aiData,
                basic: {
                    year: basic.year,
                    month: basic.month,
                    day: basic.day,
                    hour: hour,
                    minute: minute,
                    gender: basic.gender || 'M',
                    calendarType: basic.calendarType,
                    birthPlace: basic.birthPlace,
                    isSummerTime: basic.isSummerTime
                }
            });

        } catch (e) {
            console.error("Calculation/AI Error", e);
            // Fallback: Proceed without AI data if it fails (e.g. no API key, timeout)
            // Construct basic SajuData even if AI fails
            try {
                 const sajuResult = calculateSaju(
                    basic.year, basic.month, basic.day, hour, minute,
                    basic.gender || 'M',
                    basic.calendarType,
                    basic.isSummerTime
                );

                 const fullSajuData: SajuData = {
                    birthDate: `${basic.year}-${String(basic.month).padStart(2, '0')}-${String(basic.day).padStart(2, '0')}`,
                    birthTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
                    gender: basic.gender || 'M',
                    calendarType: basic.calendarType,
                    birthPlace: basic.birthPlace,
                    fourPillars: sajuResult.fourPillars,
                    fiveElements: sajuResult.fiveElements,
                    dayMaster: sajuResult.dayMaster,
                    daewoon: sajuResult.daewoon,
                    aiResult: undefined, // Explicitlyundefined
                    generatedAt: new Date().toISOString(),
                };

                setSajuData(fullSajuData);
                addToHistory(fullSajuData);
                clearInterpretContext();

                onComplete({
                    saju: sajuResult,
                    ai: null, // Indicate AI failure
                    basic: {
                        year: basic.year,
                        month: basic.month,
                        day: basic.day,
                        hour: hour,
                        minute: minute,
                        gender: basic.gender || 'M',
                        calendarType: basic.calendarType,
                        birthPlace: basic.birthPlace,
                        isSummerTime: basic.isSummerTime
                    }
                });
            } catch (innerError) {
                 console.error("Critical Engine Error", innerError);
                 alert("분석 중 치명적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                 setLoading(false);
            }
        }
    };

    // Animation Variants
    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 })
    };

    if (limitReached) {
        return (
            <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-4 text-white">
                <div className="w-full max-w-md">
                    <UsageLimitBanner
                        type="interpret"
                        remaining={0}
                        blockedActionKey="interpret"
                        onUpgrade={() => setShowUpgradeModal(true)}
                    />
                </div>
                <PaymentModalKRW
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    resumeActionKey="interpret"
                    returnToPath="/"
                />
            </div>
        );
    }

    if (loading) return <LoadingOracle />;

    return (
        <div className="relative w-full min-h-screen flex flex-col items-center p-4 overflow-hidden text-white font-sans scrollbar-hide">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md z-10 my-4"
            >
                <CrystalCard className="p-6 md:p-8 relative overflow-hidden flex flex-col gap-6 min-h-[500px]">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                        {step > 0 ? (
                            <button onClick={handleBack} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors" aria-label="Go back" title="Go back">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        ) : <div className="w-9" />}
                        <ProcessIndicator totalSteps={3} currentStep={step + 1} completedSteps={step} />
                        <div className="w-9" />
                    </div>

                    {/* Steps Content */}
                    <div className="flex-1 relative">
                        <AnimatePresence custom={direction} mode="wait">
                            {step === 0 && (
                                <motion.div key="step0" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
                                    <div className="text-center space-y-2 mb-6">
                                        <KineticHeading text="언제 태어나셨나요?" className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white" />
                                        <motion.p 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-white/50 text-sm"
                                        >
                                            양력/음력을 정확히 선택해주세요.
                                        </motion.p>
                                    </div>

                                    <div className="flex justify-center gap-4 mb-4">
                                        {(['solar', 'lunar'] as const).map(type => (
                                            <motion.button
                                                key={type}
                                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setBasic(p => ({ ...p, calendarType: type }))}
                                                className={`px-6 py-2.5 rounded-full transition-all border backdrop-blur-md ${basic.calendarType === type
                                                    ? 'bg-purple-600/80 border-purple-400/50 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                                                    }`}
                                            >
                                                {type === 'solar' ? '☀️ 양력' : '🌙 음력'}
                                            </motion.button>
                                        ))}
                                    </div>

                                    <DateScrollPicker
                                        year={basic.year}
                                        month={basic.month}
                                        day={basic.day}
                                        onChange={handleDateChange}
                                    />
                                </motion.div>
                            )}

                            {step === 1 && (
                                <motion.div key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
                                    <div className="text-center space-y-2 mb-2">
                                        <KineticHeading text="몇 시에 태어나셨나요?" className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white" />
                                        <motion.p
                                             initial={{ opacity: 0, y: 10 }}
                                             animate={{ opacity: 1, y: 0 }}
                                             transition={{ delay: 0.5 }}
                                             className="text-white/50 text-sm"
                                        >
                                            정확한 시간이 사주의 정확도를 높입니다.
                                        </motion.p>
                                    </div>

                                    <TimeGridV2
                                        value={basic.hourTime}
                                        onChange={(v) => setBasic(p => ({ ...p, hourTime: v }))}
                                    />

                                    <div className="flex justify-center pt-2">
                                        <motion.label 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-3 cursor-pointer group bg-white/5 px-5 py-3 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all"
                                        >
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${basic.isSummerTime ? 'bg-yellow-500 border-yellow-500' : 'border-zinc-500 group-hover:border-zinc-400'}`}>
                                                {basic.isSummerTime && <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                title="썸머타임 적용 여부"
                                                aria-label="썸머타임 적용 여부"
                                                checked={basic.isSummerTime}
                                                onChange={(e) => setBasic(p => ({ ...p, isSummerTime: e.target.checked }))}
                                                className="hidden"
                                            />
                                            <span className={`text-sm font-medium ${basic.isSummerTime ? 'text-yellow-400' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                                                썸머타임 적용 (-1시간)
                                            </span>
                                        </motion.label>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-2 mb-4">
                                        <KineticHeading text="마지막 단계입니다." className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white" />
                                        <motion.p 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-white/50 text-sm"
                                        >
                                            성별과 출생지를 알려주세요.
                                        </motion.p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 ml-1">성별</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['M', 'F'] as const).map((g) => (
                                                <motion.button
                                                    key={g}
                                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(168, 85, 247, 0.1)" }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setBasic({ ...basic, gender: g })}
                                                    className={`p-4 rounded-2xl border transition-all ${basic.gender === g
                                                        ? 'bg-purple-500/20 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="text-3xl mb-2">{g === 'M' ? '👨' : '👩'}</div>
                                                    <div className="text-sm font-bold">{g === 'M' ? '남성' : '여성'}</div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 ml-1">출생 지역 (시/군/구)</label>
                                        <input
                                            type="text"
                                            value={basic.birthPlace}
                                            onChange={(e) => setBasic({ ...basic, birthPlace: e.target.value })}
                                            placeholder="예: 서울시 강남구"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-all"
                                        />
                                    </div>

                                    {/* Privacy Agreement */}
                                    <div className="flex items-start gap-3 mt-4 p-3 bg-purple-900/5 rounded-xl border border-purple-500/10">
                                        <div className="pt-0.5">
                                            <input
                                                type="checkbox"
                                                id="agreement"
                                                checked={agreement}
                                                onChange={(e) => setAgreement(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500 accent-purple-500"
                                            />
                                        </div>
                                        <label htmlFor="agreement" className="text-xs text-gray-400 leading-relaxed cursor-pointer select-none">
                                            <span className="text-gray-300 font-medium">[필수] 개인정보 수집 및 이용 동의</span><br />
                                            사주 분석을 위해 입력하신 생년월일 정보를 수집하며, 서비스 종료 시까지(또는 탈퇴 시) 보관합니다. 자세한 내용은 <a href="/privacy.md" target="_blank" className="underline text-purple-400 hover:text-purple-300">개인정보처리방침</a> 및 <a href="/terms.md" target="_blank" className="underline text-purple-400 hover:text-purple-300">이용약관</a>을 확인해주세요.
                                        </label>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Usage remaining badge */}
                    {!skipAI && !isPremium && interpretRemaining !== null && (
                        <div className="flex justify-center">
                            <UsageLimitBanner type="interpret" remaining={interpretRemaining} compact />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNext}
                            disabled={!canProceed[step]}
                            className={`w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all relative overflow-hidden ${canProceed[step]
                                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-purple-900/40'
                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                                }`}
                        >
                            {/* Shine Effect */}
                            {canProceed[step] && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shine" />
                            )}
                            
                            {step === 2 ? (
                                loading ? '🔮 분석 중...' : '운세 확인하기'
                            ) : (
                                <>
                                    <span>다음으로</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </div>

                </CrystalCard>
            </motion.div>
            <PaymentModalKRW
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                resumeActionKey="interpret"
                returnToPath="/"
            />
        </div >
    );
}
