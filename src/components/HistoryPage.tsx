'use client';

import React from 'react';
import { useSajuStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ArrowLeft, LogIn, LogOut, Cloud } from 'lucide-react';
import { E_COLOR } from '@/lib/ui-constants';

interface HistoryPageProps {
    onBack: () => void;
    onSelect: (data: any) => void;
}

export default function HistoryPage({ onBack, onSelect }: HistoryPageProps) {
    const { history, user, reset } = useSajuStore();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogin = () => {
        window.location.href = '/auth';
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.auth.signOut();
        reset();
        setIsLoggingOut(false);
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } }
    };
    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                minHeight: "100vh",
                background: "#09090b",
                color: "#fafafa",
                padding: "20px",
                paddingBottom: "80px"
            }}
        >
            {/* 상단 그라데이션 */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 200,
                background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.08) 0%, transparent 70%)",
                pointerEvents: "none"
            }} />

            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        style={{
                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "#a1a1aa", borderRadius: 12, cursor: "pointer",
                            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                    >
                        <ArrowLeft size={16} />
                    </motion.button>
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>분석 기록</h1>
                        <p style={{ fontSize: 11, color: "#52525b", margin: 0 }}>{history.length}건의 기록</p>
                    </div>
                </div>

                {user ? (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        style={{
                            fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.06)",
                            border: "1px solid rgba(239,68,68,0.2)", padding: "6px 12px",
                            borderRadius: 10, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 4
                        }}
                    >
                        <LogOut size={12} />
                        {isLoggingOut ? '...' : '로그아웃'}
                    </motion.button>
                ) : (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogin}
                        style={{
                            fontSize: 12, color: "#a855f7", background: "rgba(168,85,247,0.06)",
                            border: "1px solid rgba(168,85,247,0.2)", padding: "6px 12px",
                            borderRadius: 10, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 4
                        }}
                    >
                        <LogIn size={12} />
                        로그인
                    </motion.button>
                )}
            </div>

            {/* 클라우드 동기화 안내 */}
            {!user && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: "rgba(168,85,247,0.04)", padding: "12px 14px",
                        borderRadius: 14, marginBottom: 20, fontSize: 12, color: "#a1a1aa",
                        display: "flex", gap: 10, alignItems: "center",
                        border: "1px solid rgba(168,85,247,0.1)"
                    }}
                >
                    <Cloud size={18} style={{ color: "#a855f7", flexShrink: 0 }} />
                    <div>
                        로그인하면 기록이 영구 저장되고<br />
                        <span style={{ color: "#71717a" }}>다른 기기에서도 확인할 수 있습니다.</span>
                    </div>
                </motion.div>
            )}

            {/* 빈 상태 */}
            {history.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: "center", color: "#71717a", marginTop: 80 }}
                >
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🔮</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>아직 분석 기록이 없습니다</div>
                    <div style={{ fontSize: 12, color: "#52525b" }}>사주 분석을 시작해보세요</div>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onBack}
                        style={{
                            marginTop: 24, padding: "10px 24px", borderRadius: 12,
                            background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)",
                            color: "#a855f7", fontSize: 13, fontWeight: 600, cursor: "pointer"
                        }}
                    >
                        분석 시작하기
                    </motion.button>
                </motion.div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                    {history.map((record: any, i: number) => {
                        const dayMasterElement = record.fourPillars?.day?.element;
                        const elColor = dayMasterElement ? (E_COLOR[dayMasterElement] || "#71717a") : "#71717a";

                        return (
                            <motion.div
                                key={i}
                                variants={item}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelect(record)}
                                style={{
                                    background: "rgba(24,24,27,0.9)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: 16,
                                    padding: "14px 16px",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                            >
                                {/* 왼쪽 오행 색상 바 */}
                                <div style={{
                                    position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                                    background: elColor, borderRadius: "3px 0 0 3px"
                                }} />

                                <div style={{ marginLeft: 8 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                                        <span>{record.birthDate}</span>
                                        <span style={{ fontSize: 11, color: "#71717a", fontWeight: 400 }}>{record.birthTime}</span>
                                        {record.fourPillars?.day?.heavenlyStem && (
                                            <span style={{
                                                fontSize: 11, padding: "1px 6px", borderRadius: 6,
                                                background: `${elColor}15`, color: elColor,
                                                fontWeight: 600
                                            }}>
                                                {record.fourPillars.day.heavenlyStem}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#52525b", marginTop: 4, lineHeight: 1.4 }}>
                                        {record.aiResult?.headline || "사주 분석 결과"}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: 20, width: 36, height: 36, borderRadius: 10,
                                    background: "rgba(255,255,255,0.03)",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                }}>
                                    {record.gender === 'male' ? '👨' : '👩'}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}
