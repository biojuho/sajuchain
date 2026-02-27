import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { getEntitlementForUser } from "@/lib/entitlement";
import {
  buildDeterministicInterpretFallback,
  normalizeInterpretResponse,
} from "@/lib/interpret/contracts";
import { buildInterpretGrounding } from "@/lib/interpret/grounding";
import { serverLogger } from "@/lib/server-logger";

const FREE_INTERPRET_LIMIT = 3;
const TIMEOUT_MS = 55_000;
const SAJU_INTERPRET_V2_ENABLED = ["1", "true", "yes", "on"].includes(
  (process.env.SAJU_INTERPRET_V2_ENABLED || "").trim().toLowerCase()
);

type InterpretRequestPayload = {
  birthDate?: string;
  yearPillar?: Record<string, unknown>;
  monthPillar?: Record<string, unknown>;
  dayPillar?: Record<string, unknown>;
  hourPillar?: Record<string, unknown>;
  dayMaster?: string;
  gender?: string;
  daewoon?: {
    startAge?: number;
    cycles?: Array<Record<string, unknown>>;
  };
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
  userId?: string;
};

function getMonthBranch(monthPillar: InterpretRequestPayload["monthPillar"]): string {
  if (!monthPillar) return "";
  const earthBranch = monthPillar.earthlyBranch;
  if (typeof earthBranch === "string") return earthBranch;
  const branch = monthPillar.branch;
  return typeof branch === "string" ? branch : "";
}

async function buildKnowledgeContext(
  openai: OpenAI,
  payload: InterpretRequestPayload,
  requestId: string
): Promise<string> {
  const ragSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!ragSupabaseUrl || !supabaseKey) {
    return "";
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(ragSupabaseUrl, supabaseKey);
    const queryText = `Day Master: ${payload.dayMaster || "unknown"}, Month Branch: ${getMonthBranch(payload.monthPillar)}`;
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: queryText,
    });

    const embedding = embeddingResponse.data?.[0]?.embedding;
    if (!embedding) {
      return "";
    }

    const { data: docs } = await supabase.rpc("match_saju_knowledge", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 3,
    });

    if (!Array.isArray(docs) || docs.length === 0) {
      return "";
    }

    return docs
      .map((doc: { category?: string; content?: string }) => `- [${doc.category || "general"}] ${doc.content || ""}`)
      .join("\n");
  } catch (error) {
    serverLogger.warn("interpret.rag_fetch_failed", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return "";
  }
}

function buildSystemPrompt(
  groundingBlock: string,
  knowledgeContext: string,
  useV2: boolean
): string {
  const outputContract = `
Return strictly valid JSON with this shape:
{
  "headline": "string",
  "threeLineSummary": ["string", "string", "string"],
  "personality": "string",
  "career": "string",
  "relationship": "string",
  "health": "string",
  "daewoonAnalysis": "string",
  "yearFortune2026": "string",
  "luckyItems": { "color": "string", "number": "string or number", "direction": "string" },
  "advice": "string"
}
`;

  if (!useV2) {
    return [
      "You are a precise Saju analyst.",
      "Focus on actionable, grounded interpretation and avoid mystical overclaiming.",
      outputContract,
    ].join("\n");
  }

  return [
    "You are a senior Saju analyst producing grounded, internally consistent insight.",
    "Use the provided grounding block as hard context. Do not contradict it.",
    groundingBlock,
    knowledgeContext ? `Reference Notes:\n${knowledgeContext}` : "",
    outputContract,
  ].join("\n");
}

function buildUserPrompt(payload: InterpretRequestPayload): string {
  return [
    "Interpret this chart using the given metadata:",
    `Birth date/time: ${payload.birthDate || "unknown"}`,
    `Gender: ${payload.gender || "unknown"}`,
    `Day Master: ${payload.dayMaster || "unknown"}`,
    `Year Pillar: ${JSON.stringify(payload.yearPillar || null)}`,
    `Month Pillar: ${JSON.stringify(payload.monthPillar || null)}`,
    `Day Pillar: ${JSON.stringify(payload.dayPillar || null)}`,
    `Hour Pillar: ${JSON.stringify(payload.hourPillar || null)}`,
    `Daewoon: ${JSON.stringify(payload.daewoon || null)}`,
    `Five Elements: ${JSON.stringify(payload.fiveElements || null)}`,
  ].join("\n");
}

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = (await req.json()) as InterpretRequestPayload;
    if (!body.birthDate || typeof body.birthDate !== "string" || !body.dayMaster) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!body.yearPillar || !body.monthPillar || !body.dayPillar) {
      return NextResponse.json({ error: "Missing pillar data" }, { status: 400 });
    }

    const grounding = buildInterpretGrounding({
      dayMaster: body.dayMaster,
      fiveElements: body.fiveElements,
      daewoon: body.daewoon,
    });

    const deterministicFallback = buildDeterministicInterpretFallback({
      dayMaster: grounding.dayMaster,
      dominantElement: grounding.dominantElement,
      weakElement: grounding.weakElement,
      daewoonSummary: grounding.daewoonSummary,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (body.userId && supabaseUrl && serviceKey) {
      const { createClient: createAdminClient } = await import("@supabase/supabase-js");
      const adminSupabase = createAdminClient(supabaseUrl, serviceKey);
      const entitlement = await getEntitlementForUser(body.userId);

      if (!entitlement.isPremium) {
        const { data: usageResult, error: usageError } = await adminSupabase.rpc("check_and_increment_usage", {
          p_user_id: body.userId,
          p_usage_type: "interpret",
          p_limit: FREE_INTERPRET_LIMIT,
        });

        if (!usageError && usageResult && !usageResult.allowed) {
          return NextResponse.json(
            { error: "LIMIT_REACHED", remaining: 0, message: "Free daily interpretation limit reached." },
            { status: 429 }
          );
        }
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      serverLogger.error("interpret.api_key_missing", { requestId });
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const knowledgeContext = await buildKnowledgeContext(openai, body, requestId);
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: SAJU_INTERPRET_V2_ENABLED ? 0.65 : 0.75,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(grounding.groundingBlock, knowledgeContext, SAJU_INTERPRET_V2_ENABLED),
          },
          {
            role: "user",
            content: buildUserPrompt(body),
          },
        ],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      serverLogger.warn("interpret.empty_openai_response", { requestId });
      return NextResponse.json(deterministicFallback);
    }

    let parsedContent: unknown;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      serverLogger.warn("interpret.invalid_json_openai_response", { requestId });
      return NextResponse.json(deterministicFallback);
    }

    const normalized = normalizeInterpretResponse(parsedContent, deterministicFallback);
    serverLogger.info("interpret.normalization", {
      requestId,
      mode: normalized.mode,
      issues: normalized.issues,
      v2: SAJU_INTERPRET_V2_ENABLED,
    });
    return NextResponse.json(normalized.value);
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && (error.name === "AbortError" || error.message.includes("aborted"))) {
      serverLogger.warn("interpret.timeout", { requestId });
      return NextResponse.json({ code: "TIMEOUT", message: "AI analysis took too long. Please try again." }, { status: 504 });
    }

    if (error instanceof OpenAI.APIError) {
      serverLogger.error("interpret.openai_error", { requestId, message: error.message });
      return NextResponse.json(
        { code: "AI_SERVICE_ERROR", message: "AI service is currently unavailable.", details: error.message },
        { status: 503 }
      );
    }

    serverLogger.error("interpret.exception", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Failed to interpret saju" }, { status: 500 });
  }
}
