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
import {
  CompatibilityResult,
  DaewoonCycle,
  FiveElementsData,
  SajuData,
  ShinsalData,
  SoulmateData,
} from '@/types';

type TenGodsMapping = Record<string, Record<string, string>>;

const ELEMENT_RELATIONS: Record<string, { support: string[], drain: string[] }> = {
  'Tree': { support: ['Tree', 'Water'], drain: ['Fire', 'Earth', 'Metal'] },
  'Fire': { support: ['Fire', 'Tree'], drain: ['Earth', 'Metal', 'Water'] },
  'Earth': { support: ['Earth', 'Fire'], drain: ['Metal', 'Water', 'Tree'] },
  'Metal': { support: ['Metal', 'Earth'], drain: ['Water', 'Tree', 'Fire'] },
  'Water': { support: ['Water', 'Metal'], drain: ['Tree', 'Fire', 'Earth'] },
};

// 백호대살 간지 조합
const BAEKHO_PILLARS = ['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '壬戌', '癸丑'];
// 괴강살 간지 조합
const GWEGANG_PILLARS = ['戊戌', '庚戌', '庚辰', '壬戌', '壬辰'];
// 원진살 지지 쌍
const WONJIN_PAIRS = [['子', '未'], ['丑', '午'], ['寅', '酉'], ['卯', '申'], ['辰', '亥'], ['巳', '戌']];
// 귀문관살 지지 쌍
const GWIMUN_PAIRS = [['子', '酉'], ['丑', '午'], ['寅', '未'], ['卯', '申'], ['辰', '亥'], ['巳', '戌']];
// 천을귀인 (일간 기준 -> 지지)
const CHEONEUL_MAP: Record<string, string[]> = {
  '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['亥', '酉'],
  '辛': ['寅', '午'],
  '壬': ['卯', '巳'], '癸': ['卯', '巳']
};

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
  dayMaster: { hanja: string; element: string; name: string };       // 일간 객체
  dominantElement: string; // 최강 오행 (가중치 적용)
  weakElement: string;     // 최약 오행
  lunarDate: string;       // 음력 날짜
  interpretation: {        // 해석 데이터
    dominanceMsg: string;
    personalityKeywords: string[];
  };
  daewoon?: {              // 2.1 대운 추가
    startAge: number;
    cycles: DaewoonCycle[];
  };
  sewoon?: {
    year: number;
    ganZhi: string;
    tenGod: string;
    unseong: string;
  };
  soulmate?: SoulmateData;
  shinsal?: ShinsalData;
  fiveElements?: FiveElementsData;
}

export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: 'male' | 'female' | 'M' | 'F',
  calendarType: 'solar' | 'lunar' = 'solar',
  isSummerTime: boolean = false
): SajuResult {
  // 1. 만세력 기준 시간 계산 (lunar-javascript 활용)
  let solar;
  try {
    if (calendarType === 'lunar') {
      // 음력 입력의 경우 썸머타임 보정을 위해 양력으로 변환 후 안전한 Date 객체로 시간 조정
      const baseLunar = Lunar.fromYmdHms(year, month, day, hour, minute, 0);
      solar = baseLunar.getSolar();

      if (isSummerTime) {
        const date = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute());
        date.setHours(date.getHours() - 1);
        solar = Solar.fromDate(date);
      }
    } else {
      // Solar.fromYmdHms는 월/일 넘침을 자동 처리하지 않을 수 있으므로 Date 객체 활용이 안전
      const date = new Date(year, month - 1, day, hour, minute);
      if (isSummerTime) {
        date.setHours(date.getHours() - 1);
      }
      solar = Solar.fromDate(date);
    }
  } catch (e) {
    throw new Error(`Invalid date input (${year}-${month}-${day} ${hour}:${minute}): ${e instanceof Error ? e.message : e}`);
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
    const ganTenGod = (TEN_GODS as TenGodsMapping)[dayMasterChar]?.[gan] || '';

    // 지지 십신 (지장간의 정기 기준)
    // 지지를 천간으로 변환하여 십신을 찾음
    const zhiAsGan = JI_JI_TO_GAN[zhi] || '';
    const zhiTenGod = (TEN_GODS as TenGodsMapping)[dayMasterChar]?.[zhiAsGan] || '';

    // 12운성 (일간 기준 지지의 힘)
    const unseong = TWELVE_UNSEONG[dayMasterChar]?.[zhi] || '';

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

  // 5. 신강/신약 및 용신/기신 계산
  const dayMasterElement = ELEMENT_MAP[dayMasterChar] || 'Unknown';
  const relations = ELEMENT_RELATIONS[dayMasterElement];
  let supportScore = 0;
  let drainScore = 0;

  if (relations) {
    relations.support.forEach(el => { supportScore += scores[el] || 0; });
    relations.drain.forEach(el => { drainScore += scores[el] || 0; });
  }

  const isStrongSaju = supportScore >= drainScore;

  let yongshin = 'Unknown';
  let gishin = 'Unknown';

  if (relations) {
    if (isStrongSaju) {
      // 신강: 나를 억제하고 빼앗는 기운(식상, 재성, 관성) 중 점수가 제일 낮은 것이 용신 (가장 필요한 기운)
      let minScore = 999;
      relations.drain.forEach(el => {
        if (scores[el] < minScore) { minScore = scores[el]; yongshin = el; }
      });
      // 기신: 나를 돕는 기운(비겁, 인성) 중 점수가 제일 높은 것 (넘치는 기운)
      let maxScore = -1;
      relations.support.forEach(el => {
        if (scores[el] > maxScore) { maxScore = scores[el]; gishin = el; }
      });
    } else {
      // 신약: 나를 돕는 기운(비겁, 인성) 중 점수가 제일 최하위인 것 또는 없는 것을 용신으로 보충
      let minScore = 999;
      relations.support.forEach(el => {
        if (scores[el] < minScore) { minScore = scores[el]; yongshin = el; }
      });
      // 기신: 나를 억제하고 빼앗는 기운(식상, 재성, 관성) 중 점수가 제일 높은 것 (힘들게 하는 기운)
      let maxScore = -1;
      relations.drain.forEach(el => {
        if (scores[el] > maxScore) { maxScore = scores[el]; gishin = el; }
      });
    }
  }

  // 6. 대운 (Daewoon) 계산
  const genderNum = (gender === 'male' || gender === 'M') ? 1 : 0;
  const yun = eightChar.getYun(genderNum);
  const daYunArr = yun.getDaYun();

  const daewoonCycles = daYunArr.slice(0, 10).map((dy: { getGanZhi(): string; getStartAge(): number; getEndAge(): number }) => {
    const ganZhi = dy.getGanZhi();
    const gan = ganZhi.charAt(0);
    const zhi = ganZhi.charAt(1);

    // 대운의 십신 (일간 기준)
    // 천간
    // const stemTenGod = (TEN_GODS as Record<string, Record<string, string>>)[dayMasterChar]?.[gan] || '';
    // 지지 (Based on standard, Daewoon Ten God is usually Gan vs DayMaster and Zhi vs DayMaster)
    // For simplified view, we can just show the GanZhi and start age.
    // Or calculate them:
    const stemTenGod = (TEN_GODS as TenGodsMapping)[dayMasterChar]?.[gan] || '';
    const zhiAsGan = JI_JI_TO_GAN[zhi] || '';
    const zhiTenGod = (TEN_GODS as TenGodsMapping)[dayMasterChar]?.[zhiAsGan] || '';

    // 12운성 (대운 지지 vs 일간)
    const unseong = TWELVE_UNSEONG[dayMasterChar]?.[zhi] || '';

    return {
      startAge: dy.getStartAge(),
      endAge: dy.getEndAge(),
      ganZhi: ganZhi,
      tenGod: `${stemTenGod}/${zhiTenGod}`,
      unseong: unseong
    };
  });

  // 7. 세운 (Sewoon - 올해의 운세) 계산
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentLunarYear = Solar.fromDate(now).getLunar();
  const sewoonGanZhi = currentLunarYear.getYearInGanZhi();
  const sewoonGan = sewoonGanZhi.charAt(0);
  const sewoonZhi = sewoonGanZhi.charAt(1);

  const sewoonStemTenGod = (TEN_GODS as TenGodsMapping)[dayMasterChar]?.[sewoonGan] || '';
  const sewoonZhiAsGan = JI_JI_TO_GAN[sewoonZhi] || '';
  const sewoonZhiTenGod = (TEN_GODS as TenGodsMapping)[dayMasterChar]?.[sewoonZhiAsGan] || '';
  const sewoonUnseong = TWELVE_UNSEONG[dayMasterChar]?.[sewoonZhi] || '';

  const sewoonData = {
    year: currentYear,
    ganZhi: sewoonGanZhi,
    tenGod: `${sewoonStemTenGod}/${sewoonZhiTenGod}`,
    unseong: sewoonUnseong
  };

  // 8. 해석 생성 & 리턴
  const dominanceMsg = `당신은 ${ELEMENT_KOREAN[dayMasterElement] || dayMasterElement}의 기운을 타고났으며, ${ELEMENT_KOREAN[dominant]} 기운이 가장 강합니다.`;

  // 성격 키워드 (일지 십신 기준 단순 매핑 예시)
  const dayZhiTenGod = fourPillars.day.tenGod?.split('/')[1] || '';
  const personalityKeywords = [dayZhiTenGod, fourPillars.day.unseong, ELEMENT_KOREAN[dominant]].filter(Boolean);

  // 8. 신살 (Symbolic Stars) 계산 (v4.2)
  const branches = [yearZhi, monthZhi, dayZhi, timeZhi];
  const pillarsGanZhi = [
    yearGan + yearZhi,
    monthGan + monthZhi,
    dayGan + dayZhi,
    timeGan + timeZhi
  ];

  // Dohwa (Peach Blossom): Ja, Myo, Oh, Yu
  const dohwaChars = ['子', '卯', '午', '酉'];
  const dohwaCount = branches.filter(b => dohwaChars.includes(b)).length;

  // Yeokma (Travel): In, Shin, Sa, Hae
  const yeokmaChars = ['寅', '申', '巳', '亥'];
  const yeokmaCount = branches.filter(b => yeokmaChars.includes(b)).length;

  // Hwagae (Art): Jin, Sul, Chuk, Mi
  const hwagaeChars = ['辰', '戌', '丑', '未'];
  const hwagaeCount = branches.filter(b => hwagaeChars.includes(b)).length;

  // 백호/괴강 계산
  const baekhoPillars = pillarsGanZhi.filter(p => BAEKHO_PILLARS.includes(p));
  const gwegangPillars = pillarsGanZhi.filter(p => GWEGANG_PILLARS.includes(p));

  // 원진/귀문 계산
  const wonjinPairsFound: string[] = [];
  WONJIN_PAIRS.forEach(pair => {
    if (branches.includes(pair[0]) && branches.includes(pair[1])) {
      wonjinPairsFound.push(`${pair[0]}-${pair[1]}`);
    }
  });

  const gwimunPairsFound: string[] = [];
  GWIMUN_PAIRS.forEach(pair => {
    if (branches.includes(pair[0]) && branches.includes(pair[1])) {
      gwimunPairsFound.push(`${pair[0]}-${pair[1]}`);
    }
  });

  // 천을귀인 계산
  const cheoneulBranches = CHEONEUL_MAP[dayMasterChar] || [];
  const cheoneulFound = branches.filter(b => cheoneulBranches.includes(b));

  return {
    fourPillars,
    dayMaster: {
      hanja: dayMasterChar,
      element: ELEMENT_KOREAN[dayMasterElement] || dayMasterElement,
      name: '일간(본인)'
    },
    dominantElement: ELEMENT_KOREAN[dominant] || dominant,
    weakElement: ELEMENT_KOREAN[weak] || weak,
    lunarDate: lunar.toFullString(),
    daewoon: {
      startAge: daYunArr[0].getStartAge(),
      cycles: daewoonCycles
    },
    sewoon: sewoonData,
    shinsal: {
      dohwa: {
        has: dohwaCount > 0,
        count: dohwaCount,
        description: dohwaCount > 0 ? "타인의 시선을 사로잡는 매력과 끼가 있습니다." : "담백하고 솔직한 매력이 있습니다."
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
      },
      baekho: {
        has: baekhoPillars.length > 0,
        description: "폭발적인 에너지와 결단력을 지니어, 큰 성취를 이룰 수 있는 잠재력이 있습니다.",
        pillars: baekhoPillars
      },
      gwegang: {
        has: gwegangPillars.length > 0,
        description: "강한 카리스마와 리더십으로 난관을 돌파하는 힘을 가졌습니다.",
        pillars: gwegangPillars
      },
      wonjin: {
        has: wonjinPairsFound.length > 0,
        description: "대인관계에서 알 수 없는 예민함과 오해가 발생할 수 있으니 감정 조절이 필요합니다.",
        pairs: wonjinPairsFound
      },
      gwimun: {
        has: gwimunPairsFound.length > 0,
        description: "직관력과 영감이 대단히 뛰어나며 천재성을 발휘할 수 있으나 신경이 예민할 수 있습니다.",
        pairs: gwimunPairsFound
      },
      cheoneul: {
        has: cheoneulFound.length > 0,
        description: "인생의 위기에서 뜻밖의 귀인이 나타나 도움을 주는 최고의 수호성이 있습니다.",
        branches: cheoneulFound
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
      isStrongSaju: isStrongSaju,
      yongshin: yongshin,
      gishin: gishin,
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
  } else if (ZHI_SAM_HAP[dbA]?.includes(dbB)) {
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
  let elementScore = 0;
  const lackA = sajuA.fiveElements?.lacking;
  const domB = sajuB.fiveElements?.dominant;

  if (lackA && domB && lackA !== 'Unknown' && lackA === domB) {
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

