import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createClient } from "@/lib/supabase/server";
import { getEntitlementForUser } from "@/lib/entitlement";
import {
  buildDeterministicPremiumFallback,
  normalizePremiumResponse,
} from "@/lib/interpret/contracts";
import { buildInterpretGrounding } from "@/lib/interpret/grounding";
import { serverLogger } from "@/lib/server-logger";

const SAJU_INTERPRET_V2_ENABLED = ["1", "true", "yes", "on"].includes(
  (process.env.SAJU_INTERPRET_V2_ENABLED || "").trim().toLowerCase()
);

type PremiumPayload = {
  dayMaster?: string;
  summary?: string;
  keywords?: string[];
  daewoon?: unknown;
  fiveElements?: {
    dominant?: string;
    lacking?: string;
    scores?: {
      wood?: number;
      fire?: number;
      earth?: number;
      metal?: number;
      water?: number;
    };
  };
};

function buildPremiumPrompt(payload: PremiumPayload, groundingBlock: string, useV2: boolean): string {
  const objective = useV2
    ? "Create a premium response grounded in the supplied structure and avoid generic fluff."
    : "Create a concise premium response.";

  return [
    objective,
    groundingBlock,
    "Return strict JSON with fields: yearFlow, relationshipDeepDive.",
    `Input summary: ${payload.summary || "none"}`,
    `Input keywords: ${(payload.keywords || []).join(", ")}`,
    `Daewoon: ${JSON.stringify(payload.daewoon || null)}`,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entitlement = await getEntitlementForUser(user.id);
    if (!entitlement.isPremium) {
      return NextResponse.json({ error: "Premium entitlement required" }, { status: 403 });
    }

    const body = await req.json();
    const payload: PremiumPayload = body?.sajuData || {};
    const fallback = buildDeterministicPremiumFallback({
      dayMaster: payload.dayMaster,
      summary: payload.summary,
      keywords: payload.keywords,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      serverLogger.warn("interpret_premium.api_key_missing", { requestId });
      return NextResponse.json(fallback);
    }

    const grounding = buildInterpretGrounding({
      dayMaster: payload.dayMaster,
      fiveElements: payload.fiveElements,
      daewoon: payload.daewoon as { startAge?: number; cycles?: Array<Record<string, unknown>> } | undefined,
    });

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: SAJU_INTERPRET_V2_ENABLED ? 0.65 : 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a premium Saju report analyst. Output strict JSON only.",
        },
        {
          role: "user",
          content: buildPremiumPrompt(payload, grounding.groundingBlock, SAJU_INTERPRET_V2_ENABLED),
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content;
    if (!raw) {
      serverLogger.warn("interpret_premium.empty_openai_response", { requestId });
      return NextResponse.json(fallback);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      serverLogger.warn("interpret_premium.invalid_json_openai_response", { requestId });
      return NextResponse.json(fallback);
    }

    const normalized = normalizePremiumResponse(parsed, fallback);
    serverLogger.info("interpret_premium.normalization", {
      requestId,
      mode: normalized.mode,
      issues: normalized.issues,
      v2: SAJU_INTERPRET_V2_ENABLED,
    });

    return NextResponse.json(normalized.value);
  } catch (error) {
    serverLogger.error("interpret_premium.exception", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
