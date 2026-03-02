'use client';

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSajuStore } from '@/lib/store';

import SajuFormRedesigned from './SajuFormRedesigned';
import ResultPageV3 from './mobile/ResultPageV3';
import HistoryPage from './HistoryPage';
import KakaoScript from '@/components/share/KakaoScript';
import { mintSajuNFT } from "@/lib/solana/mintSajuNFT";
import { mapFormResultToUI, mapHistoryToUI, type SajuUIResult } from '@/lib/saju-result-mapper';
import type { SajuResult } from '@/lib/saju-engine';
import type { AIResult, SajuData } from '@/types';

import { Meteors } from "@/components/ui/MeteorEffect";
import { GlassCard } from "@/components/ui/GlassCard";

interface FormBasicData {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: 'M' | 'F';
    calendarType: 'solar' | 'lunar';
    name?: string;
    birthPlace: string;
    isSummerTime: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sajuchain.com';

export default function SajuAppRedesigned() {
    const router = useRouter();
    const wallet = { connected: false, publicKey: null };
    const connection = null;
    const { syncWithSupabase } = useSajuStore();

    useEffect(() => {
        syncWithSupabase();
    }, [syncWithSupabase]);

    const [view, setView] = useState<"input" | "result" | "history">("input");
    const [resultData, setResultData] = useState<SajuUIResult | null>(null);
    const [formBasic, setFormBasic] = useState<FormBasicData | null>(null);

    const shareRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isMinting, setIsMinting] = useState(false);

    const handleFormComplete = useCallback((data: { saju: SajuResult; ai: AIResult | null | undefined; basic: FormBasicData }) => {
        const uiResult = mapFormResultToUI(data.saju, data.ai, data.basic);
        setResultData(uiResult);
        setFormBasic(data.basic);

        setTimeout(() => {
            setView("result");
            window.scrollTo(0, 0);
        }, 200);
    }, []);

    const handleBack = useCallback(() => {
        setTimeout(() => {
            setView("input");
            setResultData(null);
            window.scrollTo(0, 0);
        }, 200);
    }, []);

    const handleShare = useCallback(async () => {
        if (!resultData || !formBasic) return;

        // Try Kakao Share first
        if (window.Kakao && window.Kakao.isInitialized()) {
            const dmHanja = resultData.dayMaster.hanja || '甲';
            const summary = resultData.summary?.slice(0, 50) + "..." || "AI 사주 분석 결과 확인하기";

            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `[SajuChain] 나의 사주: ${dmHanja}일간`,
                    description: summary,
                    imageUrl: `${BASE_URL}/api/og?type=card&name=${encodeURIComponent(formBasic.name || 'User')}&dayMaster=${dmHanja}&dayMasterElement=${resultData.dayMaster.element}`,
                    link: {
                        mobileWebUrl: BASE_URL,
                        webUrl: BASE_URL,
                    },
                },
                buttons: [
                    {
                        title: '내 사주 확인하기',
                        link: {
                            mobileWebUrl: BASE_URL,
                            webUrl: BASE_URL,
                        },
                    },
                ],
            });
            return;
        }

        // Fallback: Server-Side Image Download
        setIsSharing(true);
        try {
            const params = new URLSearchParams({
                type: 'card',
                name: formBasic.name || 'User',
                birthdate: `${formBasic.year}.${formBasic.month}.${formBasic.day}`,
                dayMaster: resultData.dayMaster.hanja,
                dayMasterElement: resultData.dayMaster.element,
                keywords: resultData.keywords.slice(0, 3).join(','),
                desc: resultData.summary ? resultData.summary.slice(0, 60) + '...' : ''
            });

            const link = document.createElement('a');
            link.href = `/api/og?${params.toString()}`;
            link.download = `saju-card-${formBasic.year}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch {
            alert("이미지 다운로드 실패");
        } finally {
            setIsSharing(false);
        }
    }, [resultData, formBasic]);

    const handleMint = useCallback(async () => {
        if (!shareRef.current || !resultData?.rawData) return;
        if (!wallet.connected || !wallet.publicKey) {
            alert("지갑 연결이 필요합니다.");
            return;
        }

        setIsMinting(true);
        try {
            await new Promise(r => setTimeout(r, 100));
            const imageDatasUri = "placeholder";

            const metadata = {
                name: "SajuChain Fortune",
                symbol: "SAJU",
                description: "AI-Powered Saju Analysis",
                image: "image.png",
                external_url: BASE_URL,
                attributes: [],
                properties: {
                    category: "image" as const,
                    creators: [{ address: String(wallet.publicKey), share: 100 }],
                    files: [],
                },
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mintResult = await mintSajuNFT(connection as any, wallet as any, metadata, imageDatasUri);
            alert(`Minted! ${mintResult.mintAddress.slice(0, 8)}...`);
        } catch {
            alert("Minting Failed");
        } finally {
            setIsMinting(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resultData]);

    const handleHistorySelect = useCallback(
        (data: SajuData) => {
            const uiRes = mapHistoryToUI(data);
            setResultData(uiRes);
            setFormBasic({
                year: parseInt(data.birthDate.split('-')[0]),
                month: parseInt(data.birthDate.split('-')[1]),
                day: parseInt(data.birthDate.split('-')[2]),
                hour: 12,
                minute: 30,
                gender: 'M',
                calendarType: data.calendarType === 'solar' ? 'solar' : 'lunar',
                birthPlace: data.birthPlace || '',
                isSummerTime: false,
            });
            setView('result');
        },
        [],
    );

    return (
        <div className="min-h-screen bg-deep-space flex justify-center md:items-center relative overflow-hidden font-sans text-slate-200 selection:bg-mystic-500/30">
            <KakaoScript />

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <Meteors number={15} />
                <div className="absolute inset-0 bg-gradient-to-b from-mystic-900/10 via-transparent to-deep-space/90" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-mystic-600/10 blur-[100px] rounded-full" />
            </div>

            {/* Main App Container */}
            <GlassCard className="w-full max-w-[430px] min-h-screen md:min-h-[850px] md:h-[850px] md:rounded-[40px] md:border-2 md:border-white/10 md:shadow-[0_0_80px_rgba(255,255,255,0.05)] relative flex flex-col mx-auto my-auto p-0 overflow-hidden !bg-black/90 backdrop-blur-3xl pb-14">
                <AnimatePresence mode="wait">
                    {view === "input" && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.04, filter: 'blur(4px)' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">
                                <SajuFormRedesigned onComplete={handleFormComplete} />
                            </div>
                        </motion.div>
                    )}

                    {view === "history" && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 50, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: -50, filter: 'blur(4px)' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="h-full w-full flex flex-col overflow-hidden"
                        >
                            <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">
                                <HistoryPage
                                    onBack={() => setView('input')}
                                    onSelect={handleHistorySelect}
                                />
                            </div>
                        </motion.div>
                    )}

                    {view === "result" && resultData && formBasic && (
                         <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 50, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -50, filter: 'blur(4px)' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="h-full w-full flex flex-col overflow-hidden"
                        >
                            <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">
                                <ResultPageV3
                                    form={{
                                        year: formBasic.year,
                                        month: formBasic.month,
                                        day: formBasic.day,
                                        calendar: formBasic.calendarType,
                                        name: formBasic.name,
                                    }}
                                    result={resultData}
                                    onBack={handleBack}
                                    router={router}
                                    onShare={handleShare}
                                    isSharing={isSharing}
                                    onMint={handleMint}
                                    isMinting={isMinting}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </div>
    );
}
