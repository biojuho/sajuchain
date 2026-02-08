import { SajuData } from '@/types';

export const MOCK_SAJU_DATA: SajuData[] = [
    {
        name: "User1",
        birthDate: "1995-03-15",
        birthTime: "14:30",
        gender: "female",
        calendarType: "solar",
        fourPillars: {
            year: { heavenlyStem: "乙", earthlyBranch: "亥" },
            month: { heavenlyStem: "己", earthlyBranch: "卯" },
            day: { heavenlyStem: "甲", earthlyBranch: "寅" },
            hour: { heavenlyStem: "辛", earthlyBranch: "未" }
        },
        dayMaster: "甲",
        fiveElements: {
            wood: 4,
            fire: 1,
            earth: 2,
            metal: 1,
            water: 0,
            dominant: "목(木)",
            lacking: "수(水)",
            scores: { wood: 4, fire: 1, earth: 2, metal: 1, water: 0 }
        },
        aiResult: {
            headline: "🌲 숲을 이루는 거목",
            threeLineSummary: ["창의력 대장", "추진력 갑", "포용력 만렙"],
            personality: "창의적이고 추진력이 강한 목(木)의 기운을 가지고 있습니다. 숲처럼 포용력이 넓으나 고집이 셀 수 있습니다.",
            career: "예술, 기획, 교육 분야에서 두각을 나타낼 수 있습니다.",
            relationship: "리드하는 연애를 선호하며, 의지할 수 있는 상대를 만나는 것이 좋습니다.",
            health: "간과 신경계 건강에 유의하세요.",
            luckyItems: {
                color: "Blue",
                number: 3,
                direction: "동쪽"
            },
            yearFortune2026: "올해는 새로운 싹을 틔우는 시기입니다.",
            advice: "고집을 조금만 내려놓으면 더 큰 숲을 이룰 수 있습니다."
        },
        generatedAt: new Date().toISOString(),
        uniqueHash: "mock_hash_001"
    },
    {
        name: "User2",
        birthDate: "1988-11-20",
        birthTime: "09:15",
        gender: "male",
        calendarType: "solar",
        fourPillars: {
            year: { heavenlyStem: "戊", earthlyBranch: "辰" },
            month: { heavenlyStem: "癸", earthlyBranch: "亥" },
            day: { heavenlyStem: "丙", earthlyBranch: "午" },
            hour: { heavenlyStem: "壬", earthlyBranch: "辰" }
        },
        dayMaster: "丙",
        fiveElements: {
            wood: 1,
            fire: 2,
            earth: 3,
            metal: 0,
            water: 2,
            dominant: "토(土)",
            lacking: "금(金)",
            scores: { wood: 1, fire: 2, earth: 3, metal: 0, water: 2 }
        },
        aiResult: {
            headline: "⛰️ 듬직한 태산",
            threeLineSummary: ["신중함", "리더십", "안정감"],
            personality: "신중하고 포용력이 넓은 토(土)의 성향입니다. 믿음직스럽지만 때로는 우유부단할 수 있습니다.",
            career: "부동산, 금융, 관리직이 적합합니다.",
            relationship: "안정적이고 오래가는 관계를 선호합니다.",
            health: "위장과 소화기 계통을 조심하세요.",
            luckyItems: {
                color: "Yellow",
                number: 5,
                direction: "중앙"
            },
            yearFortune2026: "기반을 다지고 재물을 모으는 해입니다.",
            advice: "결단을 내릴 때는 과감해질 필요가 있습니다."
        },
        generatedAt: new Date().toISOString(),
        uniqueHash: "mock_hash_002"
    }
];

export const getRandomMockSaju = (): SajuData => {
    return MOCK_SAJU_DATA[Math.floor(Math.random() * MOCK_SAJU_DATA.length)];
};

