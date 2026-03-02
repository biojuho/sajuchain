import type { AIResult, FiveElementsData, FortuneResult, ShinsalData } from '@/types';

type FortuneContext = {
    fiveElements?: FiveElementsData;
    shinsal?: ShinsalData;
};

export const FORTUNE_SCORE_VERSION = 1;

const POSITIVE_KEYWORDS = [
    '기회',
    '성장',
    '안정',
    '유리',
    '상승',
    '원활',
    '성과',
    '행운',
    '회복',
    '개선',
    'favors',
    'growth',
    'stable',
    'improves',
    'supportive',
    'progress',
    'opportunity',
    'strong',
    'well',
];

const NEGATIVE_KEYWORDS = [
    '주의',
    '조심',
    '갈등',
    '부담',
    '스트레스',
    '위험',
    '손실',
    '지연',
    '불안',
    '과로',
    '충돌',
    'risk',
    'delay',
    'stress',
    'loss',
    'drain',
    'avoid',
    'caution',
    'volatile',
    'weak',
    'conflict',
];

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function textSignal(text: string): number {
    const normalized = normalizeText(text);
    if (!normalized) return 0;

    const positiveCount = POSITIVE_KEYWORDS.filter((keyword) => normalized.includes(keyword.toLowerCase())).length;
    const negativeCount = NEGATIVE_KEYWORDS.filter((keyword) => normalized.includes(keyword.toLowerCase())).length;

    return clamp((positiveCount - negativeCount) * 4, -12, 12);
}

export function balanceSignal(fiveElements?: FiveElementsData): number {
    const scores = fiveElements?.scores;
    if (!scores) return 0;

    const values = Object.values(scores);
    if (values.length === 0) return 0;

    const spread = Math.max(...values) - Math.min(...values);
    return clamp(Math.round(6 - spread * 1.5), -6, 6);
}

export function buildFortune(ai?: AIResult | null, context: FortuneContext = {}): FortuneResult {
    const balance = balanceSignal(context.fiveElements);
    const dohwaBonus = Math.min((context.shinsal?.dohwa.count ?? 0) * 3, 9);
    const yeokmaBonus = Math.min((context.shinsal?.yeokma.count ?? 0) * 2, 6);
    const hwagaeBonus = Math.min((context.shinsal?.hwagae.count ?? 0) * 1, 4);
    const aiMissingPenalty = ai ? 0 : -3;

    const careerScore = clamp(
        70 + textSignal(ai?.career ?? '') + Math.round(balance / 2) + yeokmaBonus + hwagaeBonus + aiMissingPenalty,
        45,
        95,
    );

    const loveScore = clamp(
        68 + textSignal(ai?.relationship ?? '') + Math.round(balance / 2) + dohwaBonus - (context.shinsal?.yeokma.has ? 2 : 0) + aiMissingPenalty,
        40,
        95,
    );

    const healthScore = clamp(
        67 + textSignal(ai?.health ?? '') + balance + aiMissingPenalty,
        40,
        92,
    );

    const overallInput = [
        ai?.headline,
        ai?.advice,
        ...(ai?.threeLineSummary ?? []),
        ai?.overallFortune,
        ai?.personality,
    ]
        .filter(Boolean)
        .join(' ');

    const overallText = clamp(Math.round(textSignal(overallInput) / 1.5), -10, 10);
    const overallScore = clamp(
        Math.round(((careerScore + loveScore + healthScore) / 3) + overallText * 0.6),
        45,
        96,
    );

    return {
        overall: {
            score: overallScore,
            title: ai?.headline || 'Overall Fortune',
            detail: ai?.advice || 'AI insight is unavailable, so this score is based on your chart balance.',
        },
        career: {
            score: careerScore,
            title: 'Career / Wealth',
            dos: ['Move with structure', 'Validate assumptions'],
            donts: ['Avoid rushed decisions'],
        },
        love: {
            score: loveScore,
            title: 'Love / Relationships',
            idealMatch: ai?.relationship || '-',
        },
        health: {
            score: healthScore,
            title: 'Health',
            organs: [ai?.health || 'Sleep and recovery'],
            activities: ['Light exercise', 'Steady routine'],
        },
    };
}
