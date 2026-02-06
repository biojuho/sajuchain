import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';



export async function POST(req: Request) {
    try {
        const body: {
            birthDate: string;
            yearPillar: { heavenlyStem: string; earthlyBranch: string };
            monthPillar: { heavenlyStem: string; earthlyBranch: string };
            dayPillar: { heavenlyStem: string; earthlyBranch: string };
            hourPillar: { heavenlyStem: string; earthlyBranch: string };
            dayMaster: string;
            gender: string;
        } = await req.json();

        const apiKey = process.env.OPENAI_API_KEY;
        console.log('Server - API Key Present:', !!apiKey);
        console.log('Server - Environment Variables:', Object.keys(process.env).filter(k => k.includes('OPENAI')));

        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API Key not configured' }, { status: 500 });
        }
        const openai = new OpenAI({ apiKey });

        const { birthDate, yearPillar, monthPillar, dayPillar, hourPillar, dayMaster, gender } = body;

        if (!birthDate || !dayMaster) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const systemPrompt = `
당신은 30년 경력의 사주명리학 전문가이자, MZ세대와 소통하는 현대적 운세 해석가입니다.

## 역할
사주팔자 데이터를 받아 재미있고 통찰력 있는 운세를 제공합니다.

## 해석 원칙
1. 일간(Day Master: ${dayMaster})을 기준으로 전체 사주의 균형을 파악하세요
2. 오행의 상생·상극 관계를 분석하세요
3. 현재 대운(大運)과 세운(歲運)을 고려하세요 (2026년 기준)
4. 긍정적 관점을 유지하되, 주의할 점도 솔직하게 전달하세요

## 말투
- MZ세대 친화적: 가볍고 위트있게, 하지만 본질은 깊게
- 이모지 적극 활용
- 3줄 핵심 요약 + 상세 설명 구조

## 출력 형식 (JSON)
{
  "headline": "한 줄 타이틀 (예: '🔥 불꽃 리더십의 소유자')",
  "threeLineSummary": ["핵심1", "핵심2", "핵심3"],
  "personality": "성격 분석 (200자 이내)",
  "career": "직업/재물운 (200자 이내)",
  "relationship": "연애/대인관계운 (200자 이내)",
  "health": "건강운 (100자 이내)",
  "yearFortune2026": "2026년 운세 (200자 이내)",
  "luckyItems": {
    "color": "행운의 색",
    "number": "행운의 숫자",
    "direction": "행운의 방향"
  },
  "advice": "오늘의 한마디 조언"
}
    `;

        const userMessage = `
다음 사주팔자를 해석해주세요:
- 생년월일시: ${birthDate}
- 성별: ${gender}
- 년주: ${JSON.stringify(yearPillar)}
- 월주: ${JSON.stringify(monthPillar)}
- 일주: ${JSON.stringify(dayPillar)}
- 시주: ${JSON.stringify(hourPillar)}
- 일간: ${dayMaster}
    `;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Cost-effective for MVP
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error('No content from OpenAI');

        const parsed = JSON.parse(content);
        return NextResponse.json(parsed);

    } catch (error: unknown) {
        console.error('AI Interpretation Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to interpret saju', details: errorMessage },
            { status: 500 }
        );
    }
}
