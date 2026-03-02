import { describe, expect, it } from "vitest";

import {
  buildDeterministicInterpretFallback,
  buildDeterministicPremiumFallback,
  normalizeInterpretResponse,
  normalizePremiumResponse,
} from "@/lib/interpret/contracts";

describe("interpret contracts", () => {
  it("keeps valid interpret payload in strict mode", () => {
    const fallback = buildDeterministicInterpretFallback({
      dayMaster: "甲",
      dominantElement: "wood",
      weakElement: "metal",
    });

    const result = normalizeInterpretResponse(
      {
        headline: "Momentum is stable.",
        threeLineSummary: ["Line 1", "Line 2", "Line 3"],
        personality: "Personality block",
        career: "Career block",
        relationship: "Relationship block",
        health: "Health block",
        daewoonAnalysis: "Daewoon block",
        yearFortune2026: "Year fortune block",
        luckyItems: {
          color: "Green",
          number: 8,
          direction: "East",
        },
        advice: "Advice block",
      },
      fallback
    );

    expect(result.mode).toBe("strict");
    expect(result.value.headline).toBe("Momentum is stable.");
    expect(result.value.luckyItems.number).toBe(8);
  });

  it("normalizes malformed interpret payload fields", () => {
    const fallback = buildDeterministicInterpretFallback({
      dayMaster: "乙",
      dominantElement: "fire",
      weakElement: "water",
    });

    const result = normalizeInterpretResponse(
      {
        headline: "  ",
        threeLineSummary: ["", 123],
        personality: "P",
        career: "C",
        relationship: "R",
        health: "H",
        yearFortune2026: "Y",
        luckyItems: {
          color: "",
          number: null,
          direction: "  ",
        },
        advice: "A",
      },
      fallback
    );

    expect(result.mode).toBe("normalized");
    expect(result.value.headline).toBe(fallback.headline);
    expect(result.value.luckyItems.color).toBe(fallback.luckyItems.color);
  });

  it("falls back when interpret payload is not an object", () => {
    const fallback = buildDeterministicInterpretFallback({
      dayMaster: "丙",
      dominantElement: "earth",
      weakElement: "wood",
    });
    const result = normalizeInterpretResponse("not-json", fallback);
    expect(result.mode).toBe("fallback");
    expect(result.value.headline).toBe(fallback.headline);
  });
});

describe("premium contracts", () => {
  it("normalizes premium fallback path", () => {
    const fallback = buildDeterministicPremiumFallback({
      dayMaster: "丁",
      summary: "Sample summary",
      keywords: ["focus", "timing"],
    });

    const result = normalizePremiumResponse({}, fallback);
    expect(result.mode).toBe("fallback");
    expect(result.value.yearFlow).toContain("丁");
  });
});
