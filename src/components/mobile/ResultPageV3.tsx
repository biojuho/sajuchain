/* hint-disable no-inline-styles */

'use client';

// cspell:ignore saju Saju daewoon Daewoon shinsal donts SAJUCHAIN

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { E_COLOR, E_EMOJI } from '@/lib/ui-constants';
import ShinSalCard from './ShinSalCard';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
const PaymentModalKRW = dynamic(() => import('../payment/PaymentModalKRW'), { ssr: false, loading: () => null });
const PaymentModalUSD = dynamic(() => import('../payment/PaymentModalUSD'), { ssr: false, loading: () => null });
import { useSajuStore } from '@/lib/store';
import type { FormattedPillar } from '@/lib/pillar-mapper';
import type { SajuUIResult } from '@/lib/saju-result-mapper';
import type { DaewoonCycle } from '@/types';
import { useTranslations } from 'next-intl';

const TypingEffect = ({ text }: { text: string }) => {
    const chars = text.split("");
    return (
        <motion.span
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: { staggerChildren: 0.01 }
                }
            }}
        >
            {chars.map((char, index) => (
                <motion.span
                    key={index}
                    variants={{
                        hidden: { opacity: 0, filter: 'blur(4px)' },
                        visible: { opacity: 1, filter: 'blur(0px)' }
                    }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.span>
    );
};

interface FormBasic {
    year: number;
    month: number;
    day: number;
    calendar: 'solar' | 'lunar';
    name?: string;
}

type PillarDataFormatted = FormattedPillar;

type SajuResultFormatted = SajuUIResult;

interface ResultPageProps {
    form: FormBasic;
    result: SajuResultFormatted;
    onBack: () => void;
    router: { push: (url: string) => void };
    onShare: () => void;
    isSharing: boolean;
    onMint: () => void;
    isMinting: boolean;
}



const ELEMENT_THEME: Record<string, { bgSoft: string, borderSoft: string, text: string, textSoft: string, color: string }> = {
    'Wood': { bgSoft: 'bg-green-500/10', borderSoft: 'border-green-500/40', text: 'text-green-500', textSoft: 'text-green-500/80', color: 'green' },
    'Fire': { bgSoft: 'bg-red-500/10', borderSoft: 'border-red-500/40', text: 'text-red-500', textSoft: 'text-red-500/80', color: 'red' },
    'Earth': { bgSoft: 'bg-yellow-500/10', borderSoft: 'border-yellow-500/40', text: 'text-yellow-500', textSoft: 'text-yellow-500/80', color: 'yellow' },
    'Metal': { bgSoft: 'bg-zinc-400/10', borderSoft: 'border-zinc-400/40', text: 'text-zinc-400', textSoft: 'text-zinc-400/80', color: 'zinc' },
    'Water': { bgSoft: 'bg-blue-500/10', borderSoft: 'border-blue-500/40', text: 'text-blue-500', textSoft: 'text-blue-500/80', color: 'blue' },
};

const getElTheme = (el: string) => ELEMENT_THEME[el] || ELEMENT_THEME['Metal'];

// Color hex map for inline styles (Tailwind JIT cannot compile dynamic class names like `from-${color}-500`)
const DM_COLOR_MAP: Record<string, string> = {
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#eab308',
    zinc: '#a1a1aa',
    blue: '#3b82f6',
};

const PillarCard = React.memo(({ label, data, isMe }: { label: string, data: PillarDataFormatted, isMe?: boolean }) => {
    const t = useTranslations('ResultPage');
    const stemTheme = getElTheme(data.stemElement);
    const branchTheme = getElTheme(data.branchElement);

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative rounded-2xl backdrop-blur-md p-3 flex flex-col items-center gap-1 ${
                isMe
                    ? 'bg-purple-500/10 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                    : 'bg-zinc-800/40 border border-white/8'
            }`}
            role="article"
            aria-label={`${label} pillar${isMe ? ' (you)' : ''}`}
        >
            {isMe && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap z-10 shadow-lg"
                >
                    {t('me')}
                </motion.div>
            )}
            <div className={`text-[11px] font-semibold text-zinc-400 ${isMe ? 'mt-1.5' : 'mt-0.5'} mb-1`}>
                {label}
            </div>


            {/* 천간 */}
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-zinc-600">{t('heavenlyStem')}</span>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-col mb-0.5 transition-transform hover:scale-105 ${stemTheme.bgSoft} border-[1.5px] ${stemTheme.borderSoft}`}>
                    <span className={`text-xl font-bold leading-none ${stemTheme.text}`}>{data.stem}</span>
                    <span className={`text-[9px] leading-none ${stemTheme.textSoft}`}>{data.stemElement}</span>
                </div>
                <span className="text-[10px] text-zinc-400">{data.stemName}</span>
            </div>

            <div className="w-4/5 h-px bg-white/6 my-1.5" />

            {/* 지지 */}
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-zinc-600">{t('earthlyBranch')}</span>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-col mb-0.5 transition-transform hover:scale-105 ${branchTheme.bgSoft} border-[1.5px] ${branchTheme.borderSoft}`}>
                    <span className={`text-xl font-bold leading-none ${branchTheme.text}`}>{data.branch}</span>
                    <span className={`text-[9px] leading-none ${branchTheme.textSoft}`}>{data.branchElement}</span>
                </div>
                <span className="text-[10px] text-zinc-400">{data.branchName}</span>
            </div>
        </motion.div>
    )
});
PillarCard.displayName = 'PillarCard';

const PremiumLock = React.memo(({ children, isPremium, onUnlock }: { children: React.ReactNode, isPremium: boolean, onUnlock: () => void }) => {
    const locale = useLocale();
    const priceText = locale === 'ko' ? '990원' : '$0.99';

    return (
        <div className="relative overflow-hidden rounded-2xl group min-h-[120px]">
            <AnimatePresence mode="wait">
                {isPremium ? (
                    <motion.div
                        key="unlocked"
                        initial={{ filter: 'blur(10px)', opacity: 0, y: 15 }}
                        animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative"
                    >
                        {/* Golden Unlock Sparkles / Particles */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 1, x: "50%", y: "50%" }}
                                    animate={{ 
                                        scale: [0, 1.5, 0], 
                                        opacity: [1, 1, 0],
                                        x: `calc(50% + ${(Math.random() - 0.5) * 200}px)`,
                                        y: `calc(50% + ${(Math.random() - 0.5) * 200}px)`
                                    }}
                                    transition={{ duration: 1.5 + Math.random(), ease: "easeOut", delay: i * 0.1 }}
                                    className="absolute w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]"
                                />
                            ))}
                        </div>
                        <div className="relative z-10 w-full">
                            {children}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="locked"
                        exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                    >
                        <div className="blur-xl opacity-40 pointer-events-none select-none grayscale-[50%] transition-all duration-500">
                            {children}
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-sm z-10 rounded-2xl border border-white/5">
                            
                            <motion.button
                                onClick={onUnlock}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{
                                    boxShadow: [
                                        "0 4px 15px rgba(255, 255, 255, 0.1)",
                                        "0 4px 25px rgba(255, 255, 255, 0.2)",
                                        "0 4px 15px rgba(255, 255, 255, 0.1)"
                                    ],
                                    scale: [1, 1.02, 1]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="bg-white text-black px-6 py-3 rounded-3xl font-bold cursor-pointer flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition-colors"
                            >
                                <span className="text-lg">✨</span>
                                <span>Unlock Premium ({priceText})</span>
                            </motion.button>
                            <p className="text-[10px] text-zinc-500 mt-3 flex gap-1 items-center">
                                <span>🔒</span> Secure Payment
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
PremiumLock.displayName = 'PremiumLock';

export default function ResultPageV3({ form, result, onBack, router, onShare, isSharing, onMint, isMinting }: ResultPageProps) {
    const t = useTranslations('ResultPage');
    const locale = useLocale();
    const { isPremium } = useSajuStore();
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [tab, setTab] = useState("overall");
    const [premiumInsight, setPremiumInsight] = useState<{ yearFlow: string; relationshipDeepDive: string } | null>(null);
    const [isLoadingPremiumInsight, setIsLoadingPremiumInsight] = useState(false);
    // Smooth Score Animation
    const springScore = useSpring(0, { stiffness: 45, damping: 15, mass: 1.2 });
    const roundedScore = useTransform(springScore, (latest) => Math.round(latest));

    // Determine Day Master Element Color safely
    const dmVal = result?.dayMaster;
    const dm = (typeof dmVal === 'string' ? { name: dmVal, hanja: dmVal, element: 'Wood' } : dmVal) || { name: 'Unknown', hanja: '?', element: 'Wood' };
    const dmTheme = getElTheme(dm.element);

    useEffect(() => {
        if (!isPremium || premiumInsight || isLoadingPremiumInsight) {
            return;
        }

        const payload = {
            dayMaster: `${dm.hanja} ${dm.element}`,
            summary: result.summary,
            keywords: result.keywords,
            daewoon: result.daewoon,
            ...(typeof result.rawData?.saju === 'object' ? result.rawData.saju as unknown as Record<string, unknown> : {}),
        };

        setIsLoadingPremiumInsight(true);
        fetch('/api/interpret/premium', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sajuData: payload }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Premium insight fetch failed');
                }
                return res.json();
            })
            .then((data) => {
                setPremiumInsight({
                    yearFlow: data.yearFlow || '',
                    relationshipDeepDive: data.relationshipDeepDive || '',
                });
            })
            .catch((error) => {
                console.error('Failed to load premium insight:', error);
            })
            .finally(() => {
                setIsLoadingPremiumInsight(false);
            });
    }, [dm.element, dm.hanja, isLoadingPremiumInsight, isPremium, premiumInsight, result.daewoon, result.keywords, result.rawData?.saju, result.summary]);

    useEffect(() => {
        const target = result.fortune[tab]?.score || result.score;
        if (target) {
            springScore.set(0);
            setTimeout(() => springScore.set(target), 300);
        }
    }, [tab, result, springScore]);

    const tabs = useMemo(() => [
        { k: "overall", l: "종합운" },
        { k: "career", l: "직업/재물" },
        { k: "love", l: "연애/대인" },
        { k: "health", l: "건강" },
        { k: "year", l: "2026년 운세", locked: true },
    ], []);
    const fort = result.fortune[tab];

    const handleTabClick = useCallback((tabKey: string, locked?: boolean) => {
        if (locked && !isPremium) {
            setShowPremiumModal(true);
        }
        setTab(tabKey);
    }, [isPremium]);

    const container = useMemo(() => ({
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    }), []);

    const item = useMemo(() => ({
        hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
        show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { type: "spring", stiffness: 50, damping: 20 } as const
        }
    }), []);



    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="min-h-screen bg-transparent text-zinc-50 pb-32 relative"
        >
            {/* ?곷떒 蹂대씪 洹몃씪?곗씠??*/}
            <div className="absolute top-0 left-0 right-0 h-[300px] bg-[radial-gradient(ellipse_at_50%_0%,_rgba(168,85,247,0.12)_0%,_transparent_70%)] pointer-events-none" />

            {/* ?ㅻ퉬諛?*/}
            <nav className="flex justify-between items-center px-5 py-3 relative z-10" role="navigation" aria-label="Result page navigation">
                <motion.button
                    whileHover={{ x: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="bg-transparent border-none text-zinc-400 text-sm cursor-pointer py-2.5 px-1 flex items-center gap-1 hover:text-zinc-200 transition-colors"
                    aria-label="Go back to input form"
                >
                    &larr; {t('reEnter')}
                </motion.button>
            </nav>

            <div className="px-5 relative z-10">
                {/* 헤더 */}
                <motion.header variants={item} className="text-center mb-6" role="banner">
                    <h1 className="text-2xl font-extrabold m-0">
                        <span className="bg-gradient-to-br from-purple-300 via-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
                            {t('analysisTitle')}
                        </span>
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1.5">
                        {form.year}년 {form.month}월 {form.day}일 쨌 {form.calendar === "solar" ? t('solar') : t('lunar')}
                    </p>
                    {/* 일간 기둥 (Neon Core) */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 rounded-full my-5 mx-auto flex items-center justify-center flex-col relative border-2"
                        style={{
                           background: `linear-gradient(to bottom right, ${DM_COLOR_MAP[dmTheme.color] || '#3b82f6'}33, ${DM_COLOR_MAP[dmTheme.color] || '#3b82f6'}0d)`,
                           borderColor: DM_COLOR_MAP[dmTheme.color] || '#3b82f6',
                           boxShadow: `0 0 30px ${DM_COLOR_MAP[dmTheme.color] || '#3b82f6'}50`
                        }}
                        role="img"
                        aria-label={`Day master: ${dm.name}, ${dm.element} element`}
                    >
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -inset-1 rounded-full opacity-50 border"
                            style={{ borderColor: DM_COLOR_MAP[dmTheme.color] || '#3b82f6' }}
                        />
                        <span className={`text-[32px] font-black leading-none ${dmTheme.text} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`}>
                            {dm.hanja}
                        </span>
                        <span className={`text-[11px] font-bold mt-0.5 ${dmTheme.text}`}>
                            {dm.element}
                        </span>
                    </motion.div>
                    <div className="text-sm text-zinc-400">{dm.name}</div>
                    {/* ?ㅼ썙??(Pulsing Tags) */}
                    <div className="flex gap-2 justify-center flex-wrap mt-4 p-0 m-0" aria-label="Personality keywords">{
                        (result?.keywords || []).map((k: string, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                whileHover={{ scale: 1.1, rotate: [-1, 1, 0] }}
                                className="px-3.5 py-1.5 rounded-full text-sm font-bold bg-purple-500/10 border border-purple-500/30 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.1)] cursor-default transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                            >
                                #{k}
                            </motion.div>
                        ))
                    }</div>
                </motion.header>

                {/* 사주 원국 카드 */}
                <motion.section
                    variants={item}
                    className="glass rounded-3xl p-5 mb-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
                    role="region"
                    aria-labelledby="four-pillars-title"
                >
                    <div className="flex justify-between items-center mb-3.5 pb-2.5 border-b border-white/6">
                        <h2 id="four-pillars-title" className="text-[15px] font-bold">{t('fourPillarsTitle')}</h2>
                        <span className="text-[11px] text-zinc-600" aria-label="Four Pillars in Chinese">四柱八字</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        <PillarCard label={t('hourPillar')} data={result.pillars.hour} />
                        <PillarCard label={t('dayPillar')} data={result.pillars.day} isMe />
                        <PillarCard label={t('monthPillar')} data={result.pillars.month} />
                        <PillarCard label={t('yearPillar')} data={result.pillars.year} />
                    </div>
                </motion.section>

                {/* 오행 분포 */}
                <motion.section
                    variants={item}
                    className="glass rounded-3xl p-5 mb-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
                    role="region"
                    aria-labelledby="elements-title"
                >
                    <h2 id="elements-title" className="text-sm font-bold mb-3">{t('elementsTitle')}</h2>
                    <div className="space-y-1.5" role="list" aria-label="Five elements distribution">
                        {result.elementBalance && Object.entries(result.elementBalance).map(([el, cnt]) => {
                            const vals = Object.values(result.elementBalance) as number[];
                            const maxVal = vals.length > 0 ? Math.max(...vals) : 1;
                            return (
                            <div key={el} className="flex items-center gap-2" role="listitem">
                                <span className="w-11 text-xs text-zinc-400">{E_EMOJI[el] || ''} {el}</span>
                                <div className="flex-1 h-4 bg-zinc-800 rounded-lg overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${maxVal > 0 ? (cnt / maxVal) * 100 : 0}%`
                                        }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                        className="h-full rounded-lg opacity-70 hover:opacity-90 transition-opacity"
                                        style={{ background: E_COLOR[el] || '#555' }}
                                        role="progressbar"
                                        aria-label={`${el} element`}
                                        aria-valuenow={cnt}
                                        aria-valuemin={0}
                                        aria-valuemax={maxVal}
                                    />
                                </div>
                                <span className="w-4 text-xs text-zinc-500 text-right">{cnt}</span>
                            </div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* 대운 흐름 (New Premium Feature) */}
                {result.daewoon && (
                    <motion.div variants={item} className="glass rounded-3xl py-5 mb-5 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                        <div className="px-5 mb-4 flex justify-between items-center">
                            <span className="text-sm font-bold">{t('daewoonTitle')}</span>
                            <span className="text-[11px] text-zinc-500">{t('startAge', { age: result.daewoon.startAge })}</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
                            {/* Current Year for Active Check */}
                            {(() => {
                                const currentYear = new Date().getFullYear();
                                const birthYear = form.year;
                                const age = currentYear - birthYear + 1; // Korean Age approx

                                return result.daewoon!.cycles.map((d: DaewoonCycle, i: number) => {
                                    const nextStart = result.daewoon!.cycles[i + 1]?.startAge || 999;
                                    const isActive = age >= d.startAge && age < nextStart;
                                    const [stemGod, branchGod] = (d.tenGod || "/").split("/");

                                    return (
                                        <div key={i} className={`min-w-[72px] rounded-xl py-3 flex flex-col items-center gap-0.5 shrink-0 ${
                                            isActive 
                                                ? "bg-purple-500/10 border border-purple-500/40" 
                                                : "bg-zinc-800 border border-white/6"
                                        }`}>
                                            {isActive && (
                                                <div className="text-[9px] text-purple-500 font-bold mb-0.5">Current</div>
                                            )}
                                            <span className={`text-[13px] font-bold ${isActive ? "text-purple-200" : "text-zinc-50"}`}>
                                                {d.ganZhi}
                                            </span>
                                            <div className="text-[10px] text-zinc-400 flex flex-col items-center leading-tight">
                                                <span>{stemGod}</span>
                                                <span>{branchGod}</span>
                                            </div>
                                            <div className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${
                                                isActive ? "bg-purple-600" : "bg-zinc-700"
                                            }`}>
                                                {d.startAge}??
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </motion.div>
                )}

                {/* ?좎궡 (Symbolic Stars) - v4.2 */}
                {result.shinsal && (
                    <motion.div variants={item}>
                        <ShinSalCard data={result.shinsal} />
                    </motion.div>
                )}

                {/* ?곹샎???⑥쭩 (New Backend Intelligence Feature) */}
                {result.soulmate && (
                    <motion.div variants={item} className="relative glass !border-purple-500/30 rounded-3xl p-5 mb-5 overflow-hidden shadow-[0_8px_32px_0_rgba(168,85,247,0.15)]">
                        {/* Shimmer Effect */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{
                                repeat: Infinity,
                                duration: 3,
                                ease: "linear",
                                repeatDelay: 2
                            }}
                            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -skew-x-[20deg] pointer-events-none z-10"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,_rgba(168,85,247,0.15)_0%,_transparent_60%)] pointer-events-none" />
                        <div className="text-[13px] text-purple-500 font-bold mb-1">?곹샎???⑥쭩 (Beta)</div>
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <div className="text-xl font-extrabold text-white">{result.soulmate.name}</div>
                                <div className="text-xs text-zinc-400">{result.soulmate.title}</div>
                            </div>
                            <div className="text-[40px] opacity-20">?쩃</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-[13px] leading-relaxed text-zinc-200 mb-3 italic">
                            &quot;{result.soulmate.quote}&quot;
                        </div>
                        <div className="text-xs text-zinc-400 leading-snug">
                            <span className="text-purple-300 font-bold">AI 遺꾩꽍:</span> {result.soulmate.connectionMsg}
                        </div>
                    </motion.div>
                )}

                {/* ?댁꽭 ??*/}
                { }
                <div className="bg-zinc-900 rounded-xl p-0.5 flex gap-0.5 mb-2.5" aria-label="Fortune categories">
                    {tabs.map((t: { k: string; l: string; locked?: boolean }) => (
                        <motion.button
                            key={t.k}
                            aria-pressed={tab === t.k}
                            aria-controls={`fortune-panel-${t.k}`}
                            aria-label={`${t.l}${t.locked && !isPremium ? " (Locked)" : ""}`}
                            whileHover={{ backgroundColor: tab === t.k ? undefined : "rgba(255,255,255,0.03)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTabClick(t.k, t.locked)}
                            className={`flex-1 h-9 border-none rounded-[11px] cursor-pointer text-xs transition-all relative ${
                                tab === t.k
                                    ? 'bg-zinc-800 text-zinc-50 font-semibold shadow-sm'
                                    : 'bg-transparent text-zinc-600 font-normal'
                            }`}
                        >
                            {t.l}
                            {t.locked && !isPremium && (
                                <span className="absolute top-0.5 right-0.5 text-[8px]" aria-hidden="true">?뵏</span>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* ??肄섑뀗痢?*/}
                <motion.div
                    id={`fortune-panel-${tab}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${tab}`}
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass rounded-3xl p-6 mb-5 min-h-[180px] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
                >
                    <div className="text-center mb-3.5">
                        <span className="text-[42px] font-extrabold text-purple-500">
                            <motion.span key={`score-${tab}`} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                                {roundedScore}
                            </motion.span>
                        </span>
                        <span className="text-lg text-zinc-600">/100</span>
                    </div>
                    <h3 className="text-sm font-semibold text-center mb-2.5 leading-normal">{fort?.title}</h3>
                    {tab === "overall" && (
                        <p className="text-sm text-zinc-400 leading-relaxed text-center">{fort?.detail}</p>
                    )}
                    {tab === "career" && (
                        <div>
                            <div className="mt-2">
                                {fort?.dos?.map((d: string, i: number) => <div key={i} className="text-[13px] text-green-500 mb-1">??{d}</div>)}
                                {fort?.donts?.map((d: string, i: number) => <div key={i} className="text-[13px] text-red-500 mb-1">??{d}</div>)}
                            </div>
                        </div>
                    )}
                    {tab === "love" && <div className="text-[13px] text-zinc-400 text-center">?댁긽??沅곹빀: {fort?.idealMatch}</div>}
                    {tab === "health" && (
                        <div className="text-[13px] text-zinc-400 text-center">
                            <div>二쇱쓽 ?κ린: {fort?.organs?.join(", ")}</div>
                            <div className="mt-1.5">異붿쿇 ?쒕룞: {fort?.activities?.join(", ")}</div>
                        </div>
                    )}
                    {tab === "year" && (
                        <div className="text-center py-5 relative">
                            <div className="text-[15px] font-bold text-zinc-200 mb-3">
                                ?뱟 2026??蹂묒삤??訝쇿뜄亮? ?곸꽭 ?댁꽭
                            </div>
                            {!isPremium ? (
                                <div className="blur-[6px] select-none opacity-50">
                                    <p>1?? ?덈줈???쒖옉???뚮━??湲곗슫??媛뺥빀?덈떎...</p>
                                    <p>2?? ?щЪ?댁씠 ?곸듅?섎ŉ ?삳컰???섏씡??..</p>
                                    <p>3?? ?멸컙愿怨꾩뿉??洹?몄쓣 留뚮굹寃???..</p>
                                    <p>4?? 嫄닿컯 愿由ъ뿉 ?좎쓽?댁빞 ?섎뒗 ?쒓린...</p>
                                </div>
                            ) : isLoadingPremiumInsight ? (
                                <div className="text-[13px] text-zinc-400 leading-relaxed text-left">
                                    프리미엄 리포트를 생성하는 중입니다...
                                </div>
                            ) : (
                                <div className="text-[13px] text-zinc-300 leading-relaxed text-left whitespace-pre-line">
                                    <TypingEffect text={premiumInsight?.yearFlow || result.summary || ''} />
                                </div>
                            )}
                            {!isPremium && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center">
                                    <button
                                        onClick={() => setShowPremiumModal(true)}
                                        className="bg-purple-600 text-white border-none py-2.5 px-5 rounded-[20px] font-bold shadow-lg shadow-purple-600/40 cursor-pointer transition-transform active:scale-95 hover:bg-purple-500"
                                    >
                                        ?뵏 ?좉툑 ?댁젣 (Premium)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>


                <PremiumLock isPremium={isPremium} onUnlock={() => setShowPremiumModal(true)}>
                    <div className="glass rounded-3xl p-5 mb-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                        <div className="text-sm font-bold mb-3.5">관계 심화 리포트</div>
                        <p className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-line">
                            {isLoadingPremiumInsight
                                ? '프리미엄 리포트를 생성하는 중입니다...'
                                : <TypingEffect text={premiumInsight?.relationshipDeepDive || '관계 리포트를 준비 중입니다...'} />}
                        </p>
                    </div>
                </PremiumLock>

                {/* Lucky Items */}
                <PremiumLock isPremium={isPremium} onUnlock={() => setShowPremiumModal(true)}>
                    <div className="glass rounded-3xl p-5 mb-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                        <div className="text-sm font-bold mb-3.5">행운 아이템</div>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                {
                                    icon: (
                                        <div
                                            {...{ style: { '--luck-bg': result.lucky.hex } as React.CSSProperties }}
                                            className="w-9 h-9 rounded-full border-2 border-white/10 bg-[var(--luck-bg)]"
                                        />
                                    ),
                                    label: "행운 색상",
                                    value: result.lucky.color
                                },
                                {
                                    icon: <div className="w-9 h-9 rounded-full bg-purple-500/10 border-[1.5px] border-purple-500/30 flex items-center justify-center text-base font-bold text-purple-500">{result.lucky.number}</div>,
                                    label: "행운 숫자",
                                    value: String(result.lucky.number)
                                },
                                {
                                    icon: <div className="w-9 h-9 rounded-full bg-blue-500/10 border-[1.5px] border-blue-500/30 flex items-center justify-center text-base">↗</div>,
                                    label: "행운 방향",
                                    value: result.lucky.direction
                                },
                            ].map((it, i) => (
                                <div key={i} className="bg-zinc-800/60 border border-white/8 backdrop-blur-sm rounded-2xl p-4 px-2.5 flex flex-col items-center gap-2">
                                    {it.icon}
                                    <span className="text-[10px] text-zinc-500 font-semibold">{it.label}</span>
                                    <span className="text-sm font-bold text-zinc-200">{it.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </PremiumLock>

                {/* ?꾩궗???쒕쭏??*/}
                <PremiumLock isPremium={isPremium} onUnlock={() => setShowPremiumModal(true)}>
                    <motion.div variants={item} className="glass !bg-gradient-to-br !from-purple-500/10 !to-blue-500/10 !border-purple-500/20 rounded-3xl p-[24px_20px] mb-5 relative text-center shadow-[0_8px_32px_0_rgba(168,85,247,0.1)]">
                        <div className="absolute top-2 left-3.5 text-5xl text-purple-500/10 leading-none">&quot;</div>
                        <div className="text-[11px] text-zinc-500 mb-2">오늘 사주의 테마</div>
                        <p className="text-[15px] italic leading-relaxed m-0 text-zinc-200">
                            &quot;{result.summary}&quot;
                        </p>
                    </motion.div>
                </PremiumLock>

                {/* ?≪뀡 洹몃━??*/}
                <motion.div variants={item} className="grid grid-cols-1 gap-3 mb-6">
                    <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/chat')}
                        className="h-16 bg-gradient-to-br from-purple-900/40 to-purple-700/10 border border-purple-500/30 rounded-2xl px-5 cursor-pointer flex items-center gap-3.5 text-left text-zinc-50 transition-all hover:border-purple-500/50"
                        aria-label="Chat with AI fortune teller"
                    >
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
                            ?뵰
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-purple-200">AI 사주사와 대화하기</div>
                            <div className="text-[11px] text-zinc-400">궁금한 점을 자세히 물어보세요</div>
                        </div>
                        <div className="text-purple-500 text-lg">→</div>
                    </motion.button>

                    <div className="grid grid-cols-2 gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onShare}
                            disabled={isSharing}
                            className="h-14 bg-gradient-to-br from-zinc-800 to-black border border-white/10 rounded-2xl px-4 cursor-pointer flex items-center gap-2.5 backdrop-blur-md disabled:opacity-60 shadow-lg transition-all hover:shadow-xl"
                            aria-label={isSharing ? "Generating share image" : "Share result"}
                        >
                            <span className="text-xl">?뱾</span>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-bold text-zinc-200">{isSharing ? "생성 중.." : "결과 공유"}</div>
                                <div className="text-[10px] text-zinc-500">인스타 카드 만들기</div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onMint}
                            disabled={isMinting}
                            className="h-14 bg-gradient-to-br from-blue-600/20 to-blue-700/10 border border-blue-500/50 rounded-2xl px-4 cursor-pointer flex items-center gap-2.5 backdrop-blur-md disabled:opacity-60 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                            aria-label={isMinting ? "Minting NFT" : "Mint as NFT"}
                        >
                            <span className="text-[22px]">?뭿</span>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-bold text-blue-400">{isMinting ? "諛쒗뻾 以?.." : "NFT ?뚯옣"}</div>
                                <div className="text-[10px] text-blue-300">영구 기록 저장</div>
                            </div>
                        </motion.button>
                    </div>

                    <motion.button
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onBack}
                        className="h-12 bg-transparent border border-white/5 rounded-2xl text-zinc-500 text-sm font-medium cursor-pointer transition-colors hover:border-white/10"
                        aria-label="Go back to beginning"
                    >
                        泥섏쓬?쇰줈 ?뚯븘媛湲?
                    </motion.button>
                </motion.div>

                {/* ?명꽣 */}
                <footer className="text-center py-5 text-zinc-600 text-[10px] leading-relaxed" role="contentinfo">
                    <div className="font-bold text-zinc-500 mb-1">SAJUCHAIN AI ENGINE V3.0</div>
                    蹂?寃곌낵??AI???섑빐 ?앹꽦?섏뿀?쇰ŉ ?뺥솗?깆쓣 蹂댁옣?섏? ?딆뒿?덈떎.<br />
                    ?⑥닚 ?щ?濡쒕쭔 利먭꺼二쇱꽭??
                </footer>

                {locale === 'ko' ? (
                    <PaymentModalKRW
                        isOpen={showPremiumModal}
                        onClose={() => setShowPremiumModal(false)}
                    />
                ) : (
                    <PaymentModalUSD
                        isOpen={showPremiumModal}
                        onClose={() => setShowPremiumModal(false)}
                    />
                )}
            </div>
        </motion.div >
    );
}
