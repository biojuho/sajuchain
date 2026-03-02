export interface PillarData {
    heavenlyStem: string;
    earthlyBranch: string;
    element?: string;
    tenGod?: string;
    unseong?: string;
}

export interface FourPillarsData {
    year: PillarData;
    month: PillarData;
    day: PillarData;
    hour: PillarData;
}

export interface FiveElementsData {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
    dominant: string;
    lacking: string;
    scores: {
        wood: number;
        fire: number;
        earth: number;
        metal: number;
        water: number;
    };
}

export interface AIResult {
    headline: string;
    threeLineSummary: string[];
    personality: string;
    career: string;
    relationship: string;
    health: string;
    daewoonAnalysis?: string;
    yearFortune2026: string;
    luckyItems: {
        color: string;
        number: string | number;
        direction: string;
    };
    advice: string;
    overallFortune?: string;
}

export interface AIPremiumResult {
    yearFlow: string;
    relationshipDeepDive: string;
}

export interface DaewoonCycle {
    startAge: number;
    endAge: number;
    ganZhi: string;
    tenGod: string;
    unseong: string;
}

export interface ShinsalData {
    dohwa: { has: boolean; count: number; description: string };
    yeokma: { has: boolean; count: number; description: string };
    hwagae: { has: boolean; count: number; description: string };
}

export interface SoulmateData {
    name: string;
    title: string;
    quote: string;
    connectionMsg: string;
    id?: string;
    desc?: string;
    imgUrl?: string;
}

export interface FortuneEntry {
    score: number;
    title?: string;
    detail?: string;
    locked?: boolean;
    dos?: string[];
    donts?: string[];
    idealMatch?: string;
    organs?: string[];
    activities?: string[];
}

export type FortuneResult = Record<string, FortuneEntry>;

export interface CompatibilityResult {
    score: number;
    sajuA: SajuData;
    sajuB: SajuData;
    summary: string;
    dayMasterChemistry: string;
    elementBalance: string;
    advice: string;
    details: {
        ganChemistry: string;
        zhiChemistry: string;
        elementScore: number;
    };
}

export interface SajuData {
    schemaVersion?: number;
    name?: string;
    birthDate: string;
    birthTime?: string;
    gender: 'male' | 'female' | 'M' | 'F';
    calendarType?: 'solar' | 'lunar';
    birthPlace?: string;
    fourPillars: FourPillarsData;
    fiveElements?: FiveElementsData;
    dayMaster?: string | { hanja: string; element: string; name: string };
    aiResult?: AIResult;
    aiPremiumResult?: AIPremiumResult;
    sajuInterpretation?: {
        dominanceMsg: string;
        personalityKeywords: string[];
    };
    daewoon?: {
        startAge: number;
        cycles: DaewoonCycle[];
    };
    shinsal?: ShinsalData;
    soulmate?: SoulmateData;
    fortuneSnapshot?: FortuneResult;
    scoreVersion?: number;
    generatedAt?: string;
    uniqueHash?: string;
}
