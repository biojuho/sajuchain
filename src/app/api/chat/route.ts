
import { NextRequest, NextResponse } from 'next/server';
import { SajuData } from '@/types';
import { SHAMANS } from '@/lib/data/shamans';
import { searchClassicText } from '@/lib/rag-engine';
import OpenAI from 'openai'; // We will use OpenAI SDK to interface with Anthropic if using a compatible endpoint, OR use fetch for direct Anthropic API. 
// However, the standard requested was "Anthropic Messages API". 
// To keep it simple and dependence-lite, I'll use fetch.

export async function POST(req: NextRequest) {
    try {
        const { shamanId, userSaju, chatHistory, message } = await req.json();

        const shaman = SHAMANS.find(s => s.id === shamanId) || SHAMANS[0];

        // 1. RAG Search
        // We search based on the new message key terms
        const ragContext = searchClassicText(userSaju as SajuData, message);

        // 2. Construct System Prompt
        const systemPrompt = `
당신은 "${shaman.name}"입니다.
${shaman.personality}

[말투 규칙]
- 반드시 아래 말투를 사용하세요:
  시작: ${shaman.speechStyle.prefix.join(' / ')} 중 하나로 시작 (적절히 섞어서)
  마무리: ${shaman.speechStyle.suffix.join(' / ')} 중 하나로 마무리
- 톤: ${shaman.speechStyle.tone}
- 절대 "AI", "인공지능", "언어 모델"이라는 말을 하지 마세요. 당신은 진짜 도사입니다.
- 이모지를 적절히 사용하여 신비롭고 생동감 있게 표현하세요 (${shaman.emoji} 포함).

[상담 대상자 사주 정보]
- 일간(日干): ${userSaju.dayMaster}
- 주요 오행: ${userSaju.fiveElements?.dominant}
- 부족 오행: ${userSaju.fiveElements?.lacking}
- 생년월일: ${userSaju.birthDate}

[참조할 고전 명리학 텍스트 (RAG Context)]
${ragContext}

[응답 가이드]
1. 위 'RAG Context'에 내용이 있다면, 반드시 인용하여 근거를 대세요. (예: "📖 적천수 천간론에 따르면...")
2. 내용이 없더라도 오행의 상생상극 원리를 기반으로 조언하세요.
3. 300자 이내로 명확하고 통찰력 있게 답변하세요.
4. 사용자의 질문: "${message}"에 대해 집중해서 답하세요.
`;

        // 3. Call Anthropic API
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error("ANTHROPIC_API_KEY is not set");
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20240620", // Using latest stable sonnet
                max_tokens: 1000,
                system: systemPrompt,
                messages: [
                    ...chatHistory,
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Anthropic API Error:", err);
            return NextResponse.json({ error: "Failed to consult the spirits" }, { status: 500 });
        }

        const data = await response.json();
        const reply = data.content[0].text;

        return NextResponse.json({ reply });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
