import type { AIResult } from "@/types";

export type NormalizationMode = "strict" | "normalized" | "fallback";

export type PremiumInterpretResponse = {
  yearFlow: string;
  relationshipDeepDive: string;
};

export type NormalizationResult<T> = {
  value: T;
  mode: NormalizationMode;
  issues: string[];
};

const clampString = (value: string, maxLen: number): string => value.slice(0, maxLen).trim();

const toCleanString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const toLuckyNumber = (value: unknown): string | number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) return value.trim();
  return "7";
};

export function buildDeterministicInterpretFallback(input: {
  dayMaster?: string;
  dominantElement?: string;
  weakElement?: string;
  daewoonSummary?: string;
}): AIResult {
  const dayMaster = input.dayMaster || "Day Master";
  const dominantElement = input.dominantElement || "Unknown";
  const weakElement = input.weakElement || "Unknown";
  const daewoonSummary = input.daewoonSummary || "No major cycle signal available.";

  return {
    headline: `${dayMaster} needs balanced execution this season.`,
    threeLineSummary: [
      `Strength flows from ${dominantElement}.`,
      `Stability improves when ${weakElement} is supplemented.`,
      "Use steady routines over impulsive changes.",
    ],
    personality: `${dayMaster} tends to perform best with clear structure and selective commitments. Preserve momentum through repeatable daily actions.`,
    career: `Leverage your ${dominantElement} tendency in work decisions, and reduce overreaction risk by validating assumptions before major moves.`,
    relationship: "Communication quality decides outcomes this cycle. Keep boundaries explicit and avoid delayed feedback loops.",
    health: `Watch signs of imbalance linked to ${weakElement}. Prioritize sleep rhythm, hydration, and moderate training intensity.`,
    daewoonAnalysis: daewoonSummary,
    yearFortune2026: "2026 favors disciplined execution and staged decisions over all-in bets.",
    luckyItems: {
      color: "Blue",
      number: "7",
      direction: "East",
    },
    advice: "Run small experiments, measure outcomes, and compound what works.",
    overallFortune: "Measured progress beats short-term intensity.",
  };
}

export function normalizeInterpretResponse(payload: unknown, fallback: AIResult): NormalizationResult<AIResult> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      value: fallback,
      mode: "fallback",
      issues: ["payload_not_object"],
    };
  }

  const parsed = payload as Record<string, unknown>;
  const issues: string[] = [];
  let payloadSignalCount = 0;

  const pickString = (key: keyof AIResult, maxLen: number): string => {
    const raw = toCleanString(parsed[key as string]);
    if (!raw) {
      issues.push(`${key}_missing`);
      return fallback[key] as string;
    }
    payloadSignalCount += 1;
    return clampString(raw, maxLen);
  };

  const rawSummary = parsed.threeLineSummary;
  let threeLineSummary = fallback.threeLineSummary;
  if (Array.isArray(rawSummary)) {
    const cleaned = rawSummary
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0)
      .slice(0, 3);
    if (cleaned.length > 0) {
      while (cleaned.length < 3) {
        cleaned.push(fallback.threeLineSummary[cleaned.length] || fallback.threeLineSummary[0]);
      }
      threeLineSummary = cleaned;
      payloadSignalCount += 1;
    } else {
      issues.push("threeLineSummary_empty");
    }
  } else {
    issues.push("threeLineSummary_missing");
  }

  const rawLuckyItems = parsed.luckyItems;
  let luckyItems = fallback.luckyItems;
  if (rawLuckyItems && typeof rawLuckyItems === "object" && !Array.isArray(rawLuckyItems)) {
    const lucky = rawLuckyItems as Record<string, unknown>;
    const color = toCleanString(lucky.color) || fallback.luckyItems.color;
    const direction = toCleanString(lucky.direction) || fallback.luckyItems.direction;
    const number = toLuckyNumber(lucky.number);
    luckyItems = {
      color: clampString(color, 40),
      direction: clampString(direction, 40),
      number,
    };
    payloadSignalCount += 1;
  } else {
    issues.push("luckyItems_missing");
  }

  const value: AIResult = {
    headline: pickString("headline", 160),
    threeLineSummary,
    personality: pickString("personality", 1800),
    career: pickString("career", 1800),
    relationship: pickString("relationship", 1500),
    health: pickString("health", 1200),
    daewoonAnalysis: clampString(toCleanString(parsed.daewoonAnalysis) || (fallback.daewoonAnalysis || ""), 1500) || undefined,
    yearFortune2026: pickString("yearFortune2026", 1500),
    luckyItems,
    advice: pickString("advice", 1200),
    overallFortune: clampString(toCleanString(parsed.overallFortune) || (fallback.overallFortune || ""), 1200) || undefined,
  };

  if (payloadSignalCount === 0) {
    return {
      value: fallback,
      mode: "fallback",
      issues: ["payload_without_usable_fields", ...issues],
    };
  }

  return {
    value,
    mode: issues.length === 0 ? "strict" : "normalized",
    issues,
  };
}

export function buildDeterministicPremiumFallback(input: {
  dayMaster?: string;
  summary?: string;
  keywords?: string[];
}): PremiumInterpretResponse {
  const keywordText = Array.isArray(input.keywords) && input.keywords.length > 0
    ? input.keywords.slice(0, 3).join(", ")
    : "timing, rhythm, boundary management";

  return {
    yearFlow: `${input.dayMaster || "This profile"} should run 2026 in phased cycles. Use ${keywordText} as the main checkpoint themes and avoid overcommitting in one step.`,
    relationshipDeepDive: `Keep conversations concise and explicit. The pattern in this phase rewards early clarification over delayed emotional reactions. ${input.summary || ""}`.trim(),
  };
}

export function normalizePremiumResponse(
  payload: unknown,
  fallback: PremiumInterpretResponse
): NormalizationResult<PremiumInterpretResponse> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      value: fallback,
      mode: "fallback",
      issues: ["payload_not_object"],
    };
  }

  const parsed = payload as Record<string, unknown>;
  const yearFlowRaw = toCleanString(parsed.yearFlow);
  const relationRaw = toCleanString(parsed.relationshipDeepDive);

  if (!yearFlowRaw && !relationRaw) {
    return {
      value: fallback,
      mode: "fallback",
      issues: ["premium_fields_missing"],
    };
  }

  const issues: string[] = [];
  if (!yearFlowRaw) issues.push("yearFlow_missing");
  if (!relationRaw) issues.push("relationshipDeepDive_missing");

  return {
    value: {
      yearFlow: clampString(yearFlowRaw || fallback.yearFlow, 2200),
      relationshipDeepDive: clampString(relationRaw || fallback.relationshipDeepDive, 2200),
    },
    mode: issues.length === 0 ? "strict" : "normalized",
    issues,
  };
}
