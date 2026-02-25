'use client';
 

import React from 'react';
import { useSajuStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { SajuData } from '@/types';

interface HistoryPageProps {
    onBack: () => void;
    onSelect: (data: SajuData) => void;
}

export default function HistoryPage({ onBack, onSelect }: HistoryPageProps) {
    const { history, user, reset } = useSajuStore();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogin = () => {
        // Navigate to auth page
        window.location.href = '/auth';
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        // Supabase logout
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        reset(); // Clear local user state
        setIsLoggingOut(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
                minHeight: "100vh",
                background: "#09090b",
                color: "#fafafa",
                padding: "20px",
                paddingBottom: "80px"
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <button onClick={onBack} aria-label="Go back" style={{ background: "none", border: "none", color: "#a1a1aa", fontSize: 20, cursor: "pointer", marginRight: 16 }}>
                        ←
                    </button>
                    <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>My Dojo</h1>
                </div>

                {user ? (
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        style={{ fontSize: 12, color: "#ef4444", background: "none", border: "1px solid #ef4444", padding: "4px 8px", borderRadius: 8, cursor: "pointer" }}
                    >
                        {isLoggingOut ? '...' : 'Logout'}
                    </button>
                ) : (
                    <button
                        onClick={handleLogin}
                        style={{ fontSize: 12, color: "#a855f7", background: "rgba(168,85,247,0.1)", border: "1px solid #a855f7", padding: "4px 12px", borderRadius: 8, cursor: "pointer" }}
                    >
                        Login to Sync
                    </button>
                )}
            </div>

            {!user && (
                <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 12, color: "#a1a1aa", display: "flex", gap: 8, alignItems: "center" }}>
                    <span>☁️</span>
                    <div>
                        로그인하면 기록이 영구 저장되고<br />다른 기기에서도 볼 수 있습니다.
                    </div>
                </div>
            )}

            {history.length === 0 ? (
                <div style={{ textAlign: "center", color: "#71717a", marginTop: 60 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div>아직 저장된 사주 기록이 없습니다.</div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {history.map((record, i: number) => (
                        <motion.div
                            key={i}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(record)}
                            style={{
                                background: "#18181b",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 14,
                                padding: 16,
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                    {record.birthDate}
                                    <span style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 400 }}>{record.birthTime}</span>
                                </div>
                                <div style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>
                                    {record.aiResult?.headline || "사주 분석 결과"}
                                </div>
                            </div>
                            <div style={{ fontSize: 20 }}>
                                {record.gender === 'male' ? '👨' : '👩'}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
