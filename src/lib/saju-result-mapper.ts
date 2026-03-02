/**
 * Shared mapper that converts raw saju engine + AI data into the
 * UI-ready shape consumed by ResultPageV3.
 */

import type { SajuResult } from '@/lib/saju-engine';
import type {
    AIResult,
    DaewoonCycle,
    FiveElementsData,
    FortuneResult,
    SajuData,
    ShinsalData,
    SoulmateData,
} from '@/types';
import { buildFortune, FORTUNE_SCORE_VERSION } from './fortune-score';
import { normalizeSajuData } from './saju-schema';
import { formatPillar, getColorHex, type FormattedPillar } from './pillar-mapper';

export interface SajuUIRawData {
    source: 'form' | 'history';
    saju?: SajuResult;
    ai?: AIResult | null;
    basic?: unknown;
    history?: SajuData;
}

export interface SajuUIResult {
    keywords: string[];
    dayMaster: {
        name: string;
        hanja: string;
        element: string;
    };
    pillars: {
        year: FormattedPillar;
        month: FormattedPillar;
        day: FormattedPillar;
        hour: FormattedPillar;
    };
    elementBalance: Record<string, number>;
    lucky: {
        color: string;
        hex: string;
        number: string | number;
        direction: string;
    };
    fortune: FortuneResult;
    score: number;
    summary: string;
    daewoon?: { startAge: number; cycles: DaewoonCycle[] };
    shinsal?: ShinsalData;
    soulmate?: SoulmateData;
    rawData?: SajuUIRawData;
}

function buildElementBalance(fiveElements?: FiveElementsData): Record<string, number> {
    if (!fiveElements?.scores) return {};

    return {
        Wood: fiveElements.scores.wood,
        Fire: fiveElements.scores.fire,
        Earth: fiveElements.scores.earth,
        Metal: fiveElements.scores.metal,
        Water: fiveElements.scores.water,
    };
}

function buildLucky(luckyItems?: AIResult['luckyItems'] | null) {
    const color = luckyItems?.color || 'Purple';

    return {
        color: luckyItems?.color || 'Purple',
        hex: getColorHex(color),
        number: luckyItems?.number ?? '7',
        direction: luckyItems?.direction || 'East',
    };
}

function parseDayMasterName(dayMaster?: string | { hanja: string; element: string; name: string }): {
    name: string;
    hanja: string;
    element: string;
} {
    if (typeof dayMaster === 'object' && dayMaster) {
        return dayMaster;
    }

    const str = String(dayMaster || 'Unknown');
    const [name] = str.split('(');

    return {
        name: name || 'Unknown',
        hanja: name || 'Unknown',
        element: 'Wood',
    };
}

function hasFortuneSnapshot(fortuneSnapshot?: FortuneResult): fortuneSnapshot is FortuneResult {
    if (!fortuneSnapshot || typeof fortuneSnapshot !== 'object') {
        return false;
    }

    return ['overall', 'career', 'love', 'health'].every((key) => {
        const entry = fortuneSnapshot[key];
        return typeof entry?.score === 'number';
    });
}

function shouldUseStoredFortuneSnapshot(data: SajuData): data is SajuData & { fortuneSnapshot: FortuneResult } {
    return hasFortuneSnapshot(data.fortuneSnapshot)
        && data.scoreVersion === FORTUNE_SCORE_VERSION;
}

export function mapFormResultToUI(
    saju: SajuResult,
    ai: AIResult | null | undefined,
    basic: unknown,
): SajuUIResult {
    const keywords = ai?.threeLineSummary
        || saju.interpretation.personalityKeywords
        || ['Analysis complete'];
    const dm = parseDayMasterName(saju.dayMaster);
    const fortune = buildFortune(ai, {
        fiveElements: saju.fiveElements,
        shinsal: saju.shinsal,
    });

    return {
        keywords,
        dayMaster: {
            name: dm.name,
            hanja: saju.fourPillars.day.heavenlyStem,
            element: saju.fourPillars.day.element || dm.element,
        },
        pillars: {
            year: formatPillar(saju.fourPillars.year),
            month: formatPillar(saju.fourPillars.month),
            day: formatPillar(saju.fourPillars.day),
            hour: formatPillar(saju.fourPillars.hour),
        },
        elementBalance: buildElementBalance(saju.fiveElements),
        lucky: buildLucky(ai?.luckyItems),
        fortune,
        score: fortune.overall.score,
        summary: ai?.advice || 'Detailed AI insight is unavailable.',
        daewoon: saju.daewoon,
        shinsal: saju.shinsal,
        soulmate: saju.soulmate,
        rawData: {
            source: 'form',
            saju,
            ai,
            basic,
        },
    };
}

export function mapHistoryToUI(data: SajuData): SajuUIResult {
    const normalized = normalizeSajuData(data);
    const {
        sajuInterpretation,
        aiResult,
        fourPillars,
        fiveElements,
        dayMaster,
        daewoon,
        shinsal,
        soulmate,
    } = normalized;

    const dm = parseDayMasterName(dayMaster ?? fourPillars.day.heavenlyStem);
    const keywords = aiResult?.threeLineSummary
        || sajuInterpretation?.personalityKeywords
        || ['Analysis complete'];
    const fortune = shouldUseStoredFortuneSnapshot(normalized)
        ? normalized.fortuneSnapshot
        : buildFortune(aiResult, {
            fiveElements,
            shinsal,
        });

    return {
        keywords,
        dayMaster: {
            name: dm.name,
            hanja: fourPillars.day.heavenlyStem,
            element: fourPillars.day.element || dm.element,
        },
        pillars: {
            year: formatPillar(fourPillars.year),
            month: formatPillar(fourPillars.month),
            day: formatPillar(fourPillars.day),
            hour: formatPillar(fourPillars.hour),
        },
        elementBalance: buildElementBalance(fiveElements),
        lucky: buildLucky(aiResult?.luckyItems),
        fortune,
        score: fortune.overall.score,
        summary: aiResult?.advice || 'Detailed AI insight is unavailable.',
        daewoon,
        shinsal,
        soulmate,
        rawData: {
            source: 'history',
            history: normalized,
            ai: aiResult,
        },
    };
}
