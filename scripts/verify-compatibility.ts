import { calculateCompatibility } from '../src/lib/saju-engine';
import { GAN_CHUNG, GAN_HAP, ZHI_CHUNG, ZHI_YUK_HAP } from '../src/lib/saju-data';
import type { FiveElementsData, PillarData, SajuData } from '../src/types';

type MockSajuInput = {
    name: string;
    dayStem: string;
    dayBranch: string;
    dominant: string;
    lacking: string;
};

const createPillar = (heavenlyStem: string, earthlyBranch: string): PillarData => ({
    heavenlyStem,
    earthlyBranch,
    element: '',
    tenGod: '',
    unseong: '',
});

const createFiveElements = (dominant: string, lacking: string): FiveElementsData => {
    const scores = {
        wood: dominant === 'Wood' ? 3 : 1,
        fire: dominant === 'Fire' ? 3 : 1,
        earth: dominant === 'Earth' ? 3 : 1,
        metal: dominant === 'Metal' ? 3 : 1,
        water: dominant === 'Water' ? 3 : 1,
    };

    return {
        wood: scores.wood,
        fire: scores.fire,
        earth: scores.earth,
        metal: scores.metal,
        water: scores.water,
        dominant,
        lacking,
        scores,
    };
};

const createMockSaju = ({ name, dayStem, dayBranch, dominant, lacking }: MockSajuInput): SajuData => ({
    name,
    birthDate: '1990-01-01',
    birthTime: '12:00',
    gender: 'M',
    calendarType: 'solar',
    birthPlace: 'Seoul',
    fourPillars: {
        year: createPillar(dayStem, dayBranch),
        month: createPillar(dayStem, dayBranch),
        day: createPillar(dayStem, dayBranch),
        hour: createPillar(dayStem, dayBranch),
    },
    fiveElements: createFiveElements(dominant, lacking),
    dayMaster: dayStem,
});

const firstEntry = <T>(entries: Array<[string, T]>, fallback: [string, T]): [string, T] => entries[0] ?? fallback;

const [ganMatchA, ganMatchB] = firstEntry(Object.entries(GAN_HAP), ['A', 'B']);
const [zhiMatchA, zhiMatchB] = firstEntry(Object.entries(ZHI_YUK_HAP), ['X', 'Y']);

const ganClashEntry = Object.entries(GAN_CHUNG).find(([, targets]) => targets.length > 0);
const ganClashA = ganClashEntry ? ganClashEntry[0] : ganMatchA;
const ganClashB = ganClashEntry ? ganClashEntry[1][0] : ganMatchB;

const zhiClashEntry = Object.entries(ZHI_CHUNG)[0];
const zhiClashA = zhiClashEntry ? zhiClashEntry[0] : zhiMatchA;
const zhiClashB = zhiClashEntry ? zhiClashEntry[1] : zhiMatchB;

console.log('--- Test Case 1: Harmony-oriented pair ---');
const sajuA = createMockSaju({
    name: 'Person A',
    dayStem: ganMatchA,
    dayBranch: zhiMatchA,
    dominant: 'Wood',
    lacking: 'Earth',
});
const sajuB = createMockSaju({
    name: 'Person B',
    dayStem: ganMatchB,
    dayBranch: zhiMatchB,
    dominant: 'Earth',
    lacking: 'Wood',
});

const result1 = calculateCompatibility(sajuA, sajuB);
console.log(`Score: ${result1.score}`);
console.log(`Gan Chemistry: ${result1.details.ganChemistry}`);
console.log(`Zhi Chemistry: ${result1.details.zhiChemistry}`);
console.log(`Element Score: ${result1.details.elementScore}`);

console.log('\n--- Test Case 2: Clash-oriented pair ---');
const sajuC = createMockSaju({
    name: 'Person C',
    dayStem: ganClashA,
    dayBranch: zhiClashA,
    dominant: 'Wood',
    lacking: 'Metal',
});
const sajuD = createMockSaju({
    name: 'Person D',
    dayStem: ganClashB,
    dayBranch: zhiClashB,
    dominant: 'Metal',
    lacking: 'Wood',
});

const result2 = calculateCompatibility(sajuC, sajuD);
console.log(`Score: ${result2.score}`);
console.log(`Gan Chemistry: ${result2.details.ganChemistry}`);
console.log(`Zhi Chemistry: ${result2.details.zhiChemistry}`);
console.log(`Element Score: ${result2.details.elementScore}`);

console.log('\nVerification completed.');
