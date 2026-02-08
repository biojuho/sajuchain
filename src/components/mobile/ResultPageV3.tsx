'use client';

import React, { useState, useEffect } from "react";
import { motion, useSpring, useTransform } from 'framer-motion';
import { E_COLOR, E_EMOJI } from '@/lib/ui-constants';
import ShinSalCard from './ShinSalCard';
// import PremiumUnlockModal from '../premium/PremiumUnlockModal';
import dynamic from 'next/dynamic';
const PremiumUnlockModal = dynamic(() => import('../premium/PremiumUnlockModal'), { ssr: false });
import { useSajuStore } from '@/lib/store';

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
    // Smooth Score Animation
    const springScore = useSpring(0, { stiffness: 45, damping: 15, mass: 1.2 });
    const roundedScore = useTransform(springScore, (latest) => Math.round(latest));

    // Determine Day Master Element Color safely
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
        { k: "year", l: "2025년 상세", locked: true },
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
                        <span style={{ fontSize: 9, color: stemColor, lineHeight: 1, opacity: 0.8 }}>{data.stemElement}</span>
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
                        <span style={{ fontSize: 9, color: branchColor, lineHeight: 1, opacity: 0.8 }}>{data.branchElement}</span>
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
                    {tabs.map((t: any) => (
                        <motion.button
                            key={t.k}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (t.locked && !isPremium) {
                                    setShowPremiumModal(true);
                                    // Optionally allow viewing blurred preview by still setting tab
                                    setTab(t.k);
                                } else {
                                    setTab(t.k);
                                }
                            }} style={{
                                flex: 1, height: 36, border: "none", borderRadius: 11, cursor: "pointer",
                                fontSize: 12, fontWeight: tab === t.k ? 600 : 400,
                                background: tab === t.k ? "#27272a" : "transparent",
                                color: tab === t.k ? "#fafafa" : "#52525b",
                                transition: "all 0.2s",
                                boxShadow: tab === t.k ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
                                position: "relative"
                            }}>
                            {t.l}
                            {t.locked && !isPremium && <span style={{ fontSize: 8, position: "absolute", top: 2, right: 2 }}>🔒</span>}
                        </motion.button>
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
                    {tab === "year" && (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#e4e4e7", marginBottom: 12 }}>
                                📅 2025년 을사년(乙巳年) 상세 운세
                            </div>
                            {!isPremium ? (
                                <div style={{ filter: "blur(6px)", userSelect: "none", opacity: 0.5 }}>
                                    <p>1월: 새로운 시작을 알리는 기운이 강합니다...</p>
                                    <p>2월: 재물운이 상승하며 뜻밖의 수익이...</p>
                                    <p>3월: 인간관계에서 귀인을 만나게 됩...</p>
                                    <p>4월: 건강 관리에 유의해야 하는 시기...</p>
                                </div>
                            ) : (
                                <div style={{ fontSize: 13, color: "#d4d4d8", lineHeight: 1.8, textAlign: "left" }}>
                                    <div style={{ marginBottom: 12 }}>
                                        <strong style={{ color: "#a855f7" }}>[상반기]</strong><br />
                                        새로운 도전을 하기에 적합한 시기입니다. 직장인이라면 승진 운이 명확하게 들어와 있으며, 사업가는 확장의 기회를 잡을 수 있습니다. 다만 4월에는 건강에 유의하세요.
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                        <strong style={{ color: "#3b82f6" }}>[하반기]</strong><br />
                                        재물 흐름이 안정화되는 시기입니다. 투자했던 곳에서 성과가 나오며, 연애운 또한 상승 곡선을 그립니다. 10월에는 이동수가 있으니 이사나 여행 계획을 세워보세요.
                                    </div>
                                    <div style={{ padding: "10px", background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 12 }}>
                                        💡 <strong>Key Advice:</strong> 올해는 '변화'를 두려워하지 말고 즐기는 것이 개운의 핵심입니다.
                                    </div>
                                </div>
                            )}
                            {!isPremium && (
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%" }}>
                                    <button
                                        onClick={() => setShowPremiumModal(true)}
                                        style={{
                                            background: " #9333ea", color: "#fff", border: "none",
                                            padding: "10px 20px", borderRadius: 20, fontWeight: 700,
                                            boxShadow: "0 4px 15px rgba(147, 51, 234, 0.4)", cursor: "pointer"
                                        }}
                                    >
                                        🔒 잠금 해제 (Premium)
                                    </button>
                                </div>
                            )}
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

                <PremiumUnlockModal
                    isOpen={showPremiumModal}
                    onClose={() => setShowPremiumModal(false)}
                />
            </div>
        </motion.div >
    );
}
