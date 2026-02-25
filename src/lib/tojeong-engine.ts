import { Lunar } from 'lunar-javascript';

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
        }
    };
}
