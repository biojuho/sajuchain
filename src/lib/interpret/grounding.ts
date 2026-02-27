type FiveElementScores = {
  wood?: number;
  fire?: number;
  earth?: number;
  metal?: number;
  water?: number;
};

type DaewoonCycle = {
  startAge?: number;
  endAge?: number;
  ganZhi?: string;
  tenGod?: string;
  unseong?: string;
};

export type InterpretGroundingInput = {
  dayMaster?: string | { hanja?: string; element?: string; name?: string };
  fiveElements?: {
    dominant?: string;
    lacking?: string;
    scores?: FiveElementScores;
  };
  daewoon?: {
    startAge?: number;
    cycles?: DaewoonCycle[];
  };
};

export type InterpretGrounding = {
  dayMaster: string;
  dominantElement: string;
  weakElement: string;
  fiveElementSummary: string;
  daewoonSummary: string;
  groundingBlock: string;
};

const elementOrder: Array<keyof FiveElementScores> = ["wood", "fire", "earth", "metal", "water"];

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function resolveDayMaster(dayMaster: InterpretGroundingInput["dayMaster"]): string {
  if (typeof dayMaster === "string" && dayMaster.trim()) {
    return dayMaster.trim();
  }
  if (dayMaster && typeof dayMaster === "object") {
    const hanja = typeof dayMaster.hanja === "string" ? dayMaster.hanja.trim() : "";
    const name = typeof dayMaster.name === "string" ? dayMaster.name.trim() : "";
    if (hanja && name) return `${hanja} ${name}`;
    if (hanja) return hanja;
    if (name) return name;
  }
  return "Unknown Day Master";
}

function deriveElements(input: InterpretGroundingInput["fiveElements"]): {
  dominantElement: string;
  weakElement: string;
  fiveElementSummary: string;
} {
  const explicitDominant = typeof input?.dominant === "string" ? input.dominant.trim() : "";
  const explicitWeak = typeof input?.lacking === "string" ? input.lacking.trim() : "";
  const scores = input?.scores;

  if (scores) {
    const ranked = elementOrder
      .map((key) => ({ key, value: toNumber(scores[key]) }))
      .sort((a, b) => b.value - a.value);
    const dominant = explicitDominant || ranked[0]?.key || "unknown";
    const weak = explicitWeak || ranked[ranked.length - 1]?.key || "unknown";
    const summary = ranked.map((item) => `${item.key}:${item.value.toFixed(1)}`).join(", ");
    return {
      dominantElement: dominant,
      weakElement: weak,
      fiveElementSummary: summary,
    };
  }

  return {
    dominantElement: explicitDominant || "unknown",
    weakElement: explicitWeak || "unknown",
    fiveElementSummary: "No five-element score provided",
  };
}

function summarizeDaewoon(daewoon: InterpretGroundingInput["daewoon"]): string {
  const startAge = toNumber(daewoon?.startAge);
  const cycles = Array.isArray(daewoon?.cycles) ? daewoon?.cycles.slice(0, 2) : [];
  if (!cycles || cycles.length === 0) {
    return startAge > 0
      ? `Major cycle starts around age ${startAge}.`
      : "No daewoon cycle data provided.";
  }

  const chunks = cycles.map((cycle) => {
    const ageText = `${toNumber(cycle.startAge)}-${toNumber(cycle.endAge)}`;
    const ganZhi = cycle.ganZhi || "unknown";
    const tenGod = cycle.tenGod || "unknown";
    return `${ageText}:${ganZhi}/${tenGod}`;
  });
  return `Cycle focus -> ${chunks.join(" | ")}`;
}

export function buildInterpretGrounding(input: InterpretGroundingInput): InterpretGrounding {
  const dayMaster = resolveDayMaster(input.dayMaster);
  const elementInfo = deriveElements(input.fiveElements);
  const daewoonSummary = summarizeDaewoon(input.daewoon);

  const groundingBlock = [
    `[Grounding]`,
    `Day Master: ${dayMaster}`,
    `Five Elements: ${elementInfo.fiveElementSummary}`,
    `Dominant Element: ${elementInfo.dominantElement}`,
    `Weak Element: ${elementInfo.weakElement}`,
    `Daewoon: ${daewoonSummary}`,
  ].join("\n");

  return {
    dayMaster,
    dominantElement: elementInfo.dominantElement,
    weakElement: elementInfo.weakElement,
    fiveElementSummary: elementInfo.fiveElementSummary,
    daewoonSummary,
    groundingBlock,
  };
}
