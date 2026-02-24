'use client';

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSajuStore } from '@/lib/store';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import html2canvas from 'html2canvas';

import SajuFormRedesigned from './SajuFormRedesigned';
import ResultPageV3 from './mobile/ResultPageV3';
// import ShareCard from '@/components/share/ShareCard';
import HistoryPage from './HistoryPage';
import KakaoScript from '@/components/share/KakaoScript';
import { mintSajuNFT } from "@/lib/solana/mintSajuNFT";

// Visual Director Components
import { Meteors } from "@/components/ui/MeteorEffect";
import { GlassCard } from "@/components/ui/GlassCard";
import { MysticalButton } from "@/components/ui/MysticalButton";

export default function SajuAppRedesigned() {
    const router = useRouter();
    // const { connection } = useConnection();
    // const wallet = useWallet();
    const wallet = { connected: false, publicKey: null }; // Mock for Phase 8
    const connection = null; // Mock
    const { syncWithSupabase } = useSajuStore();

    useEffect(() => {
        syncWithSupabase();
    }, [syncWithSupabase]);

    const [view, setView] = useState<"input" | "result" | "history">("input");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [resultData, setResultData] = useState<any>(null); // This will hold the combined result from Form
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formBasic, setFormBasic] = useState<any>(null); // To pass to ResultPage if needed

    // Sharing & Minting State
    const shareRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    // const [fade, setFade] = useState(false); // Unused

    // Helper: Map Pillar Data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapPillar = (p: any) => {
        const GAN_NAMES: Record<string, string> = {
            '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
            '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계'
        };
        const ZHI_NAMES: Record<string, string> = {
            '子': '자(쥐)', '丑': '축(소)', '寅': '인(호랑이)', '卯': '묘(토끼)', '辰': '진(용)', '巳': '사(뱀)',
            '午': '오(말)', '未': '미(양)', '申': '신(원숭이)', '酉': '유(닭)', '戌': '술(개)', '亥': '해(돼지)'
        };
        const ZHI_ELS: Record<string, string> = {
            '子': '수', '亥': '수', '寅': '목', '卯': '목', '巳': '화', '午': '화', '申': '금', '酉': '금', '辰': '토', '戌': '토', '丑': '토', '未': '토'
        };

        return {
            stem: p.heavenlyStem,
            stemName: GAN_NAMES[p.heavenlyStem] || "천간",
            stemElement: p.element,
            branch: p.earthlyBranch,
            branchName: ZHI_NAMES[p.earthlyBranch] || "지지",
            branchElement: ZHI_ELS[p.earthlyBranch] || "토",
            tenGod: p.tenGod,
            unseong: p.unseong
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFormComplete = (data: any) => {
        // data = { saju, ai, basic }
        const { saju, ai, basic } = data;

        // Construct the result object for UI
        const uiResult = {
            keywords: ai?.threeLineSummary || saju.interpretation.personalityKeywords || ["분석 완료", "운명을 개척하세요"],
            dayMaster: {
                name: saju.dayMaster.split('(')[0],
                hanja: saju.fourPillars.day.heavenlyStem,
                element: saju.fourPillars.day.element 
            },
            pillars: {
                year: mapPillar(saju.fourPillars.year),
                month: mapPillar(saju.fourPillars.month),
                day: mapPillar(saju.fourPillars.day),
                hour: mapPillar(saju.fourPillars.hour),
            },
            elementBalance: saju.fiveElements?.scores ? {
                '목': saju.fiveElements.scores.wood,
                '화': saju.fiveElements.scores.fire,
                '토': saju.fiveElements.scores.earth,
                '금': saju.fiveElements.scores.metal,
                '수': saju.fiveElements.scores.water
            } : {},
            lucky: {
                color: ai?.luckyItems?.color || "보라",
                hex: getHexForColor(ai?.luckyItems?.color || "Purple"),
                number: ai?.luckyItems?.number || "7",
                direction: ai?.luckyItems?.direction || "동쪽"
            },
            fortune: {
                overall: {
                    score: 85, 
                    title: ai?.headline || "당신의 운명을 개척하세요",
                    detail: ai?.advice || "AI 분석 결과를 불러오지 못했습니다. 하지만 당신의 잠재력은 무한합니다."
                },
                career: {
                    score: 80,
                    title: "직업운",
                    dos: ["적극적인 태도"], 
                    donts: ["성급함"]
                },
                love: { score: 75, title: "애정운", idealMatch: ai?.relationship || "-" },
                health: { score: 70, title: "건강운", organs: [ai?.health || "규칙적인 생활"] }
            },
            summary: ai?.advice || "상세 분석 결과가 없습니다.",
            daewoon: saju.daewoon,
            shinsal: saju.shinsal,
            soulmate: saju.soulmate,
            rawData: data 
        };

        setResultData(uiResult);
        setFormBasic(basic);

        // Navigation
        setTimeout(() => {
            setView("result");
            window.scrollTo(0, 0);
        }, 200);
    };

    const handleBack = () => {
        // setFade(true);
        setTimeout(() => {
            setView("input");
            setResultData(null);
            window.scrollTo(0, 0);
            // setTimeout(() => setFade(false), 50);
        }, 200);
    };

    const handleShare = async () => {
        // 1. Try Kakao Share first
        if (window.Kakao && window.Kakao.isInitialized()) {
            const dmHanja = resultData?.dayMaster?.hanja || '甲';
            const summary = resultData?.summary?.slice(0, 50) + "..." || "AI 사주 분석 결과 확인하기";

            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `[SajuChain] 나의 사주: ${dmHanja}일간`,
                    description: summary,
                    imageUrl: `https://sajuchain.com/api/og?type=card&name=${encodeURIComponent(formBasic.name || 'User')}&dayMaster=${dmHanja}&dayMasterElement=${resultData.dayMaster.element}`,
                    link: {
                        mobileWebUrl: 'https://sajuchain.com',
                        webUrl: 'https://sajuchain.com',
                    },
                },
                buttons: [
                    {
                        title: '내 사주 확인하기',
                        link: {
                            mobileWebUrl: 'https://sajuchain.com',
                            webUrl: 'https://sajuchain.com',
                        },
                    },
                ],
            });
            return;
        }

        // 2. Fallback to Server-Side Image Download
        setIsSharing(true);
        try {
            const params = new URLSearchParams({
                type: 'card',
                name: formBasic?.name || 'User',
                birthdate: `${formBasic?.year}.${formBasic?.month}.${formBasic?.day}`,
                dayMaster: resultData.dayMaster.hanja,
                dayMasterElement: resultData.dayMaster.element,
                keywords: resultData.keywords.slice(0, 3).join(','),
                desc: resultData.summary ? resultData.summary.slice(0, 60) + '...' : ''
            });

            const link = document.createElement('a');
            link.href = `/api/og?${params.toString()}`;
            link.download = `saju-card-${formBasic?.year}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error(e);
            alert("이미지 다운로드 실패");
        } finally {
            setIsSharing(false);
        }
    };

    const handleMint = async () => {
        // ... Mint logic largely same as SajuAppV3 ...
        if (!shareRef.current || !resultData?.rawData) return;
        if (!wallet.connected || !wallet.publicKey) {
            alert("지갑 연결이 필요합니다.");
            return;
        }

        setIsMinting(true);
        try {
            await new Promise(r => setTimeout(r, 100));
            // 1. Generate Image
            // const canvas = await html2canvas(shareRef.current, { scale: 1, useCORS: true, backgroundColor: '#000' });
            // const imageDatasUri = canvas.toDataURL('image/png');
            const imageDatasUri = "placeholder";

            // 2. Metadata
            const metadata = {
                name: `SajuChain Fortune`,
                symbol: "SAJU",
                description: "AI-Powered Saju Analysis",
                image: "image.png",
                external_url: "https://sajuchain.com",
                attributes: [],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                properties: { category: "image" as const, creators: [{ address: (wallet.publicKey as any)?.toString() || "mock_address", share: 100 }], files: [] }
            };

            // 3. Mint
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mintResult = await mintSajuNFT(connection as any, wallet as any, metadata, imageDatasUri);
            alert(`Minted! ${mintResult.mintAddress.slice(0, 8)}...`);
        } catch (e) {
            console.error(e);
            alert("Minting Failed");
        } finally {
            setIsMinting(false);
        }
    };

    // Helpers
    const getHexForColor = (color: string) => {
        const map: Record<string, string> = { 'Purple': '#a855f7', 'Red': '#ef4444', 'Blue': '#3b82f6', 'Green': '#22c55e', 'Yellow': '#eab308', 'White': '#e2e8f0', 'Black': '#000000' };
        return map[color] || '#a855f7';
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapHistoryToResult = (data: any) => {
        // Reconstruct the UI result object from stored history data
        // This logic mirrors the construction in handleFormComplete
        const { sajuInterpretation, aiResult, fourPillars, fiveElements, dayMaster, daewoon, shinsal, soulmate } = data;

        return {
            keywords: aiResult?.threeLineSummary || sajuInterpretation?.personalityKeywords || ["분석 완료"],
            dayMaster: {
                name: dayMaster.split('(')[0],
                hanja: fourPillars.day.heavenlyStem,
                element: fourPillars.day.element
            },
            pillars: {
                year: mapPillar(fourPillars.year),
                month: mapPillar(fourPillars.month),
                day: mapPillar(fourPillars.day),
                hour: mapPillar(fourPillars.hour),
            },
            elementBalance: fiveElements?.scores ? {
                '목': fiveElements.scores.wood,
                '화': fiveElements.scores.fire,
                '토': fiveElements.scores.earth,
                '금': fiveElements.scores.metal,
                '수': fiveElements.scores.water
            } : {},
            lucky: {
                color: aiResult?.luckyItems?.color || "보라",
                hex: getHexForColor(aiResult?.luckyItems?.color || "Purple"),
                number: aiResult?.luckyItems?.number || "7",
                direction: aiResult?.luckyItems?.direction || "동쪽"
            },
            fortune: {
                overall: {
                    score: 85,
                    title: aiResult?.headline || "당신의 운명을 개척하세요",
                    detail: aiResult?.advice || "AI 분석 결과를 불러오지 못했습니다."
                },
                career: {
                    score: 80,
                    title: "직업운",
                    dos: ["적극적인 태도"],
                    donts: ["성급함"]
                },
                love: { score: 75, title: "애정운", idealMatch: aiResult?.relationship || "-" },
                health: { score: 70, title: "건강운", organs: [aiResult?.health || "건강 관리"] }
            },
            summary: aiResult?.advice || "상세 분석 결과가 없습니다.",
            daewoon: daewoon,
            shinsal: shinsal,
            soulmate: soulmate,
            rawData: data
        };
    };

    return (
        <div className="min-h-screen bg-deep-space flex justify-center md:items-center relative overflow-hidden font-sans text-slate-200 selection:bg-mystic-500/30">
            <KakaoScript />
            
            {/* 🌌 Visual Director: Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <Meteors number={15} />
                <div className="absolute inset-0 bg-gradient-to-b from-mystic-900/10 via-transparent to-deep-space/90" />
                {/* Aurora-like glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-mystic-600/10 blur-[100px] rounded-full" />
            </div>
            
            {/* Main App Container */}
            <GlassCard className="w-full max-w-[430px] min-h-screen md:min-h-[850px] md:h-[850px] md:rounded-[40px] md:border-2 md:border-white/10 md:shadow-2xl relative flex flex-col mx-auto my-auto p-0 overflow-hidden !bg-slate-950/50">
                <AnimatePresence mode="wait">
                    {view === "input" && (
                        <motion.div 
                            key="input"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                            className="h-full flex flex-col"
                        >
                            {/* Navigation Bar */}
                            <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
                                <div className="flex gap-2">
                                     <MysticalButton
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => router.push('/tojeong')}
                                        className="!px-3 !py-1.5 text-xs bg-mystic-900/50 hover:bg-mystic-800/50 border-mystic-500/30 text-mystic-100"
                                    >
                                        🔮 <span className="hidden sm:inline ml-1">토정비결</span>
                                    </MysticalButton>
                                    <MysticalButton
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => router.push('/compatibility')}
                                        className="!px-3 !py-1.5 text-xs bg-rose-900/50 hover:bg-rose-800/50 border-rose-500/30 text-rose-100"
                                    >
                                        💞 <span className="hidden sm:inline ml-1">궁합</span>
                                    </MysticalButton>
                                </div>
                                <MysticalButton
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setView('history')}
                                    className="!px-3 !py-1.5 text-xs flex items-center gap-1.5"
                                >
                                    📜 <span className="hidden sm:inline">My Dojo</span>
                                </MysticalButton>
                            </div>

                            {/* Main Form Area */}
                            <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">
                                <SajuFormRedesigned onComplete={handleFormComplete} />
                            </div>
                        </motion.div>
                    )}

                    {view === "history" && (
                        <motion.div 
                            key="history"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="h-full overflow-hidden"
                        >
                            <div className="h-full overflow-y-auto custom-scrollbar">
                                <HistoryPage
                                    onBack={() => setView('input')}
                                    onSelect={(data) => {
                                        const uiRes = mapHistoryToResult(data);
                                        setResultData(uiRes);
                                        setFormBasic({
                                            year: parseInt(data.birthDate.split('-')[0]),
                                            month: parseInt(data.birthDate.split('-')[1]),
                                            day: parseInt(data.birthDate.split('-')[2]),
                                            calendar: data.calendarType === 'solar' ? 'solar' : 'lunar'
                                        });
                                        setView('result');
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {view === "result" && resultData && (
                         <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="h-full overflow-hidden"
                        >
                            <div className="h-full overflow-y-auto custom-scrollbar">
                                <ResultPageV3
                                    form={formBasic}
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

