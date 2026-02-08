
import { calculateSaju } from '../src/lib/saju-engine';

// Target Pillars from Screenshot:
// Year: 丙寅 (Byeong-In) -> 1986
// Month: 癸巳 (Gye-Sa) -> May (roughly)
// Day: 戊午 (Mu-O)
// Hour: 乙卯 (Eul-Myo) -> Rabbit Hour (05:30 ~ 07:30)

console.log("=== Reverse Checking Saju ===");

const targetYear = 1986;
// Month 癸巳 usually corresponds to the 4th lunar month or solar May.
// Let's check Solar dates in May 1986.

let matchFound = false;

for (let m = 4; m <= 6; m++) { // Check Apr, May, Jun just in case
    for (let d = 1; d <= 31; d++) {
        // Test with Rabbit Hour (06:00)
        const res = calculateSaju(targetYear, m, d, 6, 0, 'male', 'solar');

        const y = res.fourPillars.year.heavenlyStem + res.fourPillars.year.earthlyBranch; // 丙寅
        const mo = res.fourPillars.month.heavenlyStem + res.fourPillars.month.earthlyBranch; // 癸巳
        const da = res.fourPillars.day.heavenlyStem + res.fourPillars.day.earthlyBranch; // 戊午
        const ho = res.fourPillars.hour.heavenlyStem + res.fourPillars.hour.earthlyBranch; // 乙卯

        if (y === '丙寅' && mo === '癸巳' && da === '戊午') {
            console.log(`\nMATCH FOUND (Day Match)!`);
            console.log(`Date: ${targetYear}-${m}-${d} 06:00 (Solar)`);
            console.log(`Result: ${y} / ${mo} / ${da} / ${ho}`);
            matchFound = true;

            if (ho === '乙卯') {
                console.log(">>> EXACT MATCH with Screenshot <<<");
            } else {
                console.log("Hour mismatch. Calculated:", ho, "Expected: 乙卯");
            }
        }
    }
}

if (!matchFound) {
    console.log("\nNo matching date found in May(ish) 1986 for 丙寅/癸巳/戊午.");
}
