
import { SajuData } from '@/types';
import { CLASSIC_TEXTS } from './data/classic-texts';

export interface RagResult {
    source: string;
    originalText: string;
    interpretation: string;
    relevanceScore: number;
}

/**
 * Provides simple RAG (Retrieval Augmented Generation) logic
 * based on keyword matching and Saju properties.
 */
export function searchClassicText(saju: SajuData, query: string): string {
    const context: string[] = [];
    const dayMaster = saju.dayMaster?.charAt(0) || ''; // e.g. "甲"
    const birthMonthIndex = parseInt(saju.birthDate.split('-')[1], 10) - 1; // 0-11

    // 1. Jeokcheonsu (Day Master analysis)
    // Find entry matching the Day Master Character
    const cheonganEntries = CLASSIC_TEXTS.적천수.chapters.find(c => c.id === 'cheongan')?.entries;
    if (cheonganEntries) {
        const entry = cheonganEntries.find(e => e.key.includes(dayMaster)) as any;
        if (entry) {
            context.push(`
[참조: 적천수 천간론]
원문: ${entry.classic}
해석: ${entry.interpretation}
키워드: ${entry.keywords.join(', ')}
조언: ${JSON.stringify(entry.advice)}
`);
        }
    }

    // 2. Gungtongbogam (Seasonal analysis)
    // Map month index to Season
    // Spring: 2, 3, 4 (Indices: 1, 2, 3 in modern calendar, but lunar/solar difference applies. Simplified to Month index.)
    // Let's use simple mapping:
    // Spring: Feb, Mar, Apr (1, 2, 3)
    // Summer: May, Jun, Jul (4, 5, 6)
    // Autumn: Aug, Sep, Oct (7, 8, 9)
    // Winter: Nov, Dec, Jan (10, 11, 0)

    let seasonKey: '봄' | '여름' | '가을' | '겨울' = '봄';
    if ([4, 5, 6].includes(birthMonthIndex)) seasonKey = '여름';
    if ([7, 8, 9].includes(birthMonthIndex)) seasonKey = '가을';
    if ([10, 11, 0].includes(birthMonthIndex)) seasonKey = '겨울';

    const seasonGuide = CLASSIC_TEXTS.궁통보감.seasonalGuide[seasonKey];
    if (seasonGuide) {
        context.push(`
[참조: 궁통보감 (${seasonKey}생)]
기운: ${seasonGuide.energy}
특징: ${seasonGuide.general}
조언: ${seasonGuide.advice}
`);
    }

    // 3. Five Elements Interaction
    if (saju.fiveElements) {
        context.push(`
[참조: 오행 분석]
가장 강한 오행: ${saju.fiveElements.dominant} (${CLASSIC_TEXTS.오행상생상극.elements[saju.fiveElements.dominant as keyof typeof CLASSIC_TEXTS.오행상생상극.elements]?.emoji || ''})
부족한 오행: ${saju.fiveElements.lacking}
오행 원리: ${CLASSIC_TEXTS.오행상생상극.elements[saju.fiveElements.dominant as keyof typeof CLASSIC_TEXTS.오행상생상극.elements]?.organ || ''} 주의
`);
    }

    return context.join('\n');
}
