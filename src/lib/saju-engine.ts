import { Solar, Lunar } from 'lunar-javascript';
import {
  ELEMENT_MAP,
  TEN_GODS,
  TWELVE_UNSEONG,
  ELEMENT_KOREAN,
  JI_JI_TO_GAN,
  GAN_HAP,
  GAN_CHUNG,
  ZHI_YUK_HAP,
  ZHI_CHUNG,
  ZHI_SAM_HAP
} from './saju-data';
import { CompatibilityResult, SajuData } from '@/types';

export interface SajuPillar {
  heavenlyStem: string;
  earthlyBranch: string;
  element: string; // 천간의 오행 (UI 표시용)
  tenGod: string;  // 십신 (비견, 겁재 등) - 지지 포함 (지지는 정기 기준)
  unseong: string; // 12운성 (장생, 목욕 등)
}

export interface SajuResult {
  fourPillars: {
    year: SajuPillar;
    month: SajuPillar;
    day: SajuPillar;
    hour: SajuPillar;
  };
  dayMaster: string;       // 일간 (예: 갑목)
  dominantElement: string; // 최강 오행 (가중치 적용)
  weakElement: string;     // 최약 오행
  lunarDate: string;       // 음력 날짜
  interpretation: {        // 해석 데이터
    dominanceMsg: string;
    personalityKeywords: string[];
  };
  daewoon?: {              // 2.1 대운 추가
    startAge: number;
    cycles: {
      startAge: number;
      endAge: number;
      ganZhi: string;
      tenGod: string;
      unseong: string;
    }[];
  };
  soulmate?: {
    id: string;
    name: string;
    title: string;
    desc: string;
    quote: string;
    connectionMsg: string;
    imgUrl?: string;
  };
  shinsal?: {
    dohwa: { has: boolean; count: number; description: string };
    yeokma: { has: boolean; count: number; description: string };
    hwagae: { has: boolean; count: number; description: string };
  };
  fiveElements?: {
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
  };
}

export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: 'male' | 'female' | 'M' | 'F',
  calendarType: 'solar' | 'lunar' = 'solar'
): SajuResult {
  // 1. 만세력 기준 시간 계산 (lunar-javascript 활용)
  let solar;
  if (calendarType === 'lunar') {
    const lunar = Lunar.fromYmdHms(year, month, day, hour, minute, 0);
    solar = lunar.getSolar();
  } else {
    solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  }
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 2. 천간/지지 추출
  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();
  const timeGan = eightChar.getTimeGan();
  const timeZhi = eightChar.getTimeZhi();

  const dayMasterChar = dayGan; // 일간

  // 3. 기둥별 데이터 생성 (십신, 12운성 포함)
  const getPillar = (gan: string, zhi: string): SajuPillar => {
    // 천간 십신
    const ganTenGod = (TEN_GODS as any)[dayMasterChar]?.[gan] || '';

    // 지지 십신 (지장간의 정기 기준)
    // 지지를 천간으로 변환하여 십신을 찾음
    const zhiAsGan = JI_JI_TO_GAN[zhi] || '';
    const zhiTenGod = (TEN_GODS as any)[dayMasterChar]?.[zhiAsGan] || '';

    // 12운성 (일간 기준 지지의 힘)
    const unseong = (TWELVE_UNSEONG as any)[dayMasterChar]?.[zhi] || '';

    const elType = ELEMENT_MAP[gan] || 'Unknown';

    return {
      heavenlyStem: gan,
      earthlyBranch: zhi,
      element: ELEMENT_KOREAN[elType] || elType,
      tenGod: `${ganTenGod}/${zhiTenGod}`, // 천간/지지 십신 표기
      unseong: unseong,
    };
  };

  const fourPillars = {
    year: getPillar(yearGan, yearZhi),
    month: getPillar(monthGan, monthZhi),
    day: getPillar(dayGan, dayZhi),
    hour: getPillar(timeGan, timeZhi),
  };

  // 4. 오행 갯수 및 강약 계산 (가중치 적용)
  // 월지(태어난 달)가 가장 강력함 (x 2.5), 일지/시지 (x 1.5), 나머지 (x 1.0)
  const scores: Record<string, number> = { 'Tree': 0, 'Fire': 0, 'Earth': 0, 'Metal': 0, 'Water': 0 };

  const addScore = (char: string, weight: number) => {
    const el = ELEMENT_MAP[char];
    if (el && scores[el] !== undefined) scores[el] += weight;
  };

  addScore(yearGan, 1.0); addScore(yearZhi, 1.0);
  addScore(monthGan, 1.0); addScore(monthZhi, 2.5); // 월지 가중치
  addScore(dayGan, 1.0); addScore(dayZhi, 1.5);   // 일지 가중치
  addScore(timeGan, 1.0); addScore(timeZhi, 1.0);

  let maxScore = -1;
  let minScore = 999;
  let dominant = 'Unknown';
  let weak = 'Unknown';

  Object.entries(scores).forEach(([el, score]) => {
    if (score > maxScore) { maxScore = score; dominant = el; }
    if (score < minScore) { minScore = score; weak = el; }
  });

  // 0점인 오행 처리
  const zeroElements = Object.entries(scores).filter(([, s]) => s === 0).map(([k]) => k);
  if (zeroElements.length > 0) weak = zeroElements[0];

  // 6. 대운 (Daewoon) 계산
  const genderNum = (gender === 'male' || gender === 'M') ? 1 : 0;
  const yun = eightChar.getYun(genderNum);
  const daYunArr = yun.getDaYun();

  const daewoonCycles = daYunArr.slice(0, 10).map((dy: any) => {
    const ganZhi = dy.getGanZhi();
    const gan = ganZhi.charAt(0);
    const zhi = ganZhi.charAt(1);

    // 대운의 십신 (일간 기준)
    // 천간
    // const stemTenGod = (TEN_GODS as any)[dayMasterChar]?.[gan] || '';
    // 지지 (Based on standard, Daewoon Ten God is usually Gan vs DayMaster and Zhi vs DayMaster)
    // For simplified view, we can just show the GanZhi and start age.
    // Or calculate them:
    const stemTenGod = (TEN_GODS as any)[dayMasterChar]?.[gan] || '';
    const zhiAsGan = JI_JI_TO_GAN[zhi] || '';
    const zhiTenGod = (TEN_GODS as any)[dayMasterChar]?.[zhiAsGan] || '';

    // 12운성 (대운 지지 vs 일간)
    const unseong = (TWELVE_UNSEONG as any)[dayMasterChar]?.[zhi] || '';

    return {
      startAge: dy.getStartAge(),
      endAge: dy.getEndAge(),
      ganZhi: ganZhi,
      tenGod: `${stemTenGod}/${zhiTenGod}`,
      unseong: unseong
    };
  });

  // 7. 해석 생성 & 리턴
  const dayMasterElement = ELEMENT_MAP[dayMasterChar];
  const dominanceMsg = `당신은 ${ELEMENT_KOREAN[dayMasterElement] || dayMasterElement}의 기운을 타고났으며, ${ELEMENT_KOREAN[dominant]} 기운이 가장 강합니다.`;

  // 성격 키워드 (일지 십신 기준 단순 매핑 예시)
  const dayZhiTenGod = fourPillars.day.tenGod.split('/')[1];
  const personalityKeywords = [dayZhiTenGod, fourPillars.day.unseong, ELEMENT_KOREAN[dominant]].filter(Boolean);

  // 8. 신살 (Symoblic Stars) 계산 (v4.2)
  const branches = [yearZhi, monthZhi, dayZhi, timeZhi];

  // Dohwa (Peach Blossom): Ja, Myo, Oh, Yu
  const dohmaChars = ['子', '卯', '午', '酉'];
  const dohmaCount = branches.filter(b => dohmaChars.includes(b)).length;

  // Yeokma (Travel): In, Shin, Sa, Hae
  const yeokmaChars = ['寅', '申', '巳', '亥'];
  const yeokmaCount = branches.filter(b => yeokmaChars.includes(b)).length;

  // Hwagae (Art): Jin, Sul, Chuk, Mi
  const hwagaeChars = ['辰', '戌', '丑', '未'];
  const hwagaeCount = branches.filter(b => hwagaeChars.includes(b)).length;

  return {
    fourPillars,
    dayMaster: `${dayMasterChar}(${ELEMENT_KOREAN[dayMasterElement]})`,
    dominantElement: ELEMENT_KOREAN[dominant] || dominant,
    weakElement: ELEMENT_KOREAN[weak] || weak,
    lunarDate: lunar.toFullString(),
    daewoon: {
      startAge: daYunArr[0].getStartAge(),
      cycles: daewoonCycles
    },
    shinsal: {
      dohwa: {
        has: dohmaCount > 0,
        count: dohmaCount,
        description: dohmaCount > 0 ? "타인의 시선을 사로잡는 매력과 끼가 있습니다." : "담백하고 솔직한 매력이 있습니다."
      },
      yeokma: {
        has: yeokmaCount > 0,
        count: yeokmaCount,
        description: yeokmaCount > 0 ? "활동적이고 이동수가 많아 변화를 즐깁니다." : "한 곳에 머무르며 깊이를 더하는 성향입니다."
      },
      hwagae: {
        has: hwagaeCount > 0,
        count: hwagaeCount,
        description: hwagaeCount > 0 ? "예술적 감수성과 종교적/철학적 깊이가 있습니다." : "현실적이고 실용적인 감각이 발달했습니다."
      }
    },
    fiveElements: {
      wood: scores['Tree'],
      fire: scores['Fire'],
      earth: scores['Earth'],
      metal: scores['Metal'],
      water: scores['Water'],
      dominant: dominant,
      lacking: weak,
      scores: {
        wood: scores['Tree'],
        fire: scores['Fire'],
        earth: scores['Earth'],
        metal: scores['Metal'],
        water: scores['Water']
      }
    },
    interpretation: {
      dominanceMsg,
      personalityKeywords
    }
  };
}

export function calculateCompatibility(sajuA: SajuData, sajuB: SajuData): CompatibilityResult {
  const dmA = sajuA.fourPillars.day.heavenlyStem;
  const dmB = sajuB.fourPillars.day.heavenlyStem;
  const dbA = sajuA.fourPillars.day.earthlyBranch;
  const dbB = sajuB.fourPillars.day.earthlyBranch;

  let score = 50; // Base score
  let ganChem = 'Neutral';
  let zhiChem = 'Neutral';
  let summary = 'A balanced relationship.';
  let advice = 'Respect each other\'s differences.';

  // 1. Day Master Compatibility (Mental/Spirit)
  if (GAN_HAP[dmA] === dmB) {
    score += 25;
    ganChem = 'Perfect Match (Gan-Hap)';
    summary = 'Soulmate connection with strong mental affinity.';
  } else if (GAN_CHUNG[dmA]?.includes(dmB)) {
    score -= 10;
    ganChem = 'Clash (Gan-Chung)';
    summary = 'Intense spark but potential for conflict.';
    advice = 'Practice patience and avoid ego clashes.';
  } else {
    score += 5;
    ganChem = 'Supportive';
  }

  // 2. Day Branch Compatibility (Physical/Reality)
  if (ZHI_YUK_HAP[dbA] === dbB) {
    score += 20;
    zhiChem = 'Harmony (Yuk-Hap)';
  } else if (ZHI_SAM_HAP[dbA]?.some(h => [dbB].includes(h)) || ZHI_SAM_HAP[dbA]?.includes(dbB)) { // Simplified check
    score += 15;
    zhiChem = 'Alliance (Sam-Hap)';
  } else if (ZHI_CHUNG[dbA] === dbB) {
    score -= 15;
    zhiChem = 'Conflict (Chung)';
    advice += ' Be mindful of lifestyle differences.';
  } else {
    score += 5;
    zhiChem = 'Stable';
  }

  // 3. Element Complement (Do they fill each other's gaps?)
  // Need SajuResult which has 'fiveElements', but SajuData might not have it strictly typed safely yet if passed from UI state
  // assuming valid inputs
  let elementScore = 0;
  const lackA = sajuA.fiveElements?.lacking;
  const domB = sajuB.fiveElements?.dominant;

  if (lackA && domB && lackA === domB) {
    score += 15;
    elementScore += 15;
    summary += ' You fill each other\'s voids perfectly.';
  }

  // Clamp score
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    sajuA: sajuA,
    sajuB: sajuB,
    summary,
    dayMasterChemistry: ganChem,
    elementBalance: `Mutual Complement Score: ${elementScore}`,
    advice,
    details: {
      ganChemistry: ganChem,
      zhiChemistry: zhiChem,
      elementScore
    }
  };
}

