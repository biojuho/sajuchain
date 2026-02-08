
import { calculateCompatibility } from '../src/lib/saju-engine';
// Mock SajuData (Minimal for compatibility check)
// We just need fourPillars (specifically Day Pillar) and fiveElements (dominant/lacking)

const createMockSaju = (dayStem: string, dayBranch: string, dominant: string, lacking: string): any => ({
    fourPillars: {
        year: { heavenlyStem: '甲', earthlyBranch: '子', element: 'Wood', tenGod: '', unseong: '' },
        month: { heavenlyStem: '丙', earthlyBranch: '寅', element: 'Fire', tenGod: '', unseong: '' },
        day: { heavenlyStem: dayStem, earthlyBranch: dayBranch, element: '?', tenGod: '', unseong: '' },
        hour: { heavenlyStem: '戊', earthlyBranch: '辰', element: 'Earth', tenGod: '', unseong: '' },
    },
    fiveElements: {
        dominant,
        lacking
    }
});

// Test Case 1: Perfect Match (Gan Hap: 甲 + 己, Zhi Yuk Hap: 子 + 丑, Element Complement)
console.log('--- Test Case 1: Perfect Match (Wood + Earth) ---');
const sajuA = createMockSaju('甲', '子', 'Wood', 'Earth'); // Strong Wood, needs Earth
const sajuB = createMockSaju('己', '丑', 'Earth', 'Wood'); // Strong Earth, needs Wood

const result1 = calculateCompatibility(sajuA, sajuB);
console.log(`Score: ${result1.score}`);
console.log(`Gan Chemistry: ${result1.details.ganChemistry} (Expected: Perfect Match)`);
console.log(`Zhi Chemistry: ${result1.details.zhiChemistry} (Expected: Harmony)`);
console.log(`Element Score: ${result1.details.elementScore} (Expected: > 0)`);

// Test Case 2: Clash (Gan Chung: 甲 + 庚, Zhi Chung: 子 + 午)
console.log('\n--- Test Case 2: Clash Match (Wood + Metal) ---');
const sajuC = createMockSaju('甲', '子', 'Wood', 'Metal');
const sajuD = createMockSaju('庚', '午', 'Metal', 'Wood');

const result2 = calculateCompatibility(sajuC, sajuD);
console.log(`Score: ${result2.score}`);
console.log(`Gan Chemistry: ${result2.details.ganChemistry} (Expected: Clash)`);
console.log(`Zhi Chemistry: ${result2.details.zhiChemistry} (Expected: Conflict)`);

console.log('\nVerification Completed.');
