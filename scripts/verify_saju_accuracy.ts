
import { calculateSaju } from '../src/lib/saju-engine';

// Test case: 1990-01-01 12:00 (Solar)
// Standard Saju for 1990.01.01 (Solar) at noon:
// Year: 己巳 (Gi-Sa) - Snake
// Month: 丙子 (Byeong-Ja) - Rat (approximated, depends on Jeolgi)
// Day: 癸卯 (Gye-Myo) - Rabbit (depends on time)
// Let's see what the engine outputs.

console.log("=== Saju Engine Verification ===");

const date = { y: 1990, m: 1, d: 1, h: 12, min: 0 };
const result = calculateSaju(date.y, date.m, date.d, date.h, date.min, 'male', 'solar');

console.log(`Input: ${date.y}-${date.m}-${date.d} ${date.h}:${date.min} (Solar)`);
console.log("Output Pillars:");
console.log("Year :", result.fourPillars.year.heavenlyStem, result.fourPillars.year.earthlyBranch);
console.log("Month:", result.fourPillars.month.heavenlyStem, result.fourPillars.month.earthlyBranch);
console.log("Day  :", result.fourPillars.day.heavenlyStem, result.fourPillars.day.earthlyBranch);
console.log("Hour :", result.fourPillars.hour.heavenlyStem, result.fourPillars.hour.earthlyBranch);

console.log("\n--------------------------------");
console.log("Element Counts:", result.fiveElements?.scores);
