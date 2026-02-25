/* hint-disable no-inline-styles */

'use client';

import React, { useState, useEffect } from "react";
import { motion, useSpring, useTransform } from 'framer-motion';
import { E_COLOR, E_EMOJI } from '@/lib/ui-constants';
import ShinSalCard from './ShinSalCard';
// import PremiumUnlockModal from '../premium/PremiumUnlockModal';
import dynamic from 'next/dynamic';
const PaymentModalKRW = dynamic(() => import('../payment/PaymentModalKRW'), { ssr: false, loading: () => null });
import { useSajuStore } from '@/lib/store';


interface FormBasic {
    year: number;
    month: number;
    day: number;
    calendar: 'solar' | 'lunar';
    name?: string;
}

interface PillarDataFormatted {
    stem: string;
    stemName: string;
    stemElement: string;
    branch: string;
    branchName: string;
    branchElement: string;
    tenGod: string;
    unseong: string;
}

interface DaewoonCycle {
    startAge: number;
    endAge: number;
    ganZhi: string;
    tenGod: string;
    unseong: string;
}

interface ShinsalData {
    dohwa: { has: boolean; count: number; description: string };
    yeokma: { has: boolean; count: number; description: string };
    hwagae: { has: boolean; count: number; description: string };
}

interface SoulmateData {
    name: string;
    title: string;
    quote: string;
    connectionMsg: string;
    id?: string;
    desc?: string;
    imgUrl?: string;
}

interface SajuResultFormatted {
    keywords: string[];
    dayMaster: {
        name: string;
        hanja: string;
        element: string;
    } | string;
    pillars: {
        year: PillarDataFormatted;
        month: PillarDataFormatted;
        day: PillarDataFormatted;
        hour: PillarDataFormatted;
    };
    elementBalance: Record<string, number>;
    lucky: {
        color: string;
        hex: string;
        number: string | number;
        direction: string;
    };
    fortune: Record<string, {
        score: number;
        title?: string;
        detail?: string;
        locked?: boolean;
        dos?: string[];
        donts?: string[];
        idealMatch?: string;
        organs?: string[];
        activities?: string[];
    }>;
    score: number;
    summary: string;
    daewoon?: { startAge: number; cycles: DaewoonCycle[] }; 
    shinsal?: ShinsalData;
    soulmate?: SoulmateData;
}

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

const PillarCard = ({ label, data, isMe }: { label: string, data: PillarDataFormatted, isMe?: boolean }) => {
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
                    ★ 나
                </motion.div>
            )}
            <div className={`text-[11px] font-semibold text-zinc-400 ${isMe ? 'mt-1.5' : 'mt-0.5'} mb-1`}>
                {label}
            </div>


            {/* 천간 */}
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-zinc-600">천간</span>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-col mb-0.5 transition-transform hover:scale-105 ${stemTheme.bgSoft} border-[1.5px] ${stemTheme.borderSoft}`}>
                    <span className={`text-xl font-bold leading-none ${stemTheme.text}`}>{data.stem}</span>
                    <span className={`text-[9px] leading-none ${stemTheme.textSoft}`}>{data.stemElement}</span>
                </div>
                <span className="text-[10px] text-zinc-400">{data.stemName}</span>
            </div>

            <div className="w-4/5 h-px bg-white/6 my-1.5" />

            {/* 지지 */}
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-zinc-600">지지</span>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-col mb-0.5 transition-transform hover:scale-105 ${branchTheme.bgSoft} border-[1.5px] ${branchTheme.borderSoft}`}>
                    <span className={`text-xl font-bold leading-none ${branchTheme.text}`}>{data.branch}</span>
                    <span className={`text-[9px] leading-none ${branchTheme.textSoft}`}>{data.branchElement}</span>
                </div>
                <span className="text-[10px] text-zinc-400">{data.branchName}</span>
            </div>
        </motion.div>
    )
};

const PremiumLock = ({ children, isPremium, onUnlock }: { children: React.ReactNode, isPremium: boolean, onUnlock: () => void }) => {
    if (isPremium) return <>{children}</>;
    return (
        <div className="relative overflow-hidden rounded-2xl group">
            <div className="blur-md opacity-50 pointer-events-none select-none">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10">
                <motion.button
                    onClick={onUnlock}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                        boxShadow: [
                            "0 4px 15px rgba(147, 51, 234, 0.4)",
                            "0 4px 25px rgba(147, 51, 234, 0.7)",
                            "0 4px 15px rgba(147, 51, 234, 0.4)"
                        ],
                        scale: [1, 1.02, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border border-white/20 px-6 py-3 rounded-3xl font-extrabold cursor-pointer flex items-center gap-2 text-sm shadow-2xl hover:shadow-purple-500/50"
                    aria-label="Unlock premium content for 990 KRW"
                >
                    <span>🔓</span>
                    <span>990원으로 잠금해제</span>
                </motion.button>
            </div>
        </div>
    );
};

export default function ResultPageV3({ form, result, onBack, router, onShare, isSharing, onMint, isMinting }: ResultPageProps) {
    const { isPremium } = useSajuStore();
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [tab, setTab] = useState("overall");
    // Smooth Score Animation
    const springScore = useSpring(0, { stiffness: 45, damping: 15, mass: 1.2 });
    const roundedScore = useTransform(springScore, (latest) => Math.round(latest));

    // Determine Day Master Element Color safely
    const dmVal = result?.dayMaster;
    const dm = (typeof dmVal === 'string' ? { name: dmVal, hanja: dmVal, element: 'Wood' } : dmVal) || { name: 'Unknown', hanja: '?', element: 'Wood' };
    const dmTheme = getElTheme(dm.element);

    useEffect(() => {
        const target = result.fortune[tab]?.score || result.score;
        if (target) {
            springScore.set(0);
            setTimeout(() => springScore.set(target), 300);
        }
    }, [tab, result, springScore]);

    const tabs = [
        { k: "overall", l: "총합운" },
        { k: "career", l: "직업/재물" },
        { k: "love", l: "연애/대인" },
        { k: "health", l: "건강" },
        { k: "year", l: "2026년 상세", locked: true },
    ];
    const fort = result.fortune[tab];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
        show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { type: "spring", stiffness: 50, damping: 20 } as const
        }
    };



    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="min-h-screen bg-zinc-950 text-zinc-50 pb-32"
        >
            {/* 상단 보라 그라데이션 */}
            <div className="absolute top-0 left-0 right-0 h-[300px] bg-[radial-gradient(ellipse_at_50%_0%,_rgba(168,85,247,0.12)_0%,_transparent_70%)] pointer-events-none" />

            {/* 네비바 */}
            <nav className="flex justify-between items-center px-5 py-3 relative z-10" role="navigation" aria-label="Result page navigation">
                <motion.button
                    whileHover={{ x: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="bg-transparent border-none text-zinc-400 text-sm cursor-pointer py-2.5 px-1 flex items-center gap-1 hover:text-zinc-200 transition-colors"
                    aria-label="Go back to input form"
                >
                    ← 다시 입력하기
                </motion.button>
            </nav>

            <div className="px-5 relative z-10">
                {/* 히어로 */}
                <motion.header variants={item} className="text-center mb-6" role="banner">
                    <h1 className="text-2xl font-extrabold m-0">
                        <span className="bg-gradient-to-br from-purple-300 via-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
                            사주 분석 결과
                        </span>
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1.5">
                        {form.year}년 {form.month}월 {form.day}일 · {form.calendar === "solar" ? "양력" : "음력"}
                    </p>
                    {/* 일간 뱃지 (Neon Core) */}
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
                    {/* 키워드 (Pulsing Tags) */}
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
                    className="bg-zinc-900/80 border border-white/6 rounded-2xl p-4 mb-4 backdrop-blur-sm"
                    role="region"
                    aria-labelledby="four-pillars-title"
                >
                    <div className="flex justify-between items-center mb-3.5 pb-2.5 border-b border-white/6">
                        <h2 id="four-pillars-title" className="text-[15px] font-bold">사주 원국</h2>
                        <span className="text-[11px] text-zinc-600" aria-label="Four Pillars in Chinese">四柱八字</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        <PillarCard label="시주" data={result.pillars.hour} />
                        <PillarCard label="일주" data={result.pillars.day} isMe />
                        <PillarCard label="월주" data={result.pillars.month} />
                        <PillarCard label="년주" data={result.pillars.year} />
                    </div>
                </motion.section>

                {/* 오행 분포 */}
                <motion.section
                    variants={item}
                    className="bg-zinc-900/80 border border-white/6 rounded-2xl p-4 mb-4 backdrop-blur-sm"
                    role="region"
                    aria-labelledby="elements-title"
                >
                    <h2 id="elements-title" className="text-sm font-bold mb-3">오행 분포</h2>
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
                    <motion.div variants={item} className="bg-zinc-900 border border-white/6 rounded-[18px] py-4 mb-4 overflow-hidden">
                        <div className="px-4 mb-3 flex justify-between items-center">
                            <span className="text-sm font-bold">대운 흐름 (10년 주기)</span>
                            <span className="text-[11px] text-zinc-500">{result.daewoon.startAge}세 시작</span>
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
                                                {d.startAge}세~
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </motion.div>
                )}

                {/* 신살 (Symbolic Stars) - v4.2 */}
                {result.shinsal && (
                    <motion.div variants={item}>
                        <ShinSalCard data={result.shinsal} />
                    </motion.div>
                )}

                {/* 영혼의 단짝 (New Backend Intelligence Feature) */}
                {result.soulmate && (
                    <motion.div variants={item} className="relative bg-zinc-900 border border-purple-500/30 rounded-[18px] p-4 mb-4 overflow-hidden">
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
                        <div className="text-[13px] text-purple-500 font-bold mb-1">영혼의 단짝 (Beta)</div>
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <div className="text-xl font-extrabold text-white">{result.soulmate.name}</div>
                                <div className="text-xs text-zinc-400">{result.soulmate.title}</div>
                            </div>
                            <div className="text-[40px] opacity-20">🤝</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-[13px] leading-relaxed text-zinc-200 mb-3 italic">
                            &quot;{result.soulmate.quote}&quot;
                        </div>
                        <div className="text-xs text-zinc-400 leading-snug">
                            <span className="text-purple-300 font-bold">AI 분석:</span> {result.soulmate.connectionMsg}
                        </div>
                    </motion.div>
                )}

                {/* 운세 탭 */}
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
                            onClick={() => {
                                if (t.locked && !isPremium) {
                                    setShowPremiumModal(true);
                                    setTab(t.k);
                                } else {
                                    setTab(t.k);
                                }
                            }}
                            className={`flex-1 h-9 border-none rounded-[11px] cursor-pointer text-xs transition-all relative ${
                                tab === t.k
                                    ? 'bg-zinc-800 text-zinc-50 font-semibold shadow-sm'
                                    : 'bg-transparent text-zinc-600 font-normal'
                            }`}
                        >
                            {t.l}
                            {t.locked && !isPremium && (
                                <span className="absolute top-0.5 right-0.5 text-[8px]" aria-hidden="true">🔒</span>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* 탭 콘텐츠 */}
                <motion.div
                    id={`fortune-panel-${tab}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${tab}`}
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-zinc-900/80 border border-white/6 rounded-2xl p-5 mb-4 min-h-[180px] backdrop-blur-sm"
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
                                {fort?.dos?.map((d: string, i: number) => <div key={i} className="text-[13px] text-green-500 mb-1">✅ {d}</div>)}
                                {fort?.donts?.map((d: string, i: number) => <div key={i} className="text-[13px] text-red-500 mb-1">❌ {d}</div>)}
                            </div>
                        </div>
                    )}
                    {tab === "love" && <div className="text-[13px] text-zinc-400 text-center">이상적 궁합: {fort?.idealMatch}</div>}
                    {tab === "health" && (
                        <div className="text-[13px] text-zinc-400 text-center">
                            <div>주의 장기: {fort?.organs?.join(", ")}</div>
                            <div className="mt-1.5">추천 활동: {fort?.activities?.join(", ")}</div>
                        </div>
                    )}
                    {tab === "year" && (
                        <div className="text-center py-5 relative">
                            <div className="text-[15px] font-bold text-zinc-200 mb-3">
                                📅 2026년 병오년(丙午年) 상세 운세
                            </div>
                            {!isPremium ? (
                                <div className="blur-[6px] select-none opacity-50">
                                    <p>1월: 새로운 시작을 알리는 기운이 강합니다...</p>
                                    <p>2월: 재물운이 상승하며 뜻밖의 수익이...</p>
                                    <p>3월: 인간관계에서 귀인을 만나게 됩...</p>
                                    <p>4월: 건강 관리에 유의해야 하는 시기...</p>
                                </div>
                            ) : (
                                <div className="text-[13px] text-zinc-300 leading-relaxed text-left">
                                    <div className="mb-3">
                                        <strong className="text-purple-500">[상반기]</strong><br />
                                        새로운 도전을 하기에 적합한 시기입니다. 직장인이라면 승진 운이 명확하게 들어와 있으며, 사업가는 확장의 기회를 잡을 수 있습니다. 다만 4월에는 건강에 유의하세요.
                                    </div>
                                    <div className="mb-3">
                                        <strong className="text-blue-500">[하반기]</strong><br />
                                        재물 흐름이 안정화되는 시기입니다. 투자했던 곳에서 성과가 나오며, 연애운 또한 상승 곡선을 그립니다. 10월에는 이동수가 있으니 이사나 여행 계획을 세워보세요.
                                    </div>
                                    <div className="p-2.5 bg-white/5 rounded-lg text-xs">
                                        💡 <strong>Key Advice:</strong> 올해는 &apos;변화&apos;를 두려워하지 말고 즐기는 것이 개운의 핵심입니다.
                                    </div>
                                </div>
                            )}
                            {!isPremium && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center">
                                    <button
                                        onClick={() => setShowPremiumModal(true)}
                                        className="bg-purple-600 text-white border-none py-2.5 px-5 rounded-[20px] font-bold shadow-lg shadow-purple-600/40 cursor-pointer transition-transform active:scale-95 hover:bg-purple-500"
                                    >
                                        🔒 잠금 해제 (Premium)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Lucky Items */}
                <PremiumLock isPremium={isPremium} onUnlock={() => setShowPremiumModal(true)}>
                    <div className="bg-zinc-900 border border-white/6 rounded-[18px] p-4 mb-4">
                        <div className="text-sm font-bold mb-3.5">🍀 행운의 아이템</div>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { 
                                    icon: (
                                         
                                        <div 
                                             
                                            style={{ '--luck-bg': result.lucky.hex } as React.CSSProperties} 
                                            className="w-9 h-9 rounded-full border-2 border-white/10 bg-[var(--luck-bg)]" 
                                        />
                                    ), 
                                    label: "행운의 색", 
                                    value: result.lucky.color 
                                },
                                { icon: <div className="w-9 h-9 rounded-full bg-purple-500/10 border-[1.5px] border-purple-500/30 flex items-center justify-center text-base font-bold text-purple-500">{result.lucky.number}</div>, label: "행운의 숫자", value: String(result.lucky.number) },
                                { icon: <div className="w-9 h-9 rounded-full bg-blue-500/10 border-[1.5px] border-blue-500/30 flex items-center justify-center text-base">🧭</div>, label: "행운의 방향", value: result.lucky.direction },
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

                {/* 도사님 한마디 */}
                <PremiumLock isPremium={isPremium} onUnlock={() => setShowPremiumModal(true)}>
                    <motion.div variants={item} className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/10 rounded-[18px] p-[22px_18px] mb-4 relative text-center">
                        <div className="absolute top-2 left-3.5 text-5xl text-purple-500/10 leading-none">&quot;</div>
                        <div className="text-[11px] text-zinc-500 mb-2">🔮 도사님의 한마디</div>
                        <p className="text-[15px] italic leading-relaxed m-0 text-zinc-200">
                            &quot;{result.summary}&quot;
                        </p>
                    </motion.div>
                </PremiumLock>

                {/* 액션 그리드 */}
                <motion.div variants={item} className="grid grid-cols-1 gap-3 mb-6">
                    <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/chat')}
                        className="h-16 bg-gradient-to-br from-purple-900/40 to-purple-700/10 border border-purple-500/30 rounded-2xl px-5 cursor-pointer flex items-center gap-3.5 text-left text-zinc-50 transition-all hover:border-purple-500/50"
                        aria-label="Chat with AI fortune teller"
                    >
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
                            🔮
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-purple-200">AI 도사님과 대화하기</div>
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
                            <span className="text-xl">📤</span>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-bold text-zinc-200">{isSharing ? "생성 중..." : "결과 공유"}</div>
                                <div className="text-[10px] text-zinc-500">인스타 자랑하기</div>
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
                            <span className="text-[22px]">💎</span>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-bold text-blue-400">{isMinting ? "발행 중..." : "NFT 소장"}</div>
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
                        처음으로 돌아가기
                    </motion.button>
                </motion.div>

                {/* 푸터 */}
                <footer className="text-center py-5 text-zinc-600 text-[10px] leading-relaxed" role="contentinfo">
                    <div className="font-bold text-zinc-500 mb-1">SAJUCHAIN AI ENGINE V3.0</div>
                    본 결과는 AI에 의해 생성되었으며 정확성을 보장하지 않습니다.<br />
                    단순 재미로만 즐겨주세요.
                </footer>

                <PaymentModalKRW
                    isOpen={showPremiumModal}
                    onClose={() => setShowPremiumModal(false)}
                />
            </div>
        </motion.div >
    );
}
