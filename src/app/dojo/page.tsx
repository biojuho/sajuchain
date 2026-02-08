'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSajuStore } from '@/lib/store';
import { motion } from 'framer-motion';

export default function MyDojoPage() {
    const router = useRouter();
    const history = useSajuStore((state) => state.history);
    const setSajuData = useSajuStore((state) => state.setSajuData);

    const handleLoad = (data: any) => {
        setSajuData(data);
        router.push('/');
    };

    return (
        <div style={{
            minHeight: "100vh", background: "#09090b", color: "#fafafa",
            padding: "20px 16px", paddingBottom: 80
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800 }}>내 도장 🏯</h1>
                <button onClick={() => router.push('/')} style={{
                    background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%",
                    width: 32, height: 32, color: "#fff", cursor: "pointer"
                }}>✕</button>
            </div>

            {/* List */}
            {history.length === 0 ? (
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    height: "60vh", opacity: 0.5
                }}>
                    <span style={{ fontSize: 48, marginBottom: 16 }}>📜</span>
                    <p>아직 저장된 사주가 없습니다.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {history.map((data, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => handleLoad(data)}
                            style={{
                                background: "#18181b", borderRadius: 16, padding: 16,
                                border: "1px solid rgba(255,255,255,0.06)",
                                cursor: "pointer"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 16, fontWeight: 700 }}>
                                    {data.birthDate} {data.birthTime}
                                </span>
                                <span style={{ fontSize: 12, color: "#a855f7" }}>
                                    {data.dayMaster?.split('(')[0] || 'Unknown'} 일간
                                </span>
                            </div>
                            <div style={{ fontSize: 13, color: "#71717a", display: "flex", gap: 8 }}>
                                <span>{data.gender === 'male' ? '남성' : '여성'}</span>
                                <span>•</span>
                                <span>{data.fiveElements?.dominant || '-'} 기운 강함</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
