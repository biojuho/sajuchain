
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
    const dmVal = typeof saju.dayMaster === 'string' ? saju.dayMaster : saju.dayMaster?.hanja || '';
    const dayMaster = dmVal ? dmVal.charAt(0) : '';
    const birthMonthIndex = saju.birthDate ? parseInt(saju.birthDate.split('-')[1], 10) - 1 : 0;

    // 1. Jeokcheonsu (Day Master analysis)
    // Find entry matching the Day Master Character
    const cheonganEntries = CLASSIC_TEXTS.적천수.chapters.find(c => c.id === 'cheongan')?.entries;
    if (cheonganEntries) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entry = cheonganEntries.find(e => e.key.includes(dayMaster)) as any;
        if (entry) {
            // Simple keyword matching for advice focus
            let adviceFocus = '일반 조언';
            let specificAdvice = '';
            
            if (query.includes('재물') || query.includes('돈') || query.includes('사업')) {
                adviceFocus = '재물운';
                specificAdvice = entry.advice.재물;
            } else if (query.includes('연애') || query.includes('사랑') || query.includes('결혼')) {
                adviceFocus = '연애운';
                specificAdvice = entry.advice.연애;
            } else if (query.includes('건강')) {
                adviceFocus = '건강운';
                specificAdvice = entry.advice.건강;
            } else if (query.includes('직업') || query.includes('진로')) {
                adviceFocus = '직업운';
                specificAdvice = entry.advice.직업;
            }

            context.push(`
[참조: 적천수 천간론]
원문: ${entry.classic}
해석: ${entry.interpretation}
키워드: ${entry.keywords.join(', ')}
${adviceFocus} 관련 조언: ${specificAdvice || JSON.stringify(entry.advice)}
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

    if (context.length === 0) {
        return `
[시스템 메시지]
해당 사주에 대해 직접적으로 매칭되는 고전 텍스트 구절을 찾지 못했습니다. 
따라서 거짓으로 고전을 인용하지 말고, 사주의 '오행(Five Elements)' 분포와 '일간(Day Master)'의 기본 성향을 바탕으로 현대적이고 통찰력 있는 해석을 제공하세요.
명리학의 기본 원리(상생상극, 중화)에 입각하여 답변해 주세요.
`;
    }

    return context.join('\n');
}
