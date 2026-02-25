'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { BottomSheetPortal } from '@/components/ui-final/BottomSheetPortal';
import { calculateSaju, SajuResult } from '@/lib/saju-engine';
import { AIResult } from '@/types';

// Sijin Data (from snippet)
const SIJIN = [
    { key: "ja", name: "자시", hanja: "子", time: "23:30 ~ 01:30" },
    { key: "chuk", name: "축시", hanja: "丑", time: "01:30 ~ 03:30" },
    { key: "in", name: "인시", hanja: "寅", time: "03:30 ~ 05:30" },
    { key: "myo", name: "묘시", hanja: "卯", time: "05:30 ~ 07:30" },
    { key: "jin", name: "진시", hanja: "辰", time: "07:30 ~ 09:30" },
    { key: "sa", name: "사시", hanja: "巳", time: "09:30 ~ 11:30" },
    { key: "oh", name: "오시", hanja: "午", time: "11:30 ~ 13:30" },
    { key: "mi", name: "미시", hanja: "未", time: "13:30 ~ 15:30" },
    { key: "shin", name: "신시", hanja: "申", time: "15:30 ~ 17:30" },
    { key: "yu", name: "유시", hanja: "酉", time: "17:30 ~ 19:30" },
    { key: "sul", name: "술시", hanja: "戌", time: "19:30 ~ 21:30" },
    { key: "hae", name: "해시", hanja: "亥", time: "21:30 ~ 23:30" },
];

const CITIES = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "제주", "해외"];

// Helper to get days in month
const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

interface SajuFormFinalProps {
    onComplete: (data: { saju: SajuResult; ai: AIResult; basic: any }) => void;
}

export default function SajuFormFinal({ onComplete }: SajuFormFinalProps) {
    // Form State
    const [form, setForm] = useState<{
        year: number;
        month: number;
        day: number;
        calendar: 'solar' | 'lunar';
        gender: 'M' | 'F' | null;
        sijin: string | null;
        region: string;
    }>({
        year: 1990,
        month: 1,
        day: 1,
        calendar: "solar",
        gender: null,
        sijin: null,
        region: "",
    });

    const [sheet, setSheet] = useState<'year' | 'month' | 'day' | null>(null);
    const [loading, setLoading] = useState(false);

    // Initial Load Animation
    const [loaded, setLoaded] = useState(false);
    useEffect(() => { setLoaded(true); }, []);

    // Validation
    const isValid = form.gender !== null && form.sijin !== null;
    const missing = [];
    if (!form.gender) missing.push("성별");
    if (!form.sijin) missing.push("태어난 시간");

    // Sheet Options
    const getSheetItems = (type: 'year' | 'month' | 'day') => {
        if (type === "year") return Array.from({ length: 106 }, (_, i) => ({ value: 2025 - i, label: `${2025 - i}년` }));
        if (type === "month") return Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}월` }));
        if (type === "day") {
            const max = getDaysInMonth(form.year, form.month);
            return Array.from({ length: max }, (_, i) => ({ value: i + 1, label: `${i + 1}일` }));
        }
        return [];
    };

    // Style Helpers
    const getCardStyle = (isActive: boolean) => ({
        background: isActive ? "rgba(168,85,247,0.08)" : "#27272a",
        border: isActive ? "1.5px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isActive ? "0 0 16px rgba(168,85,247,0.1)" : "none",
        color: isActive ? "#a855f7" : "#52525b"
    });

    const handleSubmit = async () => {
        if (!isValid) return;
        setLoading(true);

        try {
            await new Promise(r => setTimeout(r, 800)); // Simulate think time

            // Convert sijin key to hour number (approximate middle of the sijin)
            const sijinMap: Record<string, number> = {
                'ja': 0, 'chuk': 2, 'in': 4, 'myo': 6, 'jin': 8, 'sa': 10,
                'oh': 12, 'mi': 14, 'shin': 16, 'yu': 18, 'sul': 20, 'hae': 22, 'unknown': 12
            };
            const hour = sijinMap[form.sijin || 'unknown'];

            // REAL ENGINE CALCULATION
            const sajuResult = calculateSaju(
                form.year, form.month, form.day, hour, 30,
                form.gender || 'M',
                form.calendar === 'lunar' ? 'lunar' : 'solar'
            );

            // Mock AI Result (for now, until connected to real AI)
            const aiResult: AIResult = {
                headline: sajuResult.interpretation.dominanceMsg,
                threeLineSummary: ['강인한 의지', '새로운 시작', '리더십'],
                personality: sajuResult.interpretation.personalityKeywords.join(', '),
                career: '주도적인 업무가 적합합니다.',
                relationship: '솔직하고 담백한 관계를 선호합니다.',
                health: '스트레스 관리에 유의하세요.',
                yearFortune2026: '새로운 기회를 잡으세요.',
                luckyItems: { color: 'Black', number: 1, direction: 'North' },
                advice: '자신의 직관을 믿고 나아가세요.'
            };

            onComplete({
                saju: sajuResult,
                ai: aiResult,
                basic: {
                    year: form.year, month: form.month, day: form.day,
                    hour, minute: 30, gender: form.gender!,
                    calendarType: form.calendar, birthPlace: form.region
                }
            });

        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[480px] mx-auto pb-10 px-1"
        >
            {/* 1. Date Section */}
            <section className="mt-4 relative z-10">
                <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[16px] font-bold text-zinc-100">생년월일</span>
                    {/* Toggle */}
                    <div className="flex h-7 bg-zinc-800 rounded-full p-0.5 border border-white/5">
                        {(['solar', 'lunar'] as const).map(c => (
                            <button
                                key={c}
                                onClick={() => setForm(p => ({ ...p, calendar: c }))}
                                className={`
                                    h-full px-3 rounded-full text-[11px] font-medium transition-all
                                    ${form.calendar === c ? 'bg-purple-600 text-white shadow-sm' : 'bg-transparent text-zinc-500 hover:text-zinc-300'}
                                `}
                            >
                                {c === "solar" ? "☀️ 양력" : "🌙 음력"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cards */}
                <div className="flex gap-2">
                    {[
                        { type: "year", flex: 1.4, label: "년", value: form.year },
                        { type: "month", flex: 1, label: "월", value: form.month },
                        { type: "day", flex: 1, label: "일", value: form.day },
                    ].map((p) => {
                        const style = getCardStyle(sheet === p.type);
                        return (
                            <div
                                key={p.type}
                                onClick={() => setSheet(p.type as any)}
                                style={{ flex: p.flex, ...style }}
                                className="h-[68px] rounded-2xl cursor-pointer p-3.5 flex flex-col justify-between transition-all duration-200"
                            >
                                <span className="text-[10px] font-medium" style={{ color: style.color }}>{p.label}</span>
                                <div className="flex justify-between items-center">
                                    <span className="text-[22px] font-bold text-zinc-50 leading-none">{p.value}</span>
                                    <span className={`text-[12px] text-zinc-600 transition-transform duration-200 ${sheet === p.type ? 'rotate-180 text-purple-500' : ''}`}>▼</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 2. Gender Section */}
            <section className="mt-5 relative z-10">
                <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="text-[16px] font-bold text-zinc-100">성별</span>
                    {form.gender && <span className="text-purple-500 text-[14px]">✓</span>}
                </div>
                <div className="flex gap-2">
                    {[
                        { k: "M", e: "👨", l: "남성" },
                        { k: "F", e: "👩", l: "여성" }
                    ].map(g => {
                        const isActive = form.gender === g.k;
                        return (
                            <div
                                key={g.k}
                                onClick={() => setForm(p => ({ ...p, gender: g.k as any }))}
                                className={`
                                    flex-1 h-[52px] rounded-[14px] cursor-pointer flex items-center justify-center gap-2 transition-all duration-200
                                    ${isActive
                                        ? "bg-purple-500/10 border-[1.5px] border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.08)]"
                                        : "bg-zinc-800 border border-white/5 hover:bg-zinc-700"}
                                `}
                            >
                                <span className="text-[18px]">{g.e}</span>
                                <span className={`text-[14px] font-bold ${isActive ? "text-zinc-50" : "text-zinc-400"}`}>{g.l}</span>
                                {isActive && <span className="text-purple-500 text-[12px] ml-1">✓</span>}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 3. Time Section */}
            <section className="mt-5 relative z-10">
                <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[16px] font-bold text-zinc-100">태어난 시간</span>
                        {form.sijin && <span className="text-purple-500 text-[14px]">✓</span>}
                    </div>
                    <span className="text-[11px] text-zinc-500 italic">정확하지 않아도 괜찮아요</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                    {SIJIN.map(s => {
                        const isActive = form.sijin === s.key;
                        return (
                            <div
                                key={s.key}
                                onClick={() => setForm(p => ({ ...p, sijin: s.key }))}
                                className={`
                                    h-[50px] rounded-[11px] cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all duration-150
                                    ${isActive
                                        ? "bg-purple-500/10 border-[1.5px] border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.08)]"
                                        : "bg-zinc-800 border border-white/5 hover:bg-zinc-700"}
                                `}
                            >
                                <span className={`text-[12px] font-bold ${isActive ? "text-zinc-50" : "text-zinc-300"}`}>{s.name} {s.hanja}</span>
                                <span className={`text-[9px] ${isActive ? "text-purple-300" : "text-zinc-500"}`}>{s.time}</span>
                            </div>
                        );
                    })}
                </div>
                {/* Unknown */}
                <div
                    onClick={() => setForm(p => ({ ...p, sijin: "unknown" }))}
                    className={`
                        mt-1.5 h-[40px] rounded-[11px] cursor-pointer flex items-center justify-center transition-all duration-150
                        ${form.sijin === "unknown"
                            ? "bg-purple-500/10 border-[1.5px] border-purple-500/40 text-purple-300"
                            : "bg-transparent border border-dashed border-white/10 text-zinc-500 hover:bg-white/5"}
                    `}
                >
                    <span className="text-[12px]">🤷 모름 · 시간 미상</span>
                </div>
            </section>

            {/* 4. Region Section */}
            <section className="mt-5 relative z-10">
                <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="text-[16px] font-bold text-zinc-100">출생 지역</span>
                    <span className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">선택</span>
                </div>
                <div className="relative group">
                    <input
                        value={form.region}
                        onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                        placeholder="서울, 부산, 대구..."
                        className="w-full h-[48px] bg-zinc-800 border border-white/5 rounded-2xl px-3.5 text-[14px] text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/40 transition-all"
                    />
                </div>
                <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                    {CITIES.map(c => (
                        <button
                            key={c}
                            onClick={() => setForm(p => ({ ...p, region: c }))}
                            className={`
                                h-[30px] px-3 rounded-full text-[12px] whitespace-nowrap flex-shrink-0 transition-colors
                                ${form.region === c
                                    ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                                    : "bg-zinc-800 text-zinc-400 border border-white/5 hover:bg-zinc-700"}
                            `}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </section>

            {/* 5. CTA */}
            <section className="mt-6 relative z-10 w-full">
                <button
                    onClick={handleSubmit}
                    disabled={!isValid || loading}
                    className={`
                        w-full h-[54px] rounded-2xl font-bold text-[16px] transition-all relative overflow-hidden
                        ${isValid
                            ? "bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white shadow-[0_4px_20px_rgba(168,85,247,0.3)]"
                            : "bg-zinc-800 border border-white/5 text-zinc-600 cursor-default"}
                    `}
                >
                    {loading ? (
                        <span className="animate-spin text-xl inline-block">🔮</span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            ✨ 운세 보기
                        </span>
                    )}
                    {isValid && !loading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    )}
                </button>
                {missing.length > 0 && (
                    <p className="text-center text-[11px] text-amber-500 mt-2">
                        * {missing.join(" · ")}을(를) 선택해주세요
                    </p>
                )}
            </section>

            {/* NFT Banner */}
            <div className="mt-3 mb-8 h-[52px] rounded-2xl bg-[#18181b] border border-white/5 px-4 flex items-center cursor-pointer relative z-10 hover:bg-zinc-800/80 transition-colors">
                <span className="text-[18px] mr-2.5">💎</span>
                <div className="flex-1">
                    <div className="text-[13px] font-bold text-zinc-200">NFT 영구 소장</div>
                    <div className="text-[10px] text-zinc-500">블록체인에 당신의 운명을 기록하세요</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </div>

            {/* Bottom Sheet */}
            {sheet && (
                <BottomSheetPortal
                    isOpen={!!sheet}
                    onClose={() => setSheet(null)}
                    title={sheet === "year" ? "연도 선택" : sheet === "month" ? "월 선택" : "일 선택"}
                    selectedValue={form[sheet]}
                    items={getSheetItems(sheet).map(i => ({ value: i.value, label: i.label }))}
                    onConfirm={(val) => {
                        setForm(p => {
                            const next = { ...p, [sheet]: val };
                            // Fix day overflow if month changed
                            if (sheet === "month" || sheet === "year") {
                                const maxD = getDaysInMonth(sheet === "year" ? val : p.year, sheet === "month" ? val : p.month);
                                if (next.day > maxD) next.day = maxD;
                            }
                            return next;
                        });
                        setSheet(null);
                    }}
                />
            )}
        </motion.div>
    );
}
