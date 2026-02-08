'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { useSajuStore } from '@/lib/store';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { calculateSaju } from "@/lib/saju-engine";
import { SajuData } from "@/types";
import ShareCard from '@/components/share/ShareCard';
import { mintSajuNFT } from "@/lib/solana/mintSajuNFT";
import { SajuBrain } from "@/lib/saju-brain/saju-brain";
import ShinSalCard from './ShinSalCard';

/* ─────────── 데이터 ─────────── */
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

const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

/* ─────────── 오행 색상 ─────────── */
const E_COLOR: Record<string, string> = {
    목: "#22c55e", 화: "#ef4444", 토: "#eab308", 금: "#e2e8f0", 수: "#3b82f6",
    Wood: "#22c55e", Fire: "#ef4444", Earth: "#eab308", Metal: "#e2e8f0", Water: "#3b82f6",
    wood: "#22c55e", fire: "#ef4444", earth: "#eab308", metal: "#e2e8f0", water: "#3b82f6",
    나무: "#22c55e", 불: "#ef4444", 흙: "#eab308", 쇠: "#e2e8f0", 물: "#3b82f6",
    "목(木)": "#22c55e", "화(火)": "#ef4444", "토(土)": "#eab308", "금(金)": "#e2e8f0", "수(水)": "#3b82f6"
};
const E_EMOJI: Record<string, string> = {
    목: "🌳", 화: "🔥", 토: "⛰️", 금: "⚔️", 수: "💧",
    Wood: "🌳", Fire: "🔥", Earth: "⛰️", Metal: "⚔️", Water: "💧",
    wood: "🌳", fire: "🔥", earth: "⛰️", metal: "⚔️", water: "💧",
    나무: "🌳", 불: "🔥", 흙: "⛰️", 쇠: "⚔️", 물: "💧",
    "목(木)": "🌳", "화(火)": "🔥", "토(土)": "⛰️", "금(金)": "⚔️", "수(水)": "💧"
};

/* ─────────── 60갑자 매핑 ─────────── */
const GAN_NAMES: Record<string, string> = {
    '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
    '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계'
};
const ZHI_NAMES: Record<string, string> = {
    '子': '자(쥐)', '丑': '축(소)', '寅': '인(호랑이)', '卯': '묘(토끼)', '辰': '진(용)', '巳': '사(뱀)',
    '午': '오(말)', '未': '미(양)', '申': '신(원숭이)', '酉': '유(닭)', '戌': '술(개)', '亥': '해(돼지)'
};

/* ─────────── 사주 계산 어댑터 (Real Engine) ─────────── */
function calcSajuReal(y: number, m: number, d: number, sijinKey: string | null, gender: string) {
    // 1. Call Real Engine
    const birthTime = sijinKey && sijinKey !== 'unknown'
        ? SIJIN.find(s => s.key === sijinKey)?.time.split('~')[0].trim() || "12:00"
        : "12:00";
    const [hStr, mStr] = birthTime.split(':');
    const hour = parseInt(hStr, 10) || 12;
    const minute = parseInt(mStr, 10) || 0;

    const data = calculateSaju(
        y, m, d, hour, minute,
        gender === 'male' ? 'male' : 'female',
        'solar'
    );

    // Construct valid SajuData for ShareCard/Store
    const sajuData: SajuData = {
        birthDate: `${y}-${m}-${d}`,
        birthTime: birthTime,
        gender: gender as 'male' | 'female',
        fourPillars: {
            year: data.fourPillars.year,
            month: data.fourPillars.month,
            day: data.fourPillars.day,
            hour: data.fourPillars.hour
        },
        dayMaster: data.dayMaster,
        fiveElements: data.fiveElements,
        aiResult: {
            headline: data.interpretation.dominanceMsg,
            threeLineSummary: data.interpretation.personalityKeywords,
            personality: "", career: "", relationship: "", health: "",
            yearFortune2026: "", luckyItems: { color: "", number: 0, direction: "" }, advice: ""
        },
        sajuInterpretation: {
            dominanceMsg: data.interpretation.dominanceMsg,
            personalityKeywords: data.interpretation.personalityKeywords
        },
        daewoon: data.daewoon ? {
            startAge: data.daewoon.startAge,
            cycles: data.daewoon.cycles.map(c => ({
                startAge: c.startAge,
                endAge: c.endAge,
                ganZhi: c.ganZhi,
                tenGod: c.tenGod,
                unseong: c.unseong
            }))
        } : undefined
    };

    const mapPillar = (p: any, type: string) => ({
        stem: p.heavenlyStem,
        stemName: GAN_NAMES[p.heavenlyStem] || "천간",
        stemElement: p.element || "목",
        branch: p.earthlyBranch,
        branchName: ZHI_NAMES[p.earthlyBranch] || "지지",
        branchElement: "토",
        tenGod: p.tenGod || "", // "비견/편재" form
        unseong: p.unseong || "" // "장생" form
    });

    // ... (skip down to PillarCard)

    const PillarCard = ({ label, data, isMe }: any) => {
        const stemColor = E_COLOR[data.stemElement] || '#71717a';
        const branchColor = E_COLOR[data.branchElement] || '#71717a';
        const [stemTenGod, branchTenGod] = (data.tenGod || "/").split("/");

        return (
            <div style={{
                background: isMe ? "rgba(168,85,247,0.08)" : "#27272a",
                border: isMe ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, padding: "10px 4px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                position: "relative",
            }}>
                {isMe && <div style={{
                    position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                    background: "#7c3aed", color: "#fff", fontSize: 9, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 8, whiteSpace: "nowrap", zIndex: 10
                }}>★ 나</div>}

                {/* 라벨 (시주/일주...) */}
                <div style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", marginTop: isMe ? 6 : 2 }}>{label}</div>

                {/* 천간 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, width: "100%" }}>
                    {/* 천간 십신 */}
                    <div style={{ fontSize: 9, color: "#a1a1aa", height: 12, overflow: "visible", whiteSpace: "nowrap" }}>{stemTenGod}</div>

                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: `${stemColor}15`,
                        border: `1.5px solid ${stemColor}40`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                    }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: stemColor, lineHeight: 1 }}>{data.stem}</span>
                        <span style={{ fontSize: 8, color: stemColor, opacity: 0.8 }}>{data.stemElement}</span>
                    </div>
                    {/* 천간 이름 */}
                    <span style={{ fontSize: 9, color: "#52525b" }}>{data.stemName}</span>
                </div>

                <div style={{ width: "80%", height: 1, background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />

                {/* 지지 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, width: "100%" }}>
                    {/* 지지 십신 */}
                    <div style={{ fontSize: 9, color: "#a1a1aa", height: 12, overflow: "visible", whiteSpace: "nowrap" }}>{branchTenGod}</div>

                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: `${branchColor}15`,
                        border: `1.5px solid ${branchColor}40`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                    }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: branchColor, lineHeight: 1 }}>{data.branch}</span>
                        <span style={{ fontSize: 8, color: branchColor, opacity: 0.8 }}>{data.branchElement}</span>
                    </div>
                    {/* 지지 이름 + 12운성 */}
                    <span style={{ fontSize: 9, color: "#52525b" }}>{data.branchName}</span>
                    <div style={{
                        fontSize: 9, fontWeight: 600, color: "#e4e4e7",
                        marginTop: 2, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.1)"
                    }}>{data.unseong}</div>
                </div>
            </div>
        )
    };

    const pillars = {
        year: mapPillar(data.fourPillars.year, 'year'),
        month: mapPillar(data.fourPillars.month, 'month'),
        day: mapPillar(data.fourPillars.day, 'day'),
        hour: mapPillar(data.fourPillars.hour, 'hour'),
    };

    // Fix branch elements manually as mapPillar above was simplified
    const ZHI_ELS: Record<string, string> = {
        '子': '수', '亥': '수', '寅': '목', '卯': '목', '巳': '화', '午': '화', '申': '금', '酉': '금', '辰': '토', '戌': '토', '丑': '토', '未': '토'
    };
    pillars.year.branchElement = ZHI_ELS[data.fourPillars.year.earthlyBranch] || '토';
    pillars.month.branchElement = ZHI_ELS[data.fourPillars.month.earthlyBranch] || '토';
    pillars.day.branchElement = ZHI_ELS[data.fourPillars.day.earthlyBranch] || '토';
    pillars.hour.branchElement = ZHI_ELS[data.fourPillars.hour.earthlyBranch] || '토';

    // Counts
    const counts: any = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    if (data.fiveElements?.scores) {
        counts['목'] = data.fiveElements.scores.wood;
        counts['화'] = data.fiveElements.scores.fire;
        counts['토'] = data.fiveElements.scores.earth;
        counts['금'] = data.fiveElements.scores.metal;
        counts['수'] = data.fiveElements.scores.water;
    }

    // Generate Lucky Items based on Dominant Element (Deterministic)
    const domEl = data.fiveElements?.dominant || 'Wood';
    const luckyMap: Record<string, any> = {
        'Tree': { color: 'Green', hex: '#22c55e', number: 3, direction: 'East' },
        'Fire': { color: 'Red', hex: '#ef4444', number: 7, direction: 'South' },
        'Earth': { color: 'Yellow', hex: '#eab308', number: 5, direction: 'Center' },
        'Metal': { color: 'White', hex: '#e2e8f0', number: 9, direction: 'West' },
        'Water': { color: 'Black', hex: '#3b82f6', number: 1, direction: 'North' },
        'Unknown': { color: 'Purple', hex: '#a855f7', number: 8, direction: 'North' } // Fallback
    };
    const lucky = luckyMap[domEl] || luckyMap['Unknown'];

    // 6. Dynamic Interpretation Logic
    const weakEl = data?.fiveElements?.lacking || 'Water';

    const ADVICE_DB: any = {
        'Tree': {
            career: { title: "창의와 기획", keywords: ["기획", "교육", "예술"], desc: "새로운 것을 시작하고 뻗어나가는 기운이 강합니다." },
            health: { organs: ["간", "담낭", "신경계"], activities: ["산림욕", "스트레칭"] }
        },
        'Fire': {
            career: { title: "표현과 열정", keywords: ["방송", "예술", "영업"], desc: "자신을 드러내고 확산시키는 에너지가 넘칩니다." },
            health: { organs: ["심장", "소장", "시력"], activities: ["유산소 운동", "명상"] }
        },
        'Earth': {
            career: { title: "신뢰와 중재", keywords: ["부동산", "총무", "농업"], desc: "포용력과 안정을 추구하는 리더십이 있습니다." },
            health: { organs: ["위장", "비장", "소화기"], activities: ["맨발 걷기", "규칙적 식사"] }
        },
        'Metal': {
            career: { title: "결단과 원칙", keywords: ["금융", "군검경", "기술"], desc: "정확하고 맺고 끊음이 확실한 분야가 어울립니다." },
            health: { organs: ["폐", "대장", "피부"], activities: ["등산", "피부 보습"] }
        },
        'Water': {
            career: { title: "지혜와 유연", keywords: ["유통", "무역", "연구"], desc: "지혜롭고 상황 대처 능력이 뛰어나 흐르는 물과 같습니다." },
            health: { organs: ["신장", "방광", "생식기"], activities: ["반신욕", "수영"] }
        },
        'Unknown': { // Fallback
            career: { title: "다재다능", keywords: ["자유업", "프리랜서"], desc: "다양한 분야에 적응력이 뛰어납니다." },
            health: { organs: ["전반적 관리"], activities: ["종합 검진"] }
        }
    };

    const myAdv = ADVICE_DB[domEl] || ADVICE_DB['Unknown'];
    const weakAdv = ADVICE_DB[weakEl] || ADVICE_DB['Unknown'];

    // 7. Saju Brain (Backend Intelligence)
    const soulmate = SajuBrain.findSoulmate(sajuData);

    const dayEl = pillars.day.stemElement;
    const elColorKey = dayEl === 'Wood' ? '목' : dayEl === 'Fire' ? '화' : dayEl === 'Earth' ? '토' : dayEl === 'Metal' ? '금' : dayEl === 'Water' ? '수' : dayEl;

    // Day Master
    const dmHanja = data.fourPillars.day.heavenlyStem;
    const dmName = data.dayMaster?.split('(')[0] || "일간";

    return {
        pillars,
        elementBalance: counts,
        dayMaster: { name: dmName, hanja: dmHanja, element: elColorKey },
        keywords: data.interpretation.personalityKeywords || ["강인한 의지", "새로운 시작"],
        summary: data.interpretation.dominanceMsg || "운명의 흐름이 당신을 기다립니다.",
        lucky: {
            color: lucky.color,
            hex: lucky.hex,
            number: lucky.number,
            direction: lucky.direction
        },
        animal: "띠",
        score: 85,
        fortune: {
            overall: {
                score: 85,
                title: "당신의 타고난 기운",
                detail: `${data.interpretation.dominanceMsg} 특히 ${myAdv.career.desc}`
            },
            career: {
                score: 75 + Math.floor(Math.random() * 20),
                title: myAdv.career.title,
                dos: myAdv.career.keywords,
                donts: ["과도한 고집", "성급한 결정"]
            },
            love: {
                score: 70 + Math.floor(Math.random() * 20),
                title: "애정운",
                idealMatch: `나의 부족한 ${data.fiveElements?.lacking} 기운을 채워주는 사람`
            },
            health: {
                score: 60 + Math.floor(Math.random() * 30),
                title: "건강 관리",
                organs: weakAdv.health.organs,
                activities: weakAdv.health.activities
            },
        },
        rawData: sajuData // Return raw engine data for ShareCard / NFT
    };
}

/* ═══════════════════════════════════════
   BottomSheet 컴포넌트
   ═══════════════════════════════════════ */
function BottomSheet({ type, currentValue, onConfirm, onClose, year, month }: any) {
    const [temp, setTemp] = useState(currentValue);
    const listRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    const items = (() => {
        if (type === "year") return Array.from({ length: 106 }, (_, i) => ({ v: 2025 - i, l: `${2025 - i}년` }));
        if (type === "month") return Array.from({ length: 12 }, (_, i) => ({ v: i + 1, l: `${i + 1}월` }));
        if (type === "day") { const max = getDaysInMonth(year, month); return Array.from({ length: max }, (_, i) => ({ v: i + 1, l: `${i + 1}일` })); }
        return [];
    })();

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    useEffect(() => {
        if (visible && listRef.current) {
            const el = listRef.current.querySelector('[data-sel="true"]');
            if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
        }
    }, [visible]);

    const close = () => { setVisible(false); setTimeout(onClose, 250); };
    const confirm = () => { setVisible(false); setTimeout(() => onConfirm(temp), 250); };

    const title = type === "year" ? "연도 선택" : type === "month" ? "월 선택" : "일 선택";

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000 }}>
            {/* overlay */}
            <div onClick={close} style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                opacity: visible ? 1 : 0,
                transition: "opacity 0.3s ease",
            }} />
            {/* sheet */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "#18181b",
                borderRadius: "20px 20px 0 0",
                maxHeight: "50vh",
                display: "flex", flexDirection: "column",
                transform: visible ? "translateY(0)" : "translateY(100%)",
                transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)",
            }}>
                {/* handle */}
                <div style={{ width: 36, height: 4, background: "#3f3f46", borderRadius: 2, margin: "10px auto 0" }} />
                {/* header */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 20px 10px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: "#fafafa" }}>{title}</span>
                    <button onClick={confirm} style={{
                        background: "none", border: "none", color: "#a855f7",
                        fontSize: 15, fontWeight: 700, cursor: "pointer",
                        padding: "8px 12px", minHeight: 44,
                    }}>완료</button>
                </div>
                {/* list */}
                <div ref={listRef} style={{
                    flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain", padding: "4px 0",
                }}>
                    {items.map(it => (
                        <div key={it.v} data-sel={temp === it.v ? "true" : "false"} onClick={() => setTemp(it.v)}
                            style={{
                                height: 48, display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer",
                                fontSize: temp === it.v ? 20 : 16,
                                fontWeight: temp === it.v ? 700 : 400,
                                color: temp === it.v ? "#fff" : "#71717a",
                                background: temp === it.v ? "rgba(168,85,247,0.1)" : "transparent",
                                borderLeft: temp === it.v ? "3px solid #a855f7" : "3px solid transparent",
                                transition: "all 0.15s",
                            }}>{it.l}</div>
                    ))}
                </div>
                <div style={{ height: 20, flexShrink: 0 }} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   ResultPage 컴포넌트
   ═══════════════════════════════════════ */
/* ═══════════════════════════════════════
   ResultPage 컴포넌트
   ═══════════════════════════════════════ */
function ResultPage({ form, result, onBack, router, onShare, isSharing, onMint, isMinting }: any) {
    const [tab, setTab] = useState("overall");
    // Smooth Score Animation
    const springScore = useSpring(0, { stiffness: 45, damping: 15, mass: 1.2 });
    const roundedScore = useTransform(springScore, (latest) => Math.round(latest));

    const dm = result.dayMaster;
    // Safe check for E_COLOR
    const elColor = E_COLOR[dm.element] || "#a1a1aa";

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
    ];
    const fort = result.fortune[tab];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const PillarCard = ({ label, data, isMe }: any) => {
        const stemColor = E_COLOR[data.stemElement] || '#71717a';
        const branchColor = E_COLOR[data.branchElement] || '#71717a';

        return (
            <div style={{
                background: isMe ? "rgba(168,85,247,0.08)" : "#27272a",
                border: isMe ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, padding: "10px 6px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                position: "relative",
            }}>
                {isMe && <div style={{
                    position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                    background: "#7c3aed", color: "#fff", fontSize: 9, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 8, whiteSpace: "nowrap", zIndex: 10
                }}>★ 나</div>}
                <div style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", marginTop: isMe ? 6 : 2, marginBottom: 4 }}>{label}</div>

                {/* 천간 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontSize: 9, color: "#52525b" }}>천간</span>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `${stemColor}15`,
                        border: `1.5px solid ${stemColor}40`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                        marginBottom: 1
                    }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: stemColor, lineHeight: 1 }}>{data.stem}</span>
                        <span style={{ fontSize: 9, color: stemColor, opacity: 0.8 }}>{data.stemElement}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "#a1a1aa" }}>{data.stemName}</span>
                </div>

                <div style={{ width: "80%", height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />

                {/* 지지 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontSize: 9, color: "#52525b" }}>지지</span>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `${branchColor}15`,
                        border: `1.5px solid ${branchColor}40`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                        marginBottom: 1
                    }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: branchColor, lineHeight: 1 }}>{data.branch}</span>
                        <span style={{ fontSize: 9, color: branchColor, opacity: 0.8 }}>{data.branchElement}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "#a1a1aa" }}>{data.branchName}</span>
                </div>
            </div>
        )
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa", paddingBottom: 60 }}
        >
            {/* 상단 보라 그라데이션 */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 300,
                background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 70%)",
                pointerEvents: "none"
            }} />

            {/* 네비바 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", position: "relative", zIndex: 1 }}>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack} style={{
                        background: "none", border: "none", color: "#a1a1aa", fontSize: 14,
                        cursor: "pointer", padding: "10px 4px", display: "flex", alignItems: "center", gap: 4
                    }}>← 다시 입력하기</motion.button>
            </div>

            <div style={{ padding: "0 20px", position: "relative", zIndex: 1 }}>
                {/* 히어로 */}
                <motion.div variants={item} style={{ textAlign: "center", marginBottom: 24 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
                        <span style={{ background: "linear-gradient(135deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>사주 분석 결과</span>
                    </h1>
                    <p style={{ fontSize: 13, color: "#71717a", margin: "6px 0 0" }}>
                        {form.year}년 {form.month}월 {form.day}일 · {form.calendar === "solar" ? "양력" : "음력"}
                    </p>
                    {/* 일간 뱃지 */}
                    <div style={{
                        width: 72, height: 72, borderRadius: "50%", margin: "16px auto 8px",
                        background: `${elColor}18`, border: `2px solid ${elColor}`,
                        boxShadow: `0 0 24px ${elColor}30`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                    }}>
                        <span style={{ fontSize: 26, fontWeight: 800, color: elColor, lineHeight: 1 }}>{dm.hanja}</span>
                        <span style={{ fontSize: 10, color: elColor, opacity: 0.7 }}>{dm.element}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#a1a1aa" }}>{dm.name}</div>
                    {/* 키워드 */}
                    <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
                        {result.keywords.map((k: string, i: number) => (
                            <span key={i} style={{
                                padding: "5px 12px", borderRadius: 14, fontSize: 12,
                                background: "rgba(168,85,247,0.08)",
                                border: "1px solid rgba(168,85,247,0.2)",
                                color: "#c084fc",
                            }}>#{k}</span>
                        ))}
                    </div>
                </motion.div>

                {/* 사주 원국 카드 */}
                {/* 사주 원국 카드 */}
                <motion.div variants={item} style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 16, marginBottom: 16 }}>
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14,
                        paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)"
                    }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>사주 원국</span>
                        <span style={{ fontSize: 11, color: "#52525b" }}>四柱八字</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                        <PillarCard label="시주" data={result.pillars.hour} />
                        <PillarCard label="일주" data={result.pillars.day} isMe />
                        <PillarCard label="월주" data={result.pillars.month} />
                        <PillarCard label="년주" data={result.pillars.year} />
                    </div>
                </motion.div>

                {/* 오행 분포 */}
                {/* 오행 분포 */}
                <motion.div variants={item} style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>오행 분포</div>
                    {Object.entries(result.elementBalance).map(([el, cnt]: any) => (
                        <div key={el} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ width: 44, fontSize: 12, color: "#a1a1aa" }}>{E_EMOJI[el] || ''} {el}</span>
                            <div style={{ flex: 1, height: 16, background: "#27272a", borderRadius: 8, overflow: "hidden" }}>
                                <div style={{
                                    height: "100%", borderRadius: 8,
                                    background: E_COLOR[el] || '#555', opacity: 0.6,
                                    width: `${(cnt / Math.max(...Object.values(result.elementBalance) as number[])) * 100}%`,
                                    transition: "width 1s ease-out",
                                }} />
                            </div>
                            <span style={{ width: 16, fontSize: 12, color: "#71717a", textAlign: "right" }}>{cnt}</span>
                        </div>
                    ))}
                </motion.div>

                {/* 대운 흐름 (New Premium Feature) */}
                {result.daewoon && (
                    <motion.div variants={item} style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "16px 0", marginBottom: 16, overflow: "hidden" }}>
                        <div style={{ padding: "0 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>대운 흐름 (10년 주기)</span>
                            <span style={{ fontSize: 11, color: "#71717a" }}>{result.daewoon.startAge}세 시작</span>
                        </div>
                        <div style={{
                            display: "flex", gap: 8, overflowX: "auto", padding: "0 16px",
                            paddingBottom: 4, scrollbarWidth: "none", msOverflowStyle: "none"
                        }}>
                            {/* Current Year for Active Check */}
                            {(() => {
                                const currentYear = new Date().getFullYear();
                                const birthYear = form.year;
                                const age = currentYear - birthYear + 1; // Korean Age approx

                                return result.daewoon.cycles.map((d: any, i: number) => {
                                    const nextStart = result.daewoon.cycles[i + 1]?.startAge || 999;
                                    const isActive = age >= d.startAge && age < nextStart;
                                    const [stemGod, branchGod] = (d.tenGod || "/").split("/");

                                    return (
                                        <div key={i} style={{
                                            minWidth: 72, background: isActive ? "rgba(168,85,247,0.1)" : "#27272a",
                                            border: isActive ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                                            borderRadius: 12, padding: "12px 0",
                                            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                                            flexShrink: 0
                                        }}>
                                            {isActive && (
                                                <div style={{
                                                    fontSize: 9, color: "#a855f7", fontWeight: 700,
                                                    marginBottom: 2
                                                }}>Current</div>
                                            )}
                                            <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#d8b4fe" : "#fafafa" }}>
                                                {d.ganZhi}
                                            </span>
                                            <div style={{ fontSize: 10, color: "#a1a1aa", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                                                <span>{stemGod}</span>
                                                <span>{branchGod}</span>
                                            </div>
                                            <div style={{
                                                marginTop: 4, padding: "2px 6px", borderRadius: 4,
                                                background: isActive ? "#9333ea" : "#3f3f46",
                                                fontSize: 10, fontWeight: 600, color: "#fff"
                                            }}>
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
                    <motion.div variants={item} style={{ background: "#18181b", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 18, padding: 16, marginBottom: 16, position: "relative", overflow: "hidden" }}>
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
                            style={{
                                position: "absolute",
                                top: 0, left: 0, width: "50%", height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.1), transparent)",
                                transform: "skewX(-20deg)",
                                pointerEvents: "none",
                                zIndex: 1
                            }}
                        />
                        <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: "100%",
                            background: "radial-gradient(circle at 90% 10%, rgba(168,85,247,0.15) 0%, transparent 60%)",
                            pointerEvents: "none"
                        }} />
                        <div style={{ fontSize: 13, color: "#a855f7", fontWeight: 700, marginBottom: 4 }}>영혼의 단짝 (Beta)</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{result.soulmate.name}</div>
                                <div style={{ fontSize: 12, color: "#a1a1aa" }}>{result.soulmate.title}</div>
                            </div>
                            <div style={{ fontSize: 40, opacity: 0.2 }}>🤝</div>
                        </div>
                        <div style={{
                            background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px",
                            fontSize: 13, lineHeight: 1.5, color: "#e4e4e7", marginBottom: 12, fontStyle: "italic"
                        }}>
                            "{result.soulmate.quote}"
                        </div>
                        <div style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.4 }}>
                            <span style={{ color: "#d8b4fe", fontWeight: 700 }}>AI 분석:</span> {result.soulmate.connectionMsg}
                        </div>
                    </motion.div>
                )}



                {/* 운세 탭 */}
                <div style={{ background: "#18181b", borderRadius: 14, padding: 3, display: "flex", gap: 2, marginBottom: 10 }}>
                    {tabs.map(t => (
                        <motion.button
                            key={t.k}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTab(t.k)} style={{
                                flex: 1, height: 36, border: "none", borderRadius: 11, cursor: "pointer",
                                fontSize: 12, fontWeight: tab === t.k ? 600 : 400,
                                background: tab === t.k ? "#27272a" : "transparent",
                                color: tab === t.k ? "#fafafa" : "#52525b",
                                transition: "all 0.2s",
                                boxShadow: tab === t.k ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
                            }}>{t.l}</motion.button>
                    ))}
                </div>

                {/* 탭 콘텐츠 */}
                <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 20, marginBottom: 16, minHeight: 180 }}>
                    <div style={{ textAlign: "center", marginBottom: 14 }}>
                        <span style={{ fontSize: 42, fontWeight: 800, color: "#a855f7" }}>
                            <motion.span>{roundedScore}</motion.span>
                        </span>
                        <span style={{ fontSize: 18, color: "#52525b" }}>/100</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, textAlign: "center", marginBottom: 10, lineHeight: 1.5 }}>{fort?.title}</div>
                    {tab === "overall" && <p style={{ fontSize: 13, color: "#a1a1aa", lineHeight: 1.7, textAlign: "center" }}>{fort?.detail}</p>}
                    {tab === "career" && (
                        <div>
                            <div style={{ marginTop: 8 }}>
                                {fort?.dos?.map((d: string, i: number) => <div key={i} style={{ fontSize: 13, color: "#22c55e", marginBottom: 4 }}>✅ {d}</div>)}
                                {fort?.donts?.map((d: string, i: number) => <div key={i} style={{ fontSize: 13, color: "#ef4444", marginBottom: 4 }}>❌ {d}</div>)}
                            </div>
                        </div>
                    )}
                    {tab === "love" && <div style={{ fontSize: 13, color: "#a1a1aa", textAlign: "center" }}>이상적 궁합: {fort?.idealMatch}</div>}
                    {tab === "health" && (
                        <div style={{ fontSize: 13, color: "#a1a1aa", textAlign: "center" }}>
                            <div>주의 장기: {fort?.organs?.join(", ")}</div>
                            <div style={{ marginTop: 6 }}>추천 활동: {fort?.activities?.join(", ")}</div>
                        </div>
                    )}
                </div>

                {/* Lucky Items */}
                <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🍀 행운의 아이템</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                        {[
                            { icon: <div style={{ width: 36, height: 36, borderRadius: "50%", background: result.lucky.hex, border: "2px solid rgba(255,255,255,0.1)" }} />, label: "COLOR", value: result.lucky.color },
                            { icon: <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(168,85,247,0.1)", border: "1.5px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#a855f7" }}>{result.lucky.number}</div>, label: "NUMBER", value: String(result.lucky.number) },
                            { icon: <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "1.5px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧭</div>, label: "DIRECTION", value: result.lucky.direction },
                        ].map((it, i) => (
                            <div key={i} style={{ background: "#27272a", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                {it.icon}
                                <span style={{ fontSize: 9, color: "#52525b", letterSpacing: "0.05em" }}>{it.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{it.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 도사님 한마디 */}
                <motion.div variants={item} style={{
                    background: "linear-gradient(135deg,rgba(168,85,247,0.06),rgba(59,130,246,0.04))",
                    border: "1px solid rgba(168,85,247,0.12)",
                    borderRadius: 18, padding: "22px 18px", marginBottom: 16,
                    position: "relative", textAlign: "center",
                }}>
                    <div style={{ position: "absolute", top: 8, left: 14, fontSize: 48, color: "rgba(168,85,247,0.08)", lineHeight: 1 }}>"</div>
                    <div style={{ fontSize: 11, color: "#71717a", marginBottom: 8 }}>🔮 도사님의 한마디</div>
                    <p style={{ fontSize: 15, fontStyle: "italic", lineHeight: 1.7, margin: 0, color: "#e4e4e7" }}>
                        "{result.summary}"
                    </p>
                </motion.div>

                {/* 액션 그리드 */}
                {/* 액션 그리드 */}
                <motion.div variants={item} style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 16 }}>
                    {[
                        { e: "🔮", t: "AI 도사님께", s: "심층 상담 시작", accent: true, action: () => router.push('/chat') },
                        { e: "📤", t: isSharing ? "생성 중..." : "인스타 공유", s: "스토리 카드 생성", action: onShare, disabled: isSharing },
                        { e: "💎", t: isMinting ? "민팅 중..." : "NFT 민팅", s: "블록체인에 기록", action: onMint, disabled: isMinting },
                        { e: "🔄", t: "다시 보기", s: "새로운 입력", action: onBack },
                    ].map((b: any, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            onClick={b.action || (() => { })} disabled={b.disabled} style={{
                                height: 64, background: b.accent ? "rgba(168,85,247,0.06)" : "#18181b",
                                border: b.accent ? "1px solid rgba(168,85,247,0.15)" : "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 14, padding: "0 14px", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                                transition: "all 0.2s", color: "#fafafa",
                                opacity: b.disabled ? 0.5 : 1
                            }}>
                            <span style={{ fontSize: 20 }}>{b.e}</span>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.t}</div>
                                <div style={{ fontSize: 10, color: "#71717a" }}>{b.s}</div>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>

                {/* 푸터 */}
                <div style={{ textAlign: "center", padding: "16px 0", color: "#3f3f46", fontSize: 10 }}>
                    SAJUCHAIN AI ENGINE V3.0
                </div>
            </div>
        </motion.div >
    );
}


/* ═══════════════════════════════════════
   메인 App
   ═══════════════════════════════════════ */
export default function SajuAppV3() {
    const router = useRouter(); // Use the hook
    const { setSajuData, addToHistory, user } = useSajuStore();
    const { connection } = useConnection();
    const wallet = useWallet();

    const [view, setView] = useState("input"); // "input" | "result"
    const [form, setForm] = useState({
        year: 1990, month: 1, day: 1,
        calendar: "solar", gender: null as string | null, sijin: null as string | null, region: "",
    });
    const [sheet, setSheet] = useState<"year" | "month" | "day" | null>(null);
    const [result, setResult] = useState<any>(null);
    const [fade, setFade] = useState(false);
    const shareRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isMinting, setIsMinting] = useState(false);

    const isValid = form.gender !== null && form.sijin !== null;
    const missing = [];
    if (!form.gender) missing.push("성별");
    if (!form.sijin) missing.push("태어난 시간");

    const navigate = useCallback((to: string, res?: any) => {
        setFade(true);
        setTimeout(() => {
            if (res) setResult(res);
            setView(to);
            window.scrollTo(0, 0);
            setTimeout(() => setFade(false), 50);
        }, 200);
    }, []);

    const handleSubmit = () => {
        if (!isValid) return;
        // CALL REAL ENGINE ADAPTER
        const res = calcSajuReal(form.year, form.month, form.day, form.sijin, form.gender || 'male');

        // Update Global Store for Chat/Share
        if (res.rawData) {
            setSajuData(res.rawData);
            addToHistory(res.rawData as any); // Save to local history
        }

        navigate("result", res);
    };

    const handleShare = async () => {
        if (!shareRef.current || !result?.rawData) return;
        setIsSharing(true);
        try {
            await new Promise(r => setTimeout(r, 100)); // Wait for render
            const canvas = await html2canvas(shareRef.current, {
                scale: 1, // ShareCard is already high res (1080px wide)
                useCORS: true,
                backgroundColor: '#000'
            });
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `saju-card-${form.year}${form.month}${form.day}.png`;
            a.click();
        } catch (e) {
            console.error(e);
            alert("이미지 생성에 실패했습니다.");
        } finally {
            setIsSharing(false);
        }
    };

    const handleMint = async () => {
        if (!shareRef.current || !result?.rawData) return;
        if (!wallet.connected || !wallet.publicKey) {
            alert("지갑이 연결되어 있지 않습니다. 상단 지갑 버튼을 눌러주세요.");
            return;
        }

        setIsMinting(true);
        try {
            await new Promise(r => setTimeout(r, 100));
            // 1. Generate Image
            const canvas = await html2canvas(shareRef.current, {
                scale: 1,
                useCORS: true,
                backgroundColor: '#000'
            });
            const imageDatasUri = canvas.toDataURL('image/png');

            // 2. Construct Metadata
            const metadata = {
                name: `SajuChain Fortune #${form.year}${form.month}${form.day}`,
                symbol: "SAJU",
                description: `Your Destiny Analysis for ${form.year}-${form.month}-${form.day}. Preserved on-chain by SajuChain.`,
                image: "image.png",
                external_url: "https://sajuchain.com",
                attributes: [
                    { trait_type: "Day Master", value: result.dayMaster.hanja },
                    { trait_type: "Dominant Element", value: result.lucky.color }
                ],
                properties: {
                    category: "image" as const,
                    creators: [{ address: wallet.publicKey.toString(), share: 100 }],
                    files: []
                }
            };

            // 3. Call Mint Logic
            const mintResult = await mintSajuNFT(connection, wallet, metadata, imageDatasUri);
            console.log("Minted:", mintResult);
            alert(`NFT 민팅이 완료되었습니다!\nMint Address: ${mintResult.mintAddress.slice(0, 8)}...`);

        } catch (e) {
            console.error(e);
            alert("NFT 민팅 중 오류가 발생했습니다.");
        } finally {
            setIsMinting(false);
        }
    };

    /* ═══ Render ═══ */
    return (
        <div style={{
            fontFamily: "'Pretendard',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
            background: "#09090b", minHeight: "100vh",
            opacity: fade ? 0 : 1, transition: "opacity 0.2s ease",
            overflowX: "hidden" // Prevent share card from causing spiral
        }}>
            {/* Hidden Share Card */}
            <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
                {result?.rawData && (
                    <ShareCard
                        ref={shareRef}
                        data={result.rawData}
                        type="saju"
                        theme="mystic"
                    />
                )}
            </div>

            <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#09090b;margin:0}
        ::-webkit-scrollbar{width:0;display:none}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .wallet-adapter-button { height: 32px !important; padding: 0 12px !important; font-size: 11px !important; background: #27272a !important; border: 1px solid rgba(255,255,255,0.06) !important; border-radius: 16px !important; color: #a1a1aa !important; font-family: inherit !important; }
        .wallet-adapter-button:not([disabled]):hover { background: #3f3f46 !important; }
       `}</style>

            {view === "result" && result ? (
                <ResultPage
                    form={form}
                    result={result}
                    onBack={() => navigate("input")}
                    router={router}
                    onShare={handleShare}
                    isSharing={isSharing}
                    onMint={handleMint}
                    isMinting={isMinting}
                />
            ) : (
                /* ═══════════════════════════════════════
                   입력 화면
                   ═══════════════════════════════════════ */
                <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", position: "relative" }}>
                    {/* 배경 글로우 */}
                    <div style={{
                        position: "fixed", top: 0, left: 0, right: 0, height: 250,
                        background: "radial-gradient(ellipse at 50% 0%,rgba(168,85,247,0.06) 0%,transparent 70%)",
                        pointerEvents: "none", zIndex: 0
                    }} />

                    {/* 헤더 */}
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "14px 0", position: "relative", zIndex: 1,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 20 }}>🔮</span>
                            <span style={{
                                fontSize: 17, fontWeight: 800,
                                background: "linear-gradient(135deg,#c084fc,#a78bfa)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>디지털 도사</span>
                        </div>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8
                        }}>
                            <button onClick={() => router.push('/dojo')} style={{
                                width: 32, height: 32, borderRadius: 16, border: "none", cursor: "pointer",
                                background: user ? "linear-gradient(135deg, #a855f7, #ec4899)" : "#27272a",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden"
                            }}>
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="User" style={{ width: "100%", height: "100%" }} />
                                ) : (
                                    <span style={{ fontSize: 16 }}>{user ? "🦄" : "👤"}</span>
                                )}
                            </button>
                            <WalletMultiButton />
                        </div>
                    </div>

                    {/* ── 생년월일 ── */}
                    <section style={{ marginTop: 14, position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span style={{ fontSize: 16, fontWeight: 700 }}>생년월일</span>
                            {/* 양력/음력 토글 */}
                            <div style={{ display: "flex", height: 28, background: "#27272a", borderRadius: 14, padding: 2 }}>
                                {["solar", "lunar"].map(c => (
                                    <button key={c} onClick={() => setForm(p => ({ ...p, calendar: c }))}
                                        style={{
                                            height: 24, padding: "0 12px", borderRadius: 12, border: "none", cursor: "pointer",
                                            fontSize: 11, fontWeight: form.calendar === c ? 600 : 400,
                                            background: form.calendar === c ? "#7c3aed" : "transparent",
                                            color: form.calendar === c ? "#fff" : "#71717a",
                                            transition: "all 0.2s",
                                        }}>{c === "solar" ? "☀️ 양력" : "🌙 음력"}</button>
                                ))}
                            </div>
                        </div>

                        {/* 년/월/일 카드 — ★ 이 onClick들이 핵심! ★ */}
                        <div style={{ display: "flex", gap: 8 }}>
                            {[
                                { type: "year", flex: 1.4, label: "년", value: form.year },
                                { type: "month", flex: 1, label: "월", value: form.month },
                                { type: "day", flex: 1, label: "일", value: form.day },
                            ].map((p: any) => (
                                <div key={p.type}
                                    onClick={() => setSheet(p.type)}
                                    style={{
                                        flex: p.flex, height: 68, borderRadius: 14, cursor: "pointer",
                                        background: sheet === p.type ? "rgba(168,85,247,0.08)" : "#27272a",
                                        border: sheet === p.type ? "1.5px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                                        padding: "10px 14px",
                                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                                        transition: "all 0.2s",
                                        boxShadow: sheet === p.type ? "0 0 16px rgba(168,85,247,0.1)" : "none",
                                    }}>
                                    <span style={{ fontSize: 10, color: sheet === p.type ? "#a855f7" : "#52525b", fontWeight: 500, transition: "color 0.2s" }}>{p.label}</span>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: 22, fontWeight: 700, color: "#fafafa" }}>{p.value}</span>
                                        <span style={{ fontSize: 12, color: "#52525b", transition: "transform 0.2s", transform: sheet === p.type ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── 성별 ── */}
                    <section style={{ marginTop: 20, position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                            <span style={{ fontSize: 16, fontWeight: 700 }}>성별</span>
                            {form.gender && <span style={{ color: "#a855f7", fontSize: 14 }}>✓</span>}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {[{ k: "male", e: "👨", l: "남성" }, { k: "female", e: "👩", l: "여성" }].map(g => (
                                <div key={g.k} onClick={() => setForm(p => ({ ...p, gender: g.k }))}
                                    style={{
                                        flex: 1, height: 52, borderRadius: 14, cursor: "pointer",
                                        background: form.gender === g.k ? "rgba(168,85,247,0.1)" : "#27272a",
                                        border: form.gender === g.k ? "1.5px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                        transition: "all 0.2s",
                                        boxShadow: form.gender === g.k ? "0 0 12px rgba(168,85,247,0.08)" : "none",
                                    }}>
                                    {form.gender === g.k && <span style={{ color: "#a855f7", fontSize: 13 }}>✓</span>}
                                    <span style={{ fontSize: 18 }}>{g.e}</span>
                                    <span style={{
                                        fontSize: 14, fontWeight: form.gender === g.k ? 600 : 400,
                                        color: form.gender === g.k ? "#fafafa" : "#a1a1aa", transition: "all 0.2s"
                                    }}>{g.l}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── 태어난 시간 ── */}
                    <section style={{ marginTop: 20, position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 16, fontWeight: 700 }}>태어난 시간</span>
                                {form.sijin && <span style={{ color: "#a855f7", fontSize: 14 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 11, color: "#52525b", fontStyle: "italic" }}>정확하지 않아도 괜찮아요</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                            {SIJIN.map(s => (
                                <div key={s.key} onClick={() => setForm(p => ({ ...p, sijin: s.key }))}
                                    style={{
                                        height: 50, borderRadius: 11, cursor: "pointer",
                                        background: form.sijin === s.key ? "rgba(168,85,247,0.12)" : "#27272a",
                                        border: form.sijin === s.key ? "1.5px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                                        transition: "all 0.15s",
                                        boxShadow: form.sijin === s.key ? "0 0 10px rgba(168,85,247,0.08)" : "none",
                                    }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: form.sijin === s.key ? "#fafafa" : "#e4e4e7" }}>{s.name} {s.hanja}</span>
                                    <span style={{ fontSize: 9, color: form.sijin === s.key ? "#a78bfa" : "#52525b" }}>{s.time}</span>
                                </div>
                            ))}
                        </div>
                        {/* 모름 */}
                        <div onClick={() => setForm(p => ({ ...p, sijin: "unknown" }))}
                            style={{
                                marginTop: 6, height: 40, borderRadius: 11, cursor: "pointer",
                                background: form.sijin === "unknown" ? "rgba(168,85,247,0.12)" : "transparent",
                                border: form.sijin === "unknown" ? "1.5px solid rgba(168,85,247,0.4)" : "1px dashed rgba(255,255,255,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s",
                            }}>
                            <span style={{ fontSize: 12, color: form.sijin === "unknown" ? "#c084fc" : "#52525b" }}>🤷 모름 · 시간 미상</span>
                        </div>
                    </section>

                    {/* ── 출생 지역 ── */}
                    <section style={{ marginTop: 20, position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                            <span style={{ fontSize: 16, fontWeight: 700 }}>출생 지역</span>
                            <span style={{
                                fontSize: 10, color: "#52525b", background: "rgba(255,255,255,0.04)",
                                padding: 2, borderRadius: 4
                            }}>선택</span>
                        </div>
                        <input
                            value={form.region}
                            onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                            placeholder="서울, 부산, 대구..."
                            style={{
                                width: "100%", height: 48, borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)",
                                background: "#27272a", color: "#fafafa", fontSize: 14, padding: "0 14px",
                                outline: "none",
                            }}
                            onFocus={e => { e.target.style.border = "1.5px solid rgba(168,85,247,0.4)"; e.target.style.boxShadow = "0 0 12px rgba(168,85,247,0.08)" }}
                            onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none" }}
                        />
                        <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
                            {CITIES.map(c => (
                                <button key={c} onClick={() => setForm(p => ({ ...p, region: c }))}
                                    style={{
                                        height: 30, padding: "0 12px", borderRadius: 15, border: "none", cursor: "pointer",
                                        background: form.region === c ? "rgba(168,85,247,0.12)" : "#27272a",
                                        color: form.region === c ? "#c084fc" : "#71717a",
                                        fontSize: 12, whiteSpace: "nowrap", flexShrink: 0,
                                        transition: "all 0.15s",
                                    }}>{c}</button>
                            ))}
                        </div>
                    </section>

                    {/* ── CTA ── */}
                    <section style={{ marginTop: 24, position: "relative", zIndex: 1 }}>
                        <button onClick={handleSubmit} disabled={!isValid}
                            style={{
                                width: "100%", height: 54, borderRadius: 16, border: "none", cursor: isValid ? "pointer" : "default",
                                background: isValid
                                    ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                                    : "rgba(168,85,247,0.08)",
                                color: isValid ? "#fff" : "rgba(168,85,247,0.35)",
                                fontSize: 16, fontWeight: 700,
                                boxShadow: isValid ? "0 4px 20px rgba(168,85,247,0.3)" : "none",
                                transition: "all 0.2s",
                                ...(isValid ? {
                                    backgroundSize: "200% 100%",
                                    animation: "shimmer 2.5s infinite linear",
                                    backgroundImage: "linear-gradient(90deg,#7c3aed 0%,#a855f7 30%,#c084fc 50%,#a855f7 70%,#7c3aed 100%)",
                                } : {}),
                            }}>
                            ✨ 운세 보기
                        </button>
                        {missing.length > 0 && (
                            <p style={{ textAlign: "center", fontSize: 11, color: "#f59e0b", marginTop: 8 }}>
                                * {missing.join(" · ")}을(를) 선택해주세요
                            </p>
                        )}
                    </section>

                    {/* ── NFT 배너 ── */}
                    <div style={{
                        marginTop: 12, marginBottom: 32, height: 52, borderRadius: 14,
                        background: "#18181b", border: "1px solid rgba(255,255,255,0.06)",
                        padding: "0 16px", display: "flex", alignItems: "center", cursor: "pointer",
                        position: "relative", zIndex: 1,
                    }}>
                        <div style={{
                            // Wallet Button Container
                        }}>
                            <WalletMultiButton />
                        </div>
                        <span style={{ fontSize: 18 }}>💎</span>
                        <div style={{ marginLeft: 10, flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>NFT 영구 소장</div>
                            <div style={{ fontSize: 10, color: "#52525b" }}>블록체인에 당신의 운명을 기록하세요</div>
                        </div>
                        <span style={{ fontSize: 14, color: "#52525b" }}>›</span>
                    </div>

                    {/* ═══ 바텀시트 ═══ */}
                    {sheet && (
                        <BottomSheet
                            type={sheet}
                            currentValue={form[sheet as "year" | "month" | "day"]}
                            year={form.year}
                            month={form.month}
                            onConfirm={(val: number) => {
                                setForm(p => {
                                    const next = { ...p, [sheet]: val };
                                    // 월 변경 시 일자 보정
                                    if (sheet === "month" || sheet === "year") {
                                        const maxD = getDaysInMonth(
                                            sheet === "year" ? val : p.year,
                                            sheet === "month" ? val : p.month
                                        );
                                        if (next.day > maxD) next.day = maxD;
                                    }
                                    return next;
                                });
                                setSheet(null);
                            }}
                            onClose={() => setSheet(null)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
