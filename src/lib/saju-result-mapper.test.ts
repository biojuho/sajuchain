import { describe, expect, it } from 'vitest';

import type { SajuResult } from '@/lib/saju-engine';
import { buildFortune, FORTUNE_SCORE_VERSION } from '@/lib/fortune-score';
import { SAJU_SCHEMA_VERSION, createCurrentSchemaSajuData } from '@/lib/saju-schema';
import { mapFormResultToUI, mapHistoryToUI } from '@/lib/saju-result-mapper';
import type { AIResult, SajuData } from '@/types';

function createAIResult(overrides: Partial<AIResult> = {}): AIResult {
    return {
        headline: 'Momentum is stable with clear growth opportunities.',
        threeLineSummary: [
            'Growth comes from steady action.',
            'Supportive relationships improve outcomes.',
            'Stable routines protect momentum.',
        ],
        personality: 'A stable and supportive profile with strong follow-through.',
        career: 'Career growth is supportive and progress is strong.',
        relationship: 'Relationships are stable and communication improves quickly.',
        health: 'Recovery improves with stable routines and low stress.',
        yearFortune2026: '2026 favors disciplined progress.',
        luckyItems: {
            color: 'Blue',
            number: 7,
            direction: 'East',
        },
        advice: 'Use structure and avoid unnecessary risk.',
        overallFortune: 'Stable progress builds strong results.',
        ...overrides,
    };
}

function createSajuResult(): SajuResult {
    return {
        fourPillars: {
            year: { heavenlyStem: '甲', earthlyBranch: '子', element: 'Wood', tenGod: 'Friend', unseong: 'Bath' },
            month: { heavenlyStem: '丙', earthlyBranch: '寅', element: 'Fire', tenGod: 'Output', unseong: 'Birth' },
            day: { heavenlyStem: '庚', earthlyBranch: '午', element: 'Metal', tenGod: 'Self', unseong: 'Peak' },
            hour: { heavenlyStem: '壬', earthlyBranch: '申', element: 'Water', tenGod: 'Resource', unseong: 'Study' },
        },
        dayMaster: {
            hanja: '庚',
            element: 'Metal',
            name: 'Day Master',
        },
        dominantElement: 'Fire',
        weakElement: 'Water',
        lunarDate: '2026-02-27',
        interpretation: {
            dominanceMsg: 'Balanced chart with strong output.',
            personalityKeywords: ['focus', 'discipline'],
        },
        daewoon: {
            startAge: 7,
            cycles: [
                {
                    startAge: 7,
                    endAge: 16,
                    ganZhi: '甲子',
                    tenGod: 'Friend/Resource',
                    unseong: 'Bath',
                },
            ],
        },
        shinsal: {
            dohwa: { has: true, count: 1, description: 'Attractive social signal.' },
            yeokma: { has: true, count: 1, description: 'Movement and change are active.' },
            hwagae: { has: false, count: 0, description: 'Artistic star is quiet.' },
        },
        soulmate: {
            id: 'soul-1',
            name: 'Sample Soulmate',
            title: 'Historic Figure',
            desc: 'A sample soulmate profile.',
            quote: 'Stay the course.',
            connectionMsg: 'You share a disciplined rhythm.',
        },
        fiveElements: {
            wood: 2,
            fire: 4,
            earth: 1,
            metal: 3,
            water: 1,
            dominant: 'Fire',
            lacking: 'Earth',
            scores: {
                wood: 2,
                fire: 4,
                earth: 1,
                metal: 3,
                water: 1,
            },
        },
    };
}

function createSajuData(overrides: Partial<SajuData> = {}): SajuData {
    const saju = createSajuResult();
    const aiResult = createAIResult();

    return {
        schemaVersion: SAJU_SCHEMA_VERSION,
        birthDate: '1990-01-01',
        birthTime: '12:30',
        gender: 'M',
        calendarType: 'solar',
        birthPlace: 'Seoul',
        fourPillars: saju.fourPillars,
        fiveElements: saju.fiveElements,
        dayMaster: saju.dayMaster,
        daewoon: saju.daewoon,
        shinsal: saju.shinsal,
        soulmate: saju.soulmate,
        aiResult,
        sajuInterpretation: saju.interpretation,
        fortuneSnapshot: buildFortune(aiResult, {
            fiveElements: saju.fiveElements,
            shinsal: saju.shinsal,
        }),
        scoreVersion: FORTUNE_SCORE_VERSION,
        generatedAt: '2026-02-27T00:00:00.000Z',
        ...overrides,
    };
}

describe('fortune score mapping', () => {
    it('changes career score when career text changes', () => {
        const positive = buildFortune(createAIResult({
            career: 'Strong growth, supportive progress, and stable opportunities.',
        }), { fiveElements: createSajuResult().fiveElements, shinsal: createSajuResult().shinsal });

        const negative = buildFortune(createAIResult({
            career: 'Risk, delay, conflict, and stress require caution.',
        }), { fiveElements: createSajuResult().fiveElements, shinsal: createSajuResult().shinsal });

        expect(positive.career.score).not.toBe(negative.career.score);
    });

    it('changes love score when relationship text changes', () => {
        const positive = buildFortune(createAIResult({
            relationship: 'Stable growth and supportive communication improve love.',
        }), { fiveElements: createSajuResult().fiveElements, shinsal: createSajuResult().shinsal });

        const negative = buildFortune(createAIResult({
            relationship: 'Conflict, delay, caution, and stress create risk.',
        }), { fiveElements: createSajuResult().fiveElements, shinsal: createSajuResult().shinsal });

        expect(positive.love.score).not.toBe(negative.love.score);
    });

    it('returns bounded scores without AI input', () => {
        const result = buildFortune(null, {
            fiveElements: createSajuResult().fiveElements,
            shinsal: createSajuResult().shinsal,
        });

        expect(result.overall.score).toBeGreaterThanOrEqual(45);
        expect(result.overall.score).toBeLessThanOrEqual(96);
        expect(result.career.score).toBeGreaterThanOrEqual(45);
        expect(result.health.score).toBeLessThanOrEqual(92);
    });

    it('is deterministic for identical input', () => {
        const ai = createAIResult();
        const context = {
            fiveElements: createSajuResult().fiveElements,
            shinsal: createSajuResult().shinsal,
        };

        const first = buildFortune(ai, context);
        const second = buildFortune(ai, context);

        expect(first).toEqual(second);
    });
});

describe('saju schema helpers', () => {
    it('stamps current schema version for new records', () => {
        const data = createCurrentSchemaSajuData({
            birthDate: '1990-01-01',
            gender: 'M',
            fourPillars: createSajuResult().fourPillars,
        });

        expect(data.schemaVersion).toBe(SAJU_SCHEMA_VERSION);
    });
});

describe('saju result mapper', () => {
    it('keeps shinsal and soulmate on form mapping', () => {
        const saju = createSajuResult();
        const ui = mapFormResultToUI(saju, createAIResult(), { source: 'test' });

        expect(ui.shinsal).toEqual(saju.shinsal);
        expect(ui.soulmate).toEqual(saju.soulmate);
        expect(ui.rawData?.source).toBe('form');
    });

    it('restores shinsal and soulmate from history', () => {
        const data = createSajuData();
        const ui = mapHistoryToUI(data);

        expect(ui.shinsal).toEqual(data.shinsal);
        expect(ui.soulmate).toEqual(data.soulmate);
        expect(ui.rawData?.source).toBe('history');
        expect(ui.rawData?.history).toEqual(data);
        expect(ui.rawData?.history?.schemaVersion).toBe(SAJU_SCHEMA_VERSION);
    });

    it('prefers stored fortune snapshots for history replay', () => {
        const data = createSajuData({
            fortuneSnapshot: {
                overall: { score: 91, title: 'Stored overall', detail: 'Stored detail' },
                career: { score: 88, title: 'Stored career' },
                love: { score: 73, title: 'Stored love' },
                health: { score: 69, title: 'Stored health' },
            },
        });

        const ui = mapHistoryToUI(data);

        expect(ui.score).toBe(91);
        expect(ui.fortune.overall.title).toBe('Stored overall');
        expect(ui.fortune.career.score).toBe(88);
    });

    it('recomputes stale fortune snapshots when score version mismatches', () => {
        const data = createSajuData({
            fortuneSnapshot: {
                overall: { score: 91, title: 'Stale overall', detail: 'Stale detail' },
                career: { score: 88, title: 'Stale career' },
                love: { score: 73, title: 'Stale love' },
                health: { score: 69, title: 'Stale health' },
            },
            scoreVersion: FORTUNE_SCORE_VERSION - 1,
        });
        const recomputed = buildFortune(data.aiResult, {
            fiveElements: data.fiveElements,
            shinsal: data.shinsal,
        });

        const ui = mapHistoryToUI(data);

        expect(ui.score).toBe(recomputed.overall.score);
        expect(ui.fortune.overall.title).toBe(recomputed.overall.title);
        expect(ui.fortune.career.score).toBe(recomputed.career.score);
    });

    it('handles legacy history entries without dayMaster or extras', () => {
        const ui = mapHistoryToUI(createSajuData({
            schemaVersion: undefined,
            dayMaster: undefined,
            shinsal: undefined,
            soulmate: undefined,
            fortuneSnapshot: undefined,
            scoreVersion: undefined,
        }));

        expect(ui.dayMaster.hanja).toBe('庚');
        expect(ui.shinsal).toBeUndefined();
        expect(ui.soulmate).toBeUndefined();
        expect(ui.rawData?.history?.schemaVersion).toBe(0);
    });
});
