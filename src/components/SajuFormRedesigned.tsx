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
import { buildFortune, FORTUNE_SCORE_VERSION } from '@/lib/fortune-score';
import { createCurrentSchemaSajuData } from '@/lib/saju-schema';
import { checkAndIncrementUsage, getUsageRemaining } from '@/lib/usage-limiter';
import UsageLimitBanner from '@/components/ui/UsageLimitBanner';
import { trackInterpretation } from '@/lib/analytics';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('SajuForm');

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
        } catch {
            // Corrupt/stale session state — silently ignore and start fresh
        }
    }, [searchParams]);

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
            const fortuneSnapshot = buildFortune(aiData, {
                fiveElements: sajuResult.fiveElements,
                shinsal: sajuResult.shinsal,
            });
            const fullSajuData: SajuData = createCurrentSchemaSajuData({
                birthDate: `${basic.year}-${String(basic.month).padStart(2, '0')}-${String(basic.day).padStart(2, '0')}`,
                birthTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
                gender: basic.gender || 'M',
                calendarType: basic.calendarType,
                birthPlace: basic.birthPlace,
                fourPillars: sajuResult.fourPillars,
                fiveElements: sajuResult.fiveElements,
                dayMaster: sajuResult.dayMaster,
                daewoon: sajuResult.daewoon,
                shinsal: sajuResult.shinsal,
                soulmate: sajuResult.soulmate,
                aiResult: aiData,
                fortuneSnapshot,
                scoreVersion: FORTUNE_SCORE_VERSION,
                generatedAt: new Date().toISOString(),
            });

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

        } catch {
            // Fallback: Proceed without AI data if it fails (e.g. no API key, timeout)
            // Construct basic SajuData even if AI fails
            try {
                 const sajuResult = calculateSaju(
                    basic.year, basic.month, basic.day, hour, minute,
                    basic.gender || 'M',
                    basic.calendarType,
                    basic.isSummerTime
                );

                 const fortuneSnapshot = buildFortune(undefined, {
                    fiveElements: sajuResult.fiveElements,
                    shinsal: sajuResult.shinsal,
                });
                 const fullSajuData: SajuData = createCurrentSchemaSajuData({
                    birthDate: `${basic.year}-${String(basic.month).padStart(2, '0')}-${String(basic.day).padStart(2, '0')}`,
                    birthTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
                    gender: basic.gender || 'M',
                    calendarType: basic.calendarType,
                    birthPlace: basic.birthPlace,
                    fourPillars: sajuResult.fourPillars,
                    fiveElements: sajuResult.fiveElements,
                    dayMaster: sajuResult.dayMaster,
                    daewoon: sajuResult.daewoon,
                    shinsal: sajuResult.shinsal,
                    soulmate: sajuResult.soulmate,
                    aiResult: undefined, // Explicitlyundefined
                    fortuneSnapshot,
                    scoreVersion: FORTUNE_SCORE_VERSION,
                    generatedAt: new Date().toISOString(),
                });

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
            } catch {
                 alert(t('errors.analyzeError'));
                 setLoading(false);
            }
        }
    };

    // Animation Variants
    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0, filter: 'blur(4px)', scale: 0.98 }),
        center: { x: 0, opacity: 1, filter: 'blur(0px)', scale: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0, filter: 'blur(4px)', scale: 0.98 })
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
                                <motion.div key="step0" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 28 }} className="space-y-6">
                                    <div className="text-center space-y-2 mb-6">
                                        <KineticHeading text={t('step0.title')} className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-white" />
                                        <motion.p 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-white/50 text-sm"
                                        >
                                            {t('step0.subtitle')}
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
                                                    ? 'bg-zinc-100 border-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                                                    }`}
                                            >
                                                {type === 'solar' ? t('step0.solar') : t('step0.lunar')}
                                            </motion.button>
                                        ))}
                                    </div>

                                    <DateScrollPicker
                                        year={basic.year}
                                        month={basic.month}
                                        day={basic.day}
                                        onChange={handleDateChange}
                                        labelYear={t('step0.year')}
                                        labelMonth={t('step0.month')}
                                        labelDay={t('step0.day')}
                                    />
                                </motion.div>
                            )}

                            {step === 1 && (
                                <motion.div key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 28 }} className="space-y-6">
                                    <div className="text-center space-y-2 mb-2">
                                        <KineticHeading text={t('step1.title')} className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-white" />
                                        <motion.p
                                             initial={{ opacity: 0, y: 10 }}
                                             animate={{ opacity: 1, y: 0 }}
                                             transition={{ delay: 0.5 }}
                                             className="text-white/50 text-sm"
                                        >
                                            {t('step1.subtitle')}
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
                                            className="flex items-center gap-3 cursor-pointer group bg-white/5 px-5 py-3 rounded-2xl border border-white/10 hover:border-white/30 transition-all"
                                        >
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${basic.isSummerTime ? 'bg-yellow-500 border-yellow-500' : 'border-zinc-500 group-hover:border-zinc-400'}`}>
                                                {basic.isSummerTime && <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                title={t('step1.summerTimeToggle')}
                                                aria-label={t('step1.summerTimeToggle')}
                                                checked={basic.isSummerTime}
                                                onChange={(e) => setBasic(p => ({ ...p, isSummerTime: e.target.checked }))}
                                                className="hidden"
                                            />
                                            <span className={`text-sm font-medium ${basic.isSummerTime ? 'text-yellow-400' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                                                {t('step1.summerTimeAction')}
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
                                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-2 mb-4">
                                        <KineticHeading text={t('step2.title')} className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-white" />
                                        <motion.p 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-white/50 text-sm"
                                        >
                                            {t('step2.subtitle')}
                                        </motion.p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 ml-1">{t('step2.genderLabel')}</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['M', 'F'] as const).map((g) => (
                                                <motion.button
                                                    key={g}
                                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setBasic({ ...basic, gender: g })}
                                                    className={`p-4 rounded-2xl border transition-all ${basic.gender === g
                                                        ? 'bg-white/15 border-white/80 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="text-3xl mb-2">{g === 'M' ? '👨' : '👩'}</div>
                                                    <div className="text-sm font-bold">{g === 'M' ? t('step2.male') : t('step2.female')}</div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 ml-1">{t('step2.birthPlaceLabel')}</label>
                                        <input
                                            type="text"
                                            value={basic.birthPlace}
                                            onChange={(e) => setBasic({ ...basic, birthPlace: e.target.value })}
                                            placeholder={t('step2.birthPlacePlaceholder')}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/5 transition-all"
                                        />
                                    </div>

                                    {/* Privacy Agreement */}
                                    <div className="flex items-start gap-3 mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                                        <div className="pt-0.5">
                                            <input
                                                type="checkbox"
                                                id="agreement"
                                                checked={agreement}
                                                onChange={(e) => setAgreement(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-600 bg-gray-800 focus:ring-zinc-400 accent-zinc-500"
                                            />
                                        </div>
                                        <label htmlFor="agreement" className="text-xs text-gray-400 leading-relaxed cursor-pointer select-none">
                                            <span className="text-gray-300 font-medium">{t('step2.agreementRequired')}</span><br />
                                            {t('step2.agreementDesc1')}<a href="/privacy.md" target="_blank" className="underline text-zinc-300 hover:text-white">{t('step2.privacyPolicy')}</a>{t('step2.and')}<a href="/terms.md" target="_blank" className="underline text-zinc-300 hover:text-white">{t('step2.terms')}</a>{t('step2.agreementDesc2')}
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
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255, 255, 255, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNext}
                            disabled={!canProceed[step]}
                            className={`w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all relative overflow-hidden border ${canProceed[step]
                                ? 'bg-zinc-100 text-black border-zinc-100 shadow-[0_4px_20px_rgba(255,255,255,0.2)]'
                                : 'bg-white/5 border-transparent text-white/20 cursor-not-allowed'
                                }`}
                        >
                            {/* Shine Effect */}
                            {canProceed[step] && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-shine" />
                            )}
                            
                            {step === 2 ? (
                                loading ? t('actions.analyzing') : t('actions.checkFortune')
                            ) : (
                                <>
                                    <span>{t('actions.next')}</span>
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
