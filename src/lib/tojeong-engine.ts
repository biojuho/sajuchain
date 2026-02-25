import { Lunar } from 'lunar-javascript';

export interface MonthlyFortune {
    month: number;
    monthName: string;
    fortune: string;
    rating: number; // 1-5
    keyword: string;
}

export interface TojeongResult {
    code: string; // e.g. "421" (Upper-Middle-Lower)
    sang: number; // 1~8 (Upper)
    joong: number; // 1~6 (Middle)
    ha: number; // 1~3 (Lower)
    meaning: {
        sang: string;
        joong: string;
        ha: string;
    };
    monthly: MonthlyFortune[];
}

// Traditional trigram names (simplified for Tojeong)
const TRIGRAMS_8 = ['', '건(Sky)', '태(Lake)', '이(Fire)', '진(Thunder)', '손(Wind)', '감(Water)', '간(Mountain)', '곤(Earth)'];
// const VISUAL_6... removed
// const VISUAL_3... removed

// Deterministic Pseudo-Lookup Table Generator
// Since we don't have the full 144-year 'Jogyeonpyo', we simulate it using the Year's GanZhi as a seed.
// This ensures that for the same year, the "TaeSeSu" is constant.
function getTaeSeSu(year: number): number {
    // Determine GanZhi to make it somewhat authentic
    const lunar = Lunar.fromYmd(year, 1, 1);
    const complexSeed = year * 13 + lunar.getYearGanIndex() * 7 + lunar.getYearZhiIndex() * 3;
    // Map to valid range typical for TaeSeSu (often 1-12 or similar, but for the formula (Age + T) % 8, any int is fine)
    return (complexSeed % 20) + 1; 
}

function getWolGeonSu(year: number, month: number): number {
    // WolGeon depends on Year Gan and Month Branch
    return ((year + month) * 7) % 20 + 1;
}

function getIlJinSu(year: number, month: number, day: number): number {
    return ((year + month + day) * 3) % 20 + 1;
}

export function calculateTojeong(
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    targetYear: number
): TojeongResult {

    // 1. Calculate Korean Age (Se-neun Nai)
    const age = targetYear - birthYear + 1;

    // 2. Sang-Kwae (Upper): (Age + TaeSeSu) % 8
    const taeSeSu = getTaeSeSu(targetYear);
    let sang = (age + taeSeSu) % 8;
    if (sang === 0) sang = 8;

    // 3. Joong-Kwae (Middle): (Month + WolGeonSu) % 6
    const wolGeonSu = getWolGeonSu(targetYear, birthMonth);
    let joong = (birthMonth + wolGeonSu) % 6;
    if (joong === 0) joong = 6;

    // 4. Ha-Kwae (Lower): (Day + IlJinSu) % 3
    const ilJinSu = getIlJinSu(targetYear, birthMonth, birthDay);
    let ha = (birthDay + ilJinSu) % 3;
    if (ha === 0) ha = 3;

    // Tojeong Trigram Mappings (Simplified for AI Context)
    // Sang (Upper 1-8): Sky, Lake, Fire, Thunder, Wind, Water, Mountain, Earth
    // Joong (Middle 1-6): Corresponds to 6 Monthly Hexagrams variants
    // Ha (Lower 1-3): Corresponds to 3 Daily factors (Heaven, Earth, Man)
    
    const JOONG_MEANINGS = ['', 'Spring/Growth', 'Summer/Expansion', 'Autumn/Harvest', 'Winter/Storage', 'Center/Balance', 'Transition/Change'];
    const HA_MEANINGS = ['', 'Heavenly Luck (Opportunity)', 'Earthly Luck (Environment)', 'Human Luck (Effort)'];

    return {
        code: `${sang}${joong}${ha}`,
        sang,
        joong,
        ha,
        meaning: {
            sang: `${TRIGRAMS_8[sang]} (Energy: ${['', 'Strong Yang', 'Joy', 'Passion', 'Action', 'Gentleness', 'Wisdom', 'Stability', 'Receptivity'][sang]})`,
            joong: `${joong} - ${JOONG_MEANINGS[joong]}`,
            ha: `${ha} - ${HA_MEANINGS[ha]}`
        },
        monthly: generateMonthlyFortunes(sang, joong, ha, birthYear, birthMonth, birthDay),
    };
}

// --- Monthly Fortune Generation ---

const MONTHLY_TEXTS: Record<string, string[]> = {
    great: [
        '만사형통의 기운이 가득합니다. 새로운 시작에 최적의 시기입니다.',
        '귀인이 나타나 큰 도움을 받을 수 있습니다. 인연을 소중히 하세요.',
        '재물운이 크게 상승합니다. 투자와 계약에 좋은 달입니다.',
        '뜻한 바가 이루어지는 달입니다. 자신감을 가지고 추진하세요.',
    ],
    good: [
        '전반적으로 순조로운 흐름입니다. 꾸준한 노력이 결실을 맺습니다.',
        '소소한 기쁨이 찾아오는 달입니다. 주변 사람들과 나누세요.',
        '안정적인 운세입니다. 현재 하는 일에 집중하면 좋은 결과가 있습니다.',
        '건강이 좋아지는 시기입니다. 운동을 시작하기에 좋습니다.',
    ],
    neutral: [
        '큰 변화 없이 평탄한 달입니다. 내면을 돌아보는 시간을 가지세요.',
        '기다림이 필요한 시기입니다. 조급함을 버리면 길이 열립니다.',
        '작은 시련이 있으나 금방 지나갑니다. 침착하게 대처하세요.',
        '배움의 시기입니다. 새로운 것을 익히면 좋은 기회가 옵니다.',
    ],
    caution: [
        '건강관리에 특히 신경 쓰세요. 과로를 피하고 충분히 쉬세요.',
        '금전적 지출이 많을 수 있습니다. 절약하는 자세가 필요합니다.',
        '대인관계에서 오해가 생길 수 있습니다. 말을 아끼세요.',
        '변화를 서두르지 마세요. 때를 기다리는 지혜가 필요합니다.',
    ],
};

const MONTHLY_KEYWORDS: Record<string, string[]> = {
    great: ['대길', '형통', '발복', '귀인'],
    good: ['순조', '안정', '성장', '길'],
    neutral: ['평온', '기다림', '내면', '준비'],
    caution: ['주의', '절제', '인내', '신중'],
};

function generateMonthlyFortunes(
    sang: number, joong: number, ha: number,
    birthYear: number, birthMonth: number, birthDay: number
): MonthlyFortune[] {
    const monthly: MonthlyFortune[] = [];

    for (let m = 1; m <= 12; m++) {
        const seed = (sang * 100 + joong * 10 + ha) * 13 + m * 7 + birthYear * 3 + birthMonth * 5 + birthDay;
        const ratingBase = ((seed * 17 + m * 23) % 100);

        let rating: number;
        let level: string;

        if (ratingBase >= 80) { rating = 5; level = 'great'; }
        else if (ratingBase >= 55) { rating = 4; level = 'good'; }
        else if (ratingBase >= 30) { rating = 3; level = 'neutral'; }
        else { rating = 2; level = 'caution'; }

        const pool = MONTHLY_TEXTS[level];
        const textIdx = (seed * 31 + m) % pool.length;
        const kwPool = MONTHLY_KEYWORDS[level];
        const kwIdx = (seed * 11 + m * 3) % kwPool.length;

        monthly.push({
            month: m,
            monthName: `${m}월`,
            fortune: pool[textIdx],
            rating,
            keyword: kwPool[kwIdx],
        });
    }

    return monthly;
}
