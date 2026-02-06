import { Solar, Lunar, LunarYear } from 'lunar-javascript';

export interface SajuPillar {
  heavenlyStem: string;
  earthlyBranch: string;
  element: string; // 오행 (목, 화, 토, 금, 수)
}

export interface SajuResult {
  fourPillars: {
    year: SajuPillar;
    month: SajuPillar;
    day: SajuPillar;
    hour: SajuPillar;
  };
  dayMaster: string;       // 일간 (예: 갑목)
  dominantElement: string; // 최강 오행 (간략 계산)
  weakElement: string;     // 최약 오행
  lunarDate: string;       // 음력 날짜 문자열
}

// 오행 매핑 (Simple Mapping)
const ELEMENT_MAP: Record<string, string> = {
  '甲': 'Tree', '乙': 'Tree',
  '丙': 'Fire', '丁': 'Fire',
  '戊': 'Earth', '己': 'Earth',
  '庚': 'Metal', '辛': 'Metal',
  '壬': 'Water', '癸': 'Water',
  '子': 'Water', '丑': 'Earth',
  '寅': 'Tree', '卯': 'Tree',
  '辰': 'Earth', '巳': 'Fire',
  '午': 'Fire', '未': 'Earth',
  '申': 'Metal', '酉': 'Metal',
  '戌': 'Earth', '亥': 'Water',
};

const ELEMENT_KOREAN: Record<string, string> = {
  'Tree': '목(木)',
  'Fire': '화(火)',
  'Earth': '토(土)',
  'Metal': '금(金)',
  'Water': '수(水)',
};

export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): SajuResult {
  // 1. 양력 -> 음력 계산을 위해 Solar 객체 생성
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();

  // 2. 사주팔자 (Lunar 객체 내장 기능 활용)
  const eightChar = lunar.getEightChar();

  // 자시 보정 (조자시/야자시) 등은 library가 처리 (Solar/Lunar 변환 시점 기준)
  // lunar-javascript는 기본적으로 일반적인 만세력 기준을 따름

  // 천간/지지 추출
  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();
  const timeGan = eightChar.getTimeGan();
  const timeZhi = eightChar.getTimeZhi();

  const getPillar = (gan: string, zhi: string): SajuPillar => {
    // 오행은 천간 기준 + 지지 기준 복합적이나, 여기서는 천간/지지 각각의 오행을 표시하거나
    // 기둥(Pillar) 자체의 납음오행을 쓸 수도 있음. MVP에서는 천간/지지의 단순 오행을 매핑.
    // 여기서는 '천간'의 오행을 기둥의 대표 성질로 표시하되, 지지 오행도 고려가 필요. 
    // UI에서는 천간/지지를 따로 보여주므로 element 필드는 천간 기준으로 설정해봄.
    const elType = ELEMENT_MAP[gan] || 'Unknown';
    return {
      heavenlyStem: gan,
      earthlyBranch: zhi,
      element: ELEMENT_KOREAN[elType] || elType,
    };
  };

  const fourPillars = {
    year: getPillar(yearGan, yearZhi),
    month: getPillar(monthGan, monthZhi),
    day: getPillar(dayGan, dayZhi),
    hour: getPillar(timeGan, timeZhi),
  };

  // 3. 일간 (Day Master)
  const dayMaster = `${dayGan}${ELEMENT_KOREAN[ELEMENT_MAP[dayGan as string]] || ''}`;

  // 4. 오행 갯수 세기 (단순 합계)
  // 천간 4개, 지지 4개 총 8글자의 오행 분포
  const counts: Record<string, number> = { 'Tree': 0, 'Fire': 0, 'Earth': 0, 'Metal': 0, 'Water': 0 };

  [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, timeGan, timeZhi].forEach(char => {
    const el = ELEMENT_MAP[char];
    if (el && counts[el] !== undefined) counts[el]++;
  });

  // 최강/최약 오행
  let maxCount = -1;
  let minCount = 99;
  let dominant = 'N/A';
  let weak = 'N/A';

  Object.entries(counts).forEach(([el, count]) => {
    if (count > maxCount) { maxCount = count; dominant = el; }
    if (count < minCount) { minCount = count; weak = el; }
  });

  // 0개인 오행이 있다면 그게 가장 약함
  const zeroElements = Object.entries(counts).filter(([, c]) => c === 0).map(([k]) => k);
  if (zeroElements.length > 0) weak = zeroElements[0]; // 첫 번째로 발견된 0개짜리

  // 출력 포맷핑
  return {
    fourPillars,
    dayMaster,
    dominantElement: ELEMENT_KOREAN[dominant] || dominant,
    weakElement: ELEMENT_KOREAN[weak] || weak,
    lunarDate: lunar.toFullString(),
  };
}
