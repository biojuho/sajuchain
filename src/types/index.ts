export interface PillarData {
    heavenlyStem: string;
    earthlyBranch: string;
    element?: string;
    tenGod?: string;  // 십신 (비견, 겁재 등)
    unseong?: string; // 12운성
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
    daewoonAnalysis?: string; // New field for Deep AI
    yearFortune2026: string;
    luckyItems: {
        color: string;
        number: string | number; // Allow both for flexibility
        direction: string;
    };
    advice: string;
    // Previously 'summary.overallFortune' from mock, mapping to 'headline' or 'advice' can be done,
    // but let's keep it flexible or add an optional field if needed.
    overallFortune?: string;
}

export interface AIPremiumResult {
    yearFlow: string;
    relationshipDeepDive: string;
}

export interface DaewoonCycle {
    startAge: number;
    endAge: number;
    ganZhi: string; // 간지 (예: 甲子)
    tenGod: string; // 십신 (천간/지지 복합 or 주요 십신)
    unseong: string; // 12운성
}

export interface CompatibilityResult {
    score: number;
    sajuA: SajuData;
    sajuB: SajuData;
    summary: string;
    dayMasterChemistry: string; // e.g., "Mental Connection"
    elementBalance: string;     // e.g., "Mutual Growth"
    advice: string;
    details: {
        ganChemistry: string;
        zhiChemistry: string;
        elementScore: number;
    };
}

export interface SajuData {
    // Basic Info
    name?: string; // Optional as we often don't collect name
    birthDate: string;
    birthTime?: string;
    gender: 'male' | 'female' | 'M' | 'F';
    calendarType?: 'solar' | 'lunar';
    birthPlace?: string;

    // Core Saju Data
    fourPillars: FourPillarsData;
    fiveElements?: FiveElementsData; // Optional if not always calculated immediately
    dayMaster?: string | { hanja: string; element: string; name: string; };

    // AI Interpretation
    aiResult?: AIResult;
    aiPremiumResult?: AIPremiumResult;

    // Saju Engine v2.0 Enrichment
    sajuInterpretation?: {
        dominanceMsg: string;
        personalityKeywords: string[];
    };

    // Saju Engine v2.1 Daewoon
    daewoon?: {
        startAge: number; // 대운 시작 나이 (만 나이 아님, 한국식 세는 나이 기준이 일반적이나 lunar-javascript는 만나이/세는나이 옵션 확인 필요)
        cycles: DaewoonCycle[];
    };

    // Metadata
    generatedAt?: string;
    uniqueHash?: string;
}
