'use client';

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSajuStore } from '@/lib/store';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import html2canvas from 'html2canvas';

import SajuFormRedesigned from './SajuFormRedesigned';
import ResultPageV3 from './mobile/ResultPageV3';
// import ShareCard from '@/components/share/ShareCard';
import HistoryPage from './HistoryPage';
import KakaoScript from '@/components/share/KakaoScript';
import { mintSajuNFT } from "@/lib/solana/mintSajuNFT";

export default function SajuAppRedesigned() {
    const router = useRouter();
    const { connection } = useConnection();
    const wallet = useWallet();
    const { setSajuData, addToHistory, syncWithSupabase } = useSajuStore();

    useEffect(() => {
        syncWithSupabase();
    }, [syncWithSupabase]);

    const [view, setView] = useState<"input" | "result" | "history">("input");
    const [resultData, setResultData] = useState<any>(null); // This will hold the combined result from Form
    const [formBasic, setFormBasic] = useState<any>(null); // To pass to ResultPage if needed

    // Sharing & Minting State
    const shareRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [fade, setFade] = useState(false);

    const handleFormComplete = (data: any) => {
        // data = { saju, ai, basic }
        // We need to format this 'data' into the structure expected by ResultPageV3 'result' prop
        // ResultPageV3 expects:
        // result.keywords (string[])
        // result.dayMaster (object)
        // result.pillars (object)
        // result.elementBalance (object)
        // result.lucky (object)
        // result.fortune (object)
        // result.summary (string)
        // result.daewoon (object)
        // result.shinsal (object)
        // result.soulmate (object)

        // Let's adapt the data here
        const { saju, ai, basic } = data;

        // Construct the result object for UI
        const uiResult = {
            keywords: ai.threeLineSummary || saju.interpretation.personalityKeywords,
            dayMaster: {
                name: saju.dayMaster.split('(')[0],
                hanja: saju.fourPillars.day.heavenlyStem,
                element: saju.fourPillars.day.element // We need to ensure element is mapped correctly in ResultPage or here. 
                // ResultPageV3 uses E_COLOR[dm.element]. 'saju.dayMaster' string is like "갑(목)".
                // Actually saju-engine returns dayMaster string. 
                // Let's look at how SajuAppV3 did it.
                // It used `data.dayMaster` string and split it? No, `data.dayMaster` in engine is "갑(목)".
                // SajuAppV3: const dmName = data.dayMaster?.split('(')[0] || "일간";
                // ResultPageV3 expects result.dayMaster to have { name, hanja, element }.
            },
            pillars: {
                year: mapPillar(saju.fourPillars.year, 'year'),
                month: mapPillar(saju.fourPillars.month, 'month'),
                day: mapPillar(saju.fourPillars.day, 'day'),
                hour: mapPillar(saju.fourPillars.hour, 'hour'),
            },
            elementBalance: saju.fiveElements?.scores ? {
                '목': saju.fiveElements.scores.wood,
                '화': saju.fiveElements.scores.fire,
                '토': saju.fiveElements.scores.earth,
                '금': saju.fiveElements.scores.metal,
                '수': saju.fiveElements.scores.water
            } : {},
            lucky: {
                color: ai.luckyItems.color,
                hex: getHexForColor(ai.luckyItems.color), // Helper needed
                number: ai.luckyItems.number,
                direction: ai.luckyItems.direction
            },
            fortune: {
                overall: {
                    score: 85, // Mock or calc
                    title: ai.headline,
                    detail: ai.advice
                },
                career: {
                    score: 80,
                    title: "직업운",
                    dos: ["적극적인 태도"], // Parse from AI if possible, or mock
                    donts: ["성급함"]
                },
                love: { score: 75, title: "애정운", idealMatch: ai.relationship },
                health: { score: 70, title: "건강운", organs: [ai.health] }
            },
            summary: ai.advice,
            daewoon: saju.daewoon,
            shinsal: saju.shinsal,
            soulmate: saju.soulmate,
            rawData: data // Keep raw for sharing
        };

        // Fix helpers inside mapPillar
        // ... (We'll implement mapPillar inline or helper)

        setResultData(uiResult);
        setFormBasic(basic);

        // Navigation
        setFade(true);
        setTimeout(() => {
            setView("result");
            window.scrollTo(0, 0);
            setTimeout(() => setFade(false), 50);
        }, 200);
    };

    const handleBack = () => {
        setFade(true);
        setTimeout(() => {
            setView("input");
            setResultData(null);
            window.scrollTo(0, 0);
            setTimeout(() => setFade(false), 50);
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
                keywords: resultData.keywords.slice(0, 3).join(',')
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
                properties: { category: "image" as const, creators: [{ address: wallet.publicKey.toString(), share: 100 }], files: [] }
            };

            // 3. Mint
            const mintResult = await mintSajuNFT(connection, wallet, metadata, imageDatasUri);
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
        const map: any = { 'Purple': '#a855f7', 'Red': '#ef4444', 'Blue': '#3b82f6', 'Green': '#22c55e', 'Yellow': '#eab308', 'White': '#e2e8f0', 'Black': '#000000' };
        return map[color] || '#a855f7';
    };

    const mapHistoryToResult = (data: any) => {
        // Reconstruct the UI result object from stored history data
        // This logic mirrors the construction in handleFormComplete
        const { sajuInterpretation, aiResult, fourPillars, fiveElements, dayMaster, daewoon, shinsal, soulmate } = data;

        return {
            keywords: aiResult?.threeLineSummary || sajuInterpretation.personalityKeywords,
            dayMaster: {
                name: dayMaster.split('(')[0],
                hanja: fourPillars.day.heavenlyStem,
                element: fourPillars.day.element
            },
            pillars: {
                year: mapPillar(fourPillars.year, 'year'),
                month: mapPillar(fourPillars.month, 'month'),
                day: mapPillar(fourPillars.day, 'day'),
                hour: mapPillar(fourPillars.hour, 'hour'),
            },
            elementBalance: fiveElements?.scores ? {
                '목': fiveElements.scores.wood,
                '화': fiveElements.scores.fire,
                '토': fiveElements.scores.earth,
                '금': fiveElements.scores.metal,
                '수': fiveElements.scores.water
            } : {},
            lucky: {
                color: aiResult.luckyItems.color,
                hex: getHexForColor(aiResult.luckyItems.color),
                number: aiResult.luckyItems.number,
                direction: aiResult.luckyItems.direction
            },
            fortune: {
                overall: {
                    score: 85,
                    title: aiResult.headline,
                    detail: aiResult.advice
                },
                career: {
                    score: 80,
                    title: "직업운",
                    dos: ["적극적인 태도"],
                    donts: ["성급함"]
                },
                love: { score: 75, title: "애정운", idealMatch: aiResult.relationship },
                health: { score: 70, title: "건강운", organs: [aiResult.health] }
            },
            summary: aiResult.advice,
            daewoon: daewoon,
            shinsal: shinsal,
            soulmate: soulmate,
            rawData: data
        };
    };

    const mapPillar = (p: any, type: string) => {
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

    return (
        <div style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa", position: "relative", overflow: "hidden" }}>
            <KakaoScript />
            {/* Hidden Share Card - REMOVED for Server-Side Gen */}
            {/* <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
                {resultData?.rawData && (
                    <ShareCard
                        ref={shareRef}
                        data={resultData.rawData}
                        type="saju"
                        theme="mystic"
                    />
                )}
            </div> */}

            {view === "input" && (
                <>
                    <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
                        <button
                            onClick={() => setView('history')}
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 20,
                                padding: "6px 12px",
                                color: "#a1a1aa",
                                fontSize: 12,
                                cursor: "pointer"
                            }}
                        >
                            📜 My Dojo
                        </button>
                    </div>
                    <SajuFormRedesigned onComplete={handleFormComplete} />
                </>
            )}

            {view === "history" && (
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
            )}

            {view === "result" && resultData && (
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
            )}
        </div>
    );
}
