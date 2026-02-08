'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResultHero } from './ResultHero';
import { FourPillarsGrid } from './FourPillarsGrid';
import { ElementBarChart } from './ElementBarChart';
import { FortuneDetailTabs } from './FortuneDetailTabs';
import { LuckyItemsGrid } from './LuckyItemsGrid';
import { SageAdviceCard } from './SageAdviceCard';
import { ActionGrid, ReferralSystem } from './ActionGrid';
import { SajuData } from '@/types';

// Helper to Map SajuData to V3 ViewModel
const mapToViewModel = (data: SajuData) => {
    // Determine Element Colors/Stats from data or defaults
    const dayMaster = {
        gan: data.fourPillars.day.heavenlyStem || '甲',
        koreanName: data.dayMaster?.split('(')[0] || '갑목',
        element: data.dayMaster?.match(/\((.*?)\)/)?.[1] || '목',
        color: '#22c55e', // Default
        bg: 'rgba(34,197,94,0.1)'
    };

    // Quick Element Map for color
    const elMap: Record<string, string> = { '목': '#22c55e', '화': '#ef4444', '토': '#eab308', '금': '#e2e8f0', '수': '#3b82f6', 'Wood': '#22c55e', 'Fire': '#ef4444', 'Earth': '#eab308', 'Metal': '#e2e8f0', 'Water': '#3b82f6' };
    if (dayMaster.element && elMap[dayMaster.element]) {
        dayMaster.color = elMap[dayMaster.element];
        dayMaster.bg = `${elMap[dayMaster.element]}1A`;
    }

    const scores = data.fiveElements?.scores || { wood: 2, fire: 1, earth: 1, metal: 2, water: 2 };

    const fortune = {
        overall: {
            score: 85,
            title: data.aiResult?.headline || '새로운 시작이 기대되는 시기입니다.',
            detail: data.aiResult?.advice || '전반적으로 운의 흐름이 좋으며...'
        },
        career: {
            score: 72,
            title: '꾸준함이 답입니다',
            detail: data.aiResult?.career || '직장에서는 성실함이 인정받는 시기입니다.',
            dos: ['새로운 프로젝트 참여', '자기계발'],
            donts: ['무리한 투자', '감정적 대응']
        },
        love: {
            score: 91,
            title: '인기가 올라가는 시기',
            detail: data.aiResult?.relationship || '주변 사람들에게서 호감을 사게 됩니다.',
        },
        health: {
            score: 68,
            title: '휴식이 필요합니다',
            detail: data.aiResult?.health || '스트레스로 인한 피로가 누적될 수 있습니다.',
            organs: ['위장', '간'],
            activities: ['등산', '명상']
        }
    };

    const pillars = {
        year: {
            stem: data.fourPillars.year.heavenlyStem, stemElement: data.fourPillars.year.element || '목',
            branch: data.fourPillars.year.earthlyBranch, branchElement: '토' // Mock if missing
        },
        month: {
            stem: data.fourPillars.month.heavenlyStem, stemElement: data.fourPillars.month.element || '화',
            branch: data.fourPillars.month.earthlyBranch, branchElement: '수'
        },
        day: {
            stem: data.fourPillars.day.heavenlyStem, stemElement: data.fourPillars.day.element || '금',
            branch: data.fourPillars.day.earthlyBranch, branchElement: '토'
        },
        hour: {
            stem: data.fourPillars.hour.heavenlyStem, stemElement: data.fourPillars.hour.element || '수',
            branch: data.fourPillars.hour.earthlyBranch, branchElement: '목'
        },
    };

    return { dayMaster, scores, fortune, pillars };
};

interface SajuResultNativeProps {
    data: SajuData;
    onReset: () => void;
    onShare: () => void;
    onChat: () => void;
    onMint: () => void;
}

export const SajuResultNative = ({ data, onReset, onShare, onChat, onMint }: SajuResultNativeProps) => {
    const vm = mapToViewModel(data);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="w-full min-h-screen bg-[#09090b] text-zinc-50 pb-20 relative font-sans">
            {/* Snippet Background Glow */}
            <div
                className="absolute top-0 left-0 right-0 h-[300px] pointer-events-none z-0"
                style={{
                    background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 70%)"
                }}
            />

            {/* Nav */}
            <div className="relative z-10 flex justify-between items-center px-5 py-3">
                <button onClick={onReset} className="flex items-center gap-1 text-[14px] text-zinc-400 hover:text-white transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg">
                    ← 다시 입력하기
                </button>
            </div>

            <div className="px-5 relative z-10 max-w-[480px] mx-auto">
                <ResultHero
                    userName={data.name || '익명'}
                    description={`${data.birthDate} ${data.birthTime} · ${data.calendarType === 'solar' ? '양력' : '음력'}`}
                    dayMaster={vm.dayMaster}
                    keywords={data.aiResult?.threeLineSummary || ['키워드1', '키워드2']}
                />

                <div className="mb-4">
                    <FourPillarsGrid pillars={vm.pillars} />
                </div>

                <div className="mb-4">
                    <ElementBarChart scores={vm.scores} />
                </div>

                <div className="mb-4">
                    <FortuneDetailTabs data={vm.fortune} />
                </div>

                <div className="mb-4">
                    <LuckyItemsGrid items={{
                        color: { name: String(data.aiResult?.luckyItems.color || 'Black'), hex: '#1a1a2e' },
                        number: data.aiResult?.luckyItems.number || 7,
                        direction: data.aiResult?.luckyItems.direction || 'North'
                    }} />
                </div>

                <div className="mb-4">
                    <SageAdviceCard advice={data.aiResult?.advice || '운명은 스스로 개척하는 것입니다.'} />
                </div>

                <div className="mb-4">
                    <ActionGrid onRetry={onReset} onChat={onChat} onShare={onShare} onMint={onMint} />
                </div>

                <ReferralSystem />

                <footer className="mt-8 text-center pb-8">
                    <p className="text-[10px] text-zinc-700">SAJUCHAIN AI ENGINE V3.0 Hybrid</p>
                </footer>
            </div>
        </div>
    );
};
