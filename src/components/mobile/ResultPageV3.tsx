'use client';

import React, { useState, useEffect } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { E_COLOR, E_EMOJI } from '@/lib/ui-constants';
import ShinSalCard from './ShinSalCard';
import dynamic from 'next/dynamic';
const PremiumUnlockModal = dynamic(() => import('../premium/PremiumUnlockModal'), { ssr: false });
import { useSajuStore } from '@/lib/store';
import { ArrowLeft, Share2, Gem, MessageCircle, RotateCcw } from 'lucide-react';

interface ResultPageProps {
    form: any;
    result: any;
    onBack: () => void;
    router: any;
    onShare: () => void;
    isSharing: boolean;
    onMint: () => void;
    isMinting: boolean;
}

export default function ResultPageV3({ form, result, onBack, router, onShare, isSharing, onMint, isMinting }: ResultPageProps) {
    const { isPremium } = useSajuStore();
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [tab, setTab] = useState("overall");
    const springScore = useSpring(0, { stiffness: 45, damping: 15, mass: 1.2 });
    const roundedScore = useTransform(springScore, (latest) => Math.round(latest));

    const dm = result.dayMaster;
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
        { k: "year", l: "2026년 운세", locked: true },
    ];
    const fort = result.fortune[tab];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const PillarCard = ({ label, data, isMe }: any) => {
        const stemColor = E_COLOR[data.stemElement] || '#71717a';
        const branchColor = E_COLOR[data.branchElement] || '#71717a';

        return (
            <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                style={{
                    background: isMe ? "rgba(168,85,247,0.08)" : "rgba(39,39,42,0.8)",
                    border: isMe ? "1.5px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: "12px 8px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    position: "relative",
                }}
            >
                {isMe && <div style={{
                    position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", fontSize: 9, fontWeight: 700,
                    padding: "2px 10px", borderRadius: 10, whiteSpace: "nowrap", zIndex: 10
                }}>나</div>}
                <div style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", marginTop: isMe ? 6 : 2, marginBottom: 4 }}>{label}</div>

                {/* 천간 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontSize: 9, color: "#52525b" }}>천간</span>
                    <div style={{
                        width: 46, height: 46, borderRadius: 13,
                        background: `${stemColor}12`,
                        border: `1.5px solid ${stemColor}35`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                    }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: stemColor, lineHeight: 1 }}>{data.stem}</span>
                        <span style={{ fontSize: 9, color: stemColor, lineHeight: 1, opacity: 0.7, marginTop: 1 }}>{data.stemElement}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "#a1a1aa" }}>{data.stemName}</span>
                </div>

                <div style={{ width: "80%", height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />

                {/* 지지 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontSize: 9, color: "#52525b" }}>지지</span>
                    <div style={{
                        width: 46, height: 46, borderRadius: 13,
                        background: `${branchColor}12`,
                        border: `1.5px solid ${branchColor}35`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                    }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: branchColor, lineHeight: 1 }}>{data.branch}</span>
                        <span style={{ fontSize: 9, color: branchColor, lineHeight: 1, opacity: 0.7, marginTop: 1 }}>{data.branchElement}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "#a1a1aa" }}>{data.branchName}</span>
                </div>
            </motion.div>
        )
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "#a855f7";
        if (score >= 60) return "#3b82f6";
        if (score >= 40) return "#eab308";
        return "#ef4444";
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa", paddingBottom: 80 }}
        >
            {/* 상단 그라데이션 */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 320,
                background: `radial-gradient(ellipse at 50% 0%, ${elColor}18 0%, transparent 70%)`,
                pointerEvents: "none"
            }} />

            {/* 네비바 */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 20px", position: "relative", zIndex: 1,
                }}
            >
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    style={{
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#a1a1aa", fontSize: 13, borderRadius: 12,
                        cursor: "pointer", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6,
                    }}
                >
                    <ArrowLeft size={14} />
                    다시 입력
                </motion.button>
                <div style={{ fontSize: 12, color: "#52525b" }}>
                    {form.year}.{form.month}.{form.day}
                </div>
            </motion.div>

            <div style={{ padding: "0 20px", position: "relative", zIndex: 1 }}>
                {/* 히어로 */}
                <motion.div variants={item} style={{ textAlign: "center", marginBottom: 28 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
                        <span style={{ background: `linear-gradient(135deg, ${elColor}, #a78bfa, #60a5fa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            사주 분석 결과
                        </span>
                    </h1>
                    <p style={{ fontSize: 12, color: "#71717a", margin: "6px 0 0" }}>
                        {form.year}년 {form.month}월 {form.day}일 · {form.calendar === "solar" ? "양력" : "음력"}
                    </p>
                    {/* 일간 뱃지 */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        style={{
                            width: 76, height: 76, borderRadius: "50%", margin: "18px auto 8px",
                            background: `${elColor}15`, border: `2px solid ${elColor}60`,
                            boxShadow: `0 0 30px ${elColor}25`,
                            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                        }}
                    >
                        <span style={{ fontSize: 28, fontWeight: 800, color: elColor, lineHeight: 1 }}>{dm.hanja}</span>
                        <span style={{ fontSize: 10, color: elColor, opacity: 0.7, marginTop: 2 }}>{dm.element}</span>
                    </motion.div>
                    <div style={{ fontSize: 13, color: "#a1a1aa" }}>{dm.name}</div>
                    {/* 키워드 */}
                    <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
                        {result.keywords.map((k: string, i: number) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                style={{
                                    padding: "5px 14px", borderRadius: 20, fontSize: 12,
                                    background: "rgba(168,85,247,0.06)",
                                    border: "1px solid rgba(168,85,247,0.15)",
                                    color: "#c084fc",
                                }}
                            >
                                #{k}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>

                {/* 사주 원국 카드 */}
                <motion.div variants={item} style={{ background: "rgba(24,24,27,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 16, marginBottom: 16 }}>
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
                <motion.div variants={item} style={{ background: "rgba(24,24,27,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>오행 분포</div>
                    {Object.entries(result.elementBalance).map(([el, cnt]: any) => {
                        const maxVal = Math.max(...Object.values(result.elementBalance) as number[]);
                        return (
                            <div key={el} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <span style={{ width: 44, fontSize: 12, color: "#a1a1aa", display: "flex", alignItems: "center", gap: 4 }}>
                                    <span>{E_EMOJI[el] || ''}</span>
                                    <span>{el}</span>
                                </span>
                                <div style={{ flex: 1, height: 20, background: "#27272a", borderRadius: 10, overflow: "hidden" }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(cnt / maxVal) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                        style={{
                                            height: "100%", borderRadius: 10,
                                            background: `linear-gradient(90deg, ${E_COLOR[el] || '#555'}80, ${E_COLOR[el] || '#555'})`,
                                        }}
                                    />
                                </div>
                                <span style={{ width: 20, fontSize: 12, color: "#71717a", textAlign: "right", fontWeight: 600 }}>{cnt}</span>
                            </div>
                        );
                    })}
                </motion.div>

                {/* 대운 흐름 */}
                {result.daewoon && (
                    <motion.div variants={item} style={{ background: "rgba(24,24,27,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "16px 0", marginBottom: 16, overflow: "hidden" }}>
                        <div style={{ padding: "0 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>대운 흐름</span>
                            <span style={{ fontSize: 11, color: "#71717a" }}>10년 주기 · {result.daewoon.startAge}세 시작</span>
                        </div>
                        <div style={{
                            display: "flex", gap: 8, overflowX: "auto", padding: "0 16px",
                            paddingBottom: 8, scrollbarWidth: "none", msOverflowStyle: "none"
                        }}>
                            {(() => {
                                const currentYear = new Date().getFullYear();
                                const birthYear = form.year;
                                const age = currentYear - birthYear + 1;

                                return result.daewoon.cycles.map((d: any, i: number) => {
                                    const nextStart = result.daewoon.cycles[i + 1]?.startAge || 999;
                                    const isActive = age >= d.startAge && age < nextStart;
                                    const [stemGod, branchGod] = (d.tenGod || "/").split("/");

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            style={{
                                                minWidth: 74, background: isActive ? "rgba(168,85,247,0.1)" : "rgba(39,39,42,0.8)",
                                                border: isActive ? "1.5px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                                                borderRadius: 14, padding: "12px 0",
                                                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                                                flexShrink: 0
                                            }}
                                        >
                                            {isActive && (
                                                <div style={{
                                                    fontSize: 9, color: "#a855f7", fontWeight: 700,
                                                    marginBottom: 2
                                                }}>현재</div>
                                            )}
                                            <span style={{ fontSize: 14, fontWeight: 700, color: isActive ? "#d8b4fe" : "#fafafa" }}>
                                                {d.ganZhi}
                                            </span>
                                            <div style={{ fontSize: 10, color: "#a1a1aa", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <span>{stemGod}</span>
                                                <span>{branchGod}</span>
                                            </div>
                                            <div style={{
                                                marginTop: 4, padding: "2px 8px", borderRadius: 6,
                                                background: isActive ? "linear-gradient(135deg, #7c3aed, #9333ea)" : "#3f3f46",
                                                fontSize: 10, fontWeight: 600, color: "#fff"
                                            }}>
                                                {d.startAge}세~
                                            </div>
                                        </motion.div>
                                    );
                                });
                            })()}
                        </div>
                    </motion.div>
                )}

                {/* 신살 */}
                {result.shinsal && (
                    <motion.div variants={item}>
                        <ShinSalCard data={result.shinsal} />
                    </motion.div>
                )}

                {/* 영혼의 단짝 */}
                {result.soulmate && (
                    <motion.div variants={item} style={{ background: "rgba(24,24,27,0.9)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 20, padding: 18, marginBottom: 16, position: "relative", overflow: "hidden" }}>
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2 }}
                            style={{
                                position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.08), transparent)",
                                transform: "skewX(-20deg)", pointerEvents: "none", zIndex: 1
                            }}
                        />
                        <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: "100%",
                            background: "radial-gradient(circle at 90% 10%, rgba(168,85,247,0.12) 0%, transparent 60%)",
                            pointerEvents: "none"
                        }} />
                        <div style={{ fontSize: 12, color: "#a855f7", fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>영혼의 단짝</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{result.soulmate.name}</div>
                                <div style={{ fontSize: 12, color: "#a1a1aa" }}>{result.soulmate.title}</div>
                            </div>
                            <div style={{ fontSize: 36, opacity: 0.15 }}>🤝</div>
                        </div>
                        <div style={{
                            background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "14px",
                            fontSize: 13, lineHeight: 1.6, color: "#e4e4e7", marginBottom: 12, fontStyle: "italic",
                            borderLeft: "3px solid rgba(168,85,247,0.3)"
                        }}>
                            &ldquo;{result.soulmate.quote}&rdquo;
                        </div>
                        <div style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.5 }}>
                            <span style={{ color: "#d8b4fe", fontWeight: 700 }}>AI 분석:</span> {result.soulmate.connectionMsg}
                        </div>
                    </motion.div>
                )}

                {/* 운세 탭 - 리디자인 */}
                <motion.div variants={item}>
                    <div style={{
                        background: "rgba(24,24,27,0.9)", borderRadius: 16, padding: 4,
                        display: "flex", gap: 2, marginBottom: 12,
                        overflowX: "auto", scrollbarWidth: "none",
                    }}>
                        {tabs.map((t) => {
                            const isActive = tab === t.k;
                            return (
                                <motion.button
                                    key={t.k}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (t.locked && !isPremium) {
                                            setShowPremiumModal(true);
                                        }
                                        setTab(t.k);
                                    }}
                                    style={{
                                        flex: "1 0 auto", minWidth: 0, height: 40, border: "none", borderRadius: 12,
                                        cursor: "pointer", fontSize: 12, fontWeight: isActive ? 700 : 400,
                                        background: isActive ? "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.1))" : "transparent",
                                        color: isActive ? "#fafafa" : "#52525b",
                                        transition: "all 0.2s",
                                        boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)" : "none",
                                        position: "relative", padding: "0 10px",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {t.l}
                                    {t.locked && !isPremium && <span style={{ fontSize: 10 }}>🔒</span>}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* 탭 콘텐츠 */}
                    <div style={{
                        background: "rgba(24,24,27,0.9)", border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 20, padding: 22, marginBottom: 16, minHeight: 180,
                        position: "relative"
                    }}>
                        <div style={{ textAlign: "center", marginBottom: 16 }}>
                            <motion.span
                                key={tab}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{ fontSize: 44, fontWeight: 800, color: getScoreColor(fort?.score || 0) }}
                            >
                                <motion.span>{roundedScore}</motion.span>
                            </motion.span>
                            <span style={{ fontSize: 18, color: "#52525b", marginLeft: 2 }}>/100</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, textAlign: "center", marginBottom: 12, lineHeight: 1.5 }}>{fort?.title}</div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {tab === "overall" && <p style={{ fontSize: 13, color: "#a1a1aa", lineHeight: 1.8, textAlign: "center" }}>{fort?.detail}</p>}
                                {tab === "career" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {fort?.dos?.map((d: string, i: number) => (
                                            <div key={i} style={{ fontSize: 13, color: "#22c55e", display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(34,197,94,0.06)", borderRadius: 10 }}>
                                                <span>✅</span> {d}
                                            </div>
                                        ))}
                                        {fort?.donts?.map((d: string, i: number) => (
                                            <div key={i} style={{ fontSize: 13, color: "#ef4444", display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(239,68,68,0.06)", borderRadius: 10 }}>
                                                <span>❌</span> {d}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {tab === "love" && <div style={{ fontSize: 13, color: "#a1a1aa", textAlign: "center", lineHeight: 1.7 }}>이상적 궁합: <span style={{ color: "#d8b4fe", fontWeight: 600 }}>{fort?.idealMatch}</span></div>}
                                {tab === "health" && (
                                    <div style={{ fontSize: 13, color: "#a1a1aa", textAlign: "center", lineHeight: 1.7 }}>
                                        <div>주의할 곳: <span style={{ color: "#fbbf24" }}>{fort?.organs?.join(", ")}</span></div>
                                        {fort?.activities && <div style={{ marginTop: 8 }}>추천 활동: <span style={{ color: "#22c55e" }}>{fort?.activities?.join(", ")}</span></div>}
                                    </div>
                                )}
                                {tab === "year" && (
                                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#e4e4e7", marginBottom: 14 }}>
                                            2026년 병오년(丙午年) 상세 운세
                                        </div>
                                        {!isPremium ? (
                                            <>
                                                <div style={{ filter: "blur(6px)", userSelect: "none", opacity: 0.4, fontSize: 13, lineHeight: 1.8 }}>
                                                    <p>1월: 새로운 시작을 알리는 기운이 강합니다...</p>
                                                    <p>2월: 재물운이 상승하며 뜻밖의 수익이...</p>
                                                    <p>3월: 인간관계에서 귀인을 만나게 됩...</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowPremiumModal(true)}
                                                    style={{
                                                        marginTop: 16, background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                                                        color: "#fff", border: "none",
                                                        padding: "12px 24px", borderRadius: 14, fontWeight: 700, fontSize: 13,
                                                        boxShadow: "0 4px 15px rgba(147, 51, 234, 0.35)", cursor: "pointer"
                                                    }}
                                                >
                                                    🔒 프리미엄 잠금 해제
                                                </button>
                                            </>
                                        ) : (
                                            <div style={{ fontSize: 13, color: "#d4d4d8", lineHeight: 1.8, textAlign: "left" }}>
                                                <div style={{ marginBottom: 14 }}>
                                                    <strong style={{ color: "#a855f7" }}>[상반기]</strong><br />
                                                    새로운 도전을 하기에 적합한 시기입니다. 직장인이라면 승진 운이 명확하게 들어와 있으며, 사업가는 확장의 기회를 잡을 수 있습니다.
                                                </div>
                                                <div style={{ marginBottom: 14 }}>
                                                    <strong style={{ color: "#3b82f6" }}>[하반기]</strong><br />
                                                    재물 흐름이 안정화되는 시기입니다. 투자했던 곳에서 성과가 나오며, 연애운 또한 상승합니다.
                                                </div>
                                                <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: 12, fontSize: 12, borderLeft: "3px solid #a855f7" }}>
                                                    💡 올해는 변화를 두려워하지 말고 즐기는 것이 개운의 핵심입니다.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* 행운 아이템 */}
                <motion.div variants={item} style={{ background: "rgba(24,24,27,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>행운의 아이템</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                        {[
                            { icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: result.lucky.hex, border: "2px solid rgba(255,255,255,0.15)", boxShadow: `0 0 12px ${result.lucky.hex}40` }} />, label: "색상", value: result.lucky.color },
                            { icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(168,85,247,0.1)", border: "1.5px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: "#a855f7" }}>{result.lucky.number}</div>, label: "숫자", value: String(result.lucky.number) },
                            { icon: <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "1.5px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🧭</div>, label: "방향", value: result.lucky.direction },
                        ].map((it, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -2 }}
                                style={{ background: "rgba(39,39,42,0.8)", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                            >
                                {it.icon}
                                <span style={{ fontSize: 10, color: "#52525b", letterSpacing: "0.05em" }}>{it.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{it.value}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* 도사님 한마디 */}
                <motion.div variants={item} style={{
                    background: "linear-gradient(135deg,rgba(168,85,247,0.06),rgba(59,130,246,0.04))",
                    border: "1px solid rgba(168,85,247,0.12)",
                    borderRadius: 20, padding: "24px 20px", marginBottom: 16,
                    position: "relative", textAlign: "center",
                }}>
                    <div style={{ position: "absolute", top: 10, left: 16, fontSize: 44, color: "rgba(168,85,247,0.06)", lineHeight: 1 }}>&ldquo;</div>
                    <div style={{ fontSize: 11, color: "#71717a", marginBottom: 10, letterSpacing: 1 }}>도사님의 한마디</div>
                    <p style={{ fontSize: 15, fontStyle: "italic", lineHeight: 1.8, margin: 0, color: "#e4e4e7" }}>
                        &ldquo;{result.summary}&rdquo;
                    </p>
                </motion.div>

                {/* 액션 그리드 */}
                <motion.div variants={item} style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
                    {[
                        { icon: <MessageCircle size={18} />, t: "AI 도사님께", s: "심층 상담 시작", accent: true, action: () => router.push('/chat') },
                        { icon: <Share2 size={18} />, t: isSharing ? "생성 중..." : "공유하기", s: "카드 이미지 생성", action: onShare, disabled: isSharing },
                        { icon: <Gem size={18} />, t: isMinting ? "민팅 중..." : "NFT 민팅", s: "블록체인에 기록", action: onMint, disabled: isMinting },
                        { icon: <RotateCcw size={18} />, t: "다시 보기", s: "새로운 분석", action: onBack },
                    ].map((b: any, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ y: -2 }}
                            onClick={b.action || (() => { })}
                            disabled={b.disabled}
                            style={{
                                height: 70, background: b.accent ? "rgba(168,85,247,0.08)" : "rgba(24,24,27,0.9)",
                                border: b.accent ? "1px solid rgba(168,85,247,0.2)" : "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 16, padding: "0 16px", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                                transition: "all 0.2s", color: "#fafafa",
                                opacity: b.disabled ? 0.5 : 1,
                            }}
                        >
                            <span style={{ color: b.accent ? "#a855f7" : "#71717a" }}>{b.icon}</span>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.t}</div>
                                <div style={{ fontSize: 10, color: "#71717a" }}>{b.s}</div>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>

                {/* 푸터 */}
                <div style={{ textAlign: "center", padding: "20px 0", color: "#27272a", fontSize: 10, letterSpacing: 1 }}>
                    SAJUCHAIN AI ENGINE
                </div>

                <PremiumUnlockModal
                    isOpen={showPremiumModal}
                    onClose={() => setShowPremiumModal(false)}
                />
            </div>
        </motion.div>
    );
}
