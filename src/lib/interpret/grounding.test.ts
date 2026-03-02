import { describe, expect, it } from "vitest";

import { buildInterpretGrounding } from "@/lib/interpret/grounding";

describe("buildInterpretGrounding", () => {
  it("builds grounding with dominant/weak elements and daewoon summary", () => {
    const result = buildInterpretGrounding({
      dayMaster: { hanja: "甲", name: "Wood" },
      fiveElements: {
        scores: {
          wood: 6,
          fire: 3,
          earth: 2,
          metal: 1,
          water: 0,
        },
      },
      daewoon: {
        startAge: 8,
        cycles: [
          { startAge: 8, endAge: 17, ganZhi: "甲子", tenGod: "Friend" },
          { startAge: 18, endAge: 27, ganZhi: "乙丑", tenGod: "Wealth" },
        ],
      },
    });

    expect(result.dayMaster).toContain("甲");
    expect(result.dominantElement).toBe("wood");
    expect(result.weakElement).toBe("water");
    expect(result.daewoonSummary).toContain("8-17");
    expect(result.groundingBlock).toContain("Five Elements");
  });

  it("returns safe defaults when input is sparse", () => {
    const result = buildInterpretGrounding({});
    expect(result.dayMaster).toBe("Unknown Day Master");
    expect(result.dominantElement).toBe("unknown");
    expect(result.weakElement).toBe("unknown");
  });
});
