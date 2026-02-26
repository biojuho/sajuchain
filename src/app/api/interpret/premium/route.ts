import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createClient } from '@/lib/supabase/server';
import { getEntitlementForUser } from '@/lib/entitlement';

type PremiumPayload = {
    dayMaster?: string;
    summary?: string;
    keywords?: string[];
    daewoon?: unknown;
};

type PremiumResponse = {
    yearFlow: string;
    relationshipDeepDive: string;
};

function buildFallback(data: PremiumPayload): PremiumResponse {
    const keywordText = Array.isArray(data.keywords) && data.keywords.length > 0
        ? data.keywords.slice(0, 3).join(', ')
        : '균형, 실행력, 관계운';

    return {
        yearFlow: `올해는 ${data.dayMaster || '일간'} 기운을 기준으로 상반기 실행, 하반기 수확 흐름이 강합니다. 핵심 키워드는 ${keywordText}이며, 2분기와 4분기에 의사결정을 단단히 가져가면 성과 확률이 올라갑니다.`,
        relationshipDeepDive: `관계운은 단기 감정보다 장기 신뢰를 쌓을 때 상승합니다. 먼저 경계 설정을 분명히 하고, 중요한 대화는 즉흥보다 일정화된 대화 루틴으로 가져가면 충돌을 줄이고 친밀도를 높일 수 있습니다.`,
    };
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const entitlement = await getEntitlementForUser(user.id);
        if (!entitlement.isPremium) {
            return NextResponse.json({ error: 'Premium entitlement required' }, { status: 403 });
        }

        const body = await req.json();
        const payload: PremiumPayload = body?.sajuData || {};
        const fallback = buildFallback(payload);

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(fallback);
        }

        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            temperature: 0.7,
            messages: [
                {
                    role: 'system',
                    content: '너는 사주 리포트 전문 분석가다. 반드시 한국어 JSON만 출력한다.',
                },
                {
                    role: 'user',
                    content: `
다음 정보를 바탕으로 프리미엄 리포트 JSON을 생성해줘.

입력:
- 일간/핵심: ${payload.dayMaster || '미상'}
- 요약: ${payload.summary || '미상'}
- 키워드: ${(payload.keywords || []).join(', ')}
- 대운 정보: ${JSON.stringify(payload.daewoon || null)}

출력 JSON 스키마:
{
  "yearFlow": "300~500자",
  "relationshipDeepDive": "250~400자"
}
`,
                },
            ],
        });

        const raw = completion.choices?.[0]?.message?.content;
        if (!raw) {
            return NextResponse.json(fallback);
        }

        const parsed = JSON.parse(raw) as Partial<PremiumResponse>;
        return NextResponse.json({
            yearFlow: parsed.yearFlow || fallback.yearFlow,
            relationshipDeepDive: parsed.relationshipDeepDive || fallback.relationshipDeepDive,
        });
    } catch (error) {
        console.error('[API:interpret/premium] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

