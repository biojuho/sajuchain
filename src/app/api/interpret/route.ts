import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';



// 55 seconds timeout to beat Vercel's 60s limit
const TIMEOUT_MS = 55000;

export async function POST(req: Request) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const body = await req.json(); // Use implicit any/unknown for flexibility or define strict type if needed

        const apiKey = process.env.OPENAI_API_KEY;
        // console.log('Server - API Key Present:', !!apiKey);

        if (!apiKey) {
            console.error('[API:interpret] Missing API Key');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });

        const {
            birthDate,
            yearPillar,
            monthPillar,
            dayPillar,
            hourPillar,
            dayMaster,
            gender,
            daewoon,
            fiveElements
        } = body;

        if (!birthDate || !dayMaster) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // --- RAG: Knowledge Retrieval ---
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        let knowledgeContext = "";

        if (supabaseUrl && supabaseKey) {
            try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(supabaseUrl, supabaseKey);

                const queryText = `Day Master: ${dayMaster}, Month: ${monthPillar.branch}`;
                const embeddingResponse = await openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: queryText,
                });
                if (!embeddingResponse.data?.[0]?.embedding) {
                    console.warn("RAG: Empty embedding response");
                    throw new Error("Empty embedding");
                }
                const queryEmbedding = embeddingResponse.data[0].embedding;

                const { data: knowledgeDocs } = await supabase.rpc('match_saju_knowledge', {
                    query_embedding: queryEmbedding,
                    match_threshold: 0.5,
                    match_count: 3
                });

                if (knowledgeDocs && knowledgeDocs.length > 0) {
                    knowledgeContext = knowledgeDocs.map((d: { category: string; content: string }) => `- [${d.category}] ${d.content}`).join("\n");
                    console.log(`📚 RAG Context: Found ${knowledgeDocs.length} docs`);
                }
            } catch (err) {
                console.warn("RAG Retrieval Failed:", err);
            }
        }
        // --------------------------------

        const systemPrompt = `
당신은 30년 경력의 사주명리학 대가이자, 현대인의 삶을 꿰뚫어 보는 통찰력 있는 운세 상담가입니다.
${knowledgeContext ? `\n[참고: 자평진전 고전 문헌]\n${knowledgeContext}\n(위 고전 내용을 해석에 적절히 인용하세요.)\n` : ""}
## 역할
단순한 띠별 운세가 아닌, **심층적인 사주 분석(Deep Saju Analysis)**을 수행합니다.
주어진 **십신(Ten Gods)**, **12운성(12 Unseong)**, **대운(Daewoon)**, **오행 점수** 데이터를 종합적으로 해석해야 합니다.

## 해석 가이드라인
1. **일간(Day Master: ${dayMaster}) 중심 분석**:
   - 일간이 신강(Strong)한지 신약(Weak)한지 오행 점수(${JSON.stringify(fiveElements?.scores)})를 참고하여 판단하세요.
   - 용신(Userful God)을 추론하여 대운의 흐름과 비교하세요.

2. **십신(Ten Gods) 및 12운성 활용**:
   - 월지(Month Branch)의 십신(격국)을 통해 사회적 성향과 직업 적성을 분석하세요.
   - 일지(Day Branch)의 십신과 12운성을 통해 배우자운과 내면 심리를 분석하세요.
   - 예: "편관이 월지에 있어 카리스마가 넘치지만, 절(絶)지에 놓여 초년 운이 불안정할 수 있습니다."

3. **대운(10-Year Cycle) 통변**:
   - 현재 나이에 해당하는 대운(${daewoon?.cycles?.[0]?.ganZhi} 등)이 일간에게 유리한지 불리한지 설명하세요.
   - 인생의 황금기(전성기)가 언제인지 구체적으로 언급하세요.

4. **오행의 과다/결핍**:
   - 특정 오행이 과다하거나 결핍될 때의 개운법(운을 좋게 하는 법)을 제시하세요.

## 말투 및 톤앤매너
- **전문적이면서도 따뜻하게**: 명리학 용어를 적절히 섞어 신뢰감을 주되, 풀이는 쉽고 친절하게.
- **MZ세대 감성**: "팩트 폭격"과 "따스한 위로"를 동시에. 
- 이모지 활용: 중요 포인트에 🔥, 💧, 🌳 등 오행 이모지 사용.
- **언어**: 모든 응답(키워드, 색상, 방향 등)은 반드시 **한국어**로 출력하세요. 영어 단어 사용 금지.

## 출력 형식 (JSON)
{
  "headline": "한 줄 타이틀 (예: '🌊 거친 파도를 헤치는 검은 호랑이')",
  "threeLineSummary": ["핵심1", "핵심2", "핵심3"],
  "personality": "성격 및 기질 분석 (십신, 12운성 포함 300자)",
  "career": "직업 및 재물운 (격국, 오행 희기 포함 300자)",
  "relationship": "연애 및 대인관계 (일지, 관성/재성 분석 200자)",
  "health": "건강운 (취약한 오행 위주 100자)",
  "daewoonAnalysis": "대운 흐름 및 인생 전성기 분석 (200자)",
  "yearFortune2026": "2026년(병오년) 세운 분석 (200자)",
  "luckyItems": {
    "color": "행운의 색 (반드시 한글로, 예: 붉은색)",
    "number": "행운의 숫자",
    "direction": "행운의 방향 (반드시 한글로, 예: 동쪽)"
  },
  "advice": "마음을 울리는 한마디 조언"
}
    `;

        const userMessage = `
다음 사주 명조를 심층 분석해주세요:

1. 기본 정보
- 생년월일시: ${birthDate}
- 성별: ${gender}
- 일간(Day Master): ${dayMaster}

2. 사주 팔자 (Four Pillars)
- 년주: ${JSON.stringify(yearPillar)}
- 월주: ${JSON.stringify(monthPillar)}
- 일주: ${JSON.stringify(dayPillar)}
- 시주: ${JSON.stringify(hourPillar)}

3. 대운 (Life Cycles)
- 대운 시작 나이: ${daewoon?.startAge}
- 대운 상세: ${JSON.stringify(daewoon?.cycles)}

4. 오행 분석 (Five Elements)
- 오행 점수: ${JSON.stringify(fiveElements?.scores)}
- 최강 오행: ${fiveElements?.dominant}
- 최약 오행: ${fiveElements?.lacking}

위 데이터를 바탕으로 정밀하게 통변해주세요.
    `;

        const responsePromise = openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.75, // Slightly creative
        }, { signal: controller.signal });

        const completion = await responsePromise;
        clearTimeout(timeoutId);

        const content = completion.choices?.[0]?.message?.content;
        if (!content) throw new Error('No content from OpenAI');

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch {
            console.error('[API:interpret] Invalid JSON from OpenAI:', content.slice(0, 200));
            return NextResponse.json({ error: 'AI returned invalid format', raw: content.slice(0, 500) }, { status: 502 });
        }
        return NextResponse.json(parsed);

    } catch (error: unknown) {
        clearTimeout(timeoutId);
        console.error('[API:interpret] Error:', error);

        // Handle Abort/Timeout
        if (error instanceof Error && (error.name === 'AbortError' || error.message?.includes('aborted'))) {
            return NextResponse.json({
                code: 'TIMEOUT',
                message: 'AI analysis took too long. Please try again.'
            }, { status: 504 });
        }

        // Handle OpenAI Errors
        if (error instanceof OpenAI.APIError) {
            return NextResponse.json({
                code: 'AI_SERVICE_ERROR',
                message: 'AI service is currently unavailable.',
                details: error.message
            }, { status: 503 });
        }

        // Generic Error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to interpret saju', details: errorMessage },
            { status: 500 }
        );
    }
}
