export interface FourPillarsData {
    yearPillar: { heavenlyStem: string; earthlyBranch: string; element?: string };
    monthPillar: { heavenlyStem: string; earthlyBranch: string; element?: string };
    dayPillar: { heavenlyStem: string; earthlyBranch: string; element?: string };
    hourPillar: { heavenlyStem: string; earthlyBranch: string; element?: string };
}

export interface FiveElementsData {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
    dominant: string;
    lacking: string;
}

export interface AIResult {
    headline: string;
    threeLineSummary: string[];
    personality: string;
    career: string;
    relationship: string;
    health: string;
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

export interface SajuData {
    // Basic Info
    name?: string; // Optional as we often don't collect name
    birthDate: string;
    birthTime?: string;
    gender: 'male' | 'female' | 'M' | 'F';
    calendarType?: 'solar' | 'lunar';

    // Core Saju Data
    fourPillars: FourPillarsData;
    fiveElements?: FiveElementsData; // Optional if not always calculated immediately
    dayMaster?: string;

    // AI Interpretation
    aiResult?: AIResult;

    // Metadata
    generatedAt?: string;
    uniqueHash?: string;
}
