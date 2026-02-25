import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use Anon key if RLS allows or Service Role if not
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
    console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or OPENAI_API_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// Classic Saju Texts (Japyeong Jinjeon & Jeokcheonsu Summaries)
const documents = [
    // 1. Day Master (Il-gan)
    {
        content: "갑목(甲木)은 거목과 같다. 위로 뻗어나가려는 성질(곡직)이 강하며, 리더십과 추진력이 있다. 굽히기를 싫어하고 자존심이 세다. 적천수에 이르길 '갑목참천 탈태요화(甲木參天 脫胎要火)'라 하여, 불을 만나면 빼어난 기운을 발휘한다.",
        metadata: { category: "DayMaster", type: "甲", source: "Jeokcheonsu" }
    },
    {
        content: "을목(乙木)은 화초나 덩굴과 같다. 유연하고 적응력이 뛰어나다. 끈질긴 생명력을 지녔으며, 환경에 맞춰 변화하는 능력이 탁월하다. 갑목을 만나면 '등라계갑(藤蘿繫甲)'이라 하여 귀인의 도움을 받아 크게 성장한다.",
        metadata: { category: "DayMaster", type: "乙", source: "Japyeong" }
    },
    {
        content: "병화(丙火)는 태양과 같다. 만물을 비추는 밝음과 공명정대함이 있다. 열정적이고 급한 성격이나 뒤끝이 없다. 자신의 빛을 가리는 것을 가장 싫어한다. 임수(壬水)를 만나면 '강휘상영(江暉相映)'이라 하여 귀하게 된다.",
        metadata: { category: "DayMaster", type: "丙", source: "Jeokcheonsu" }
    },
    {
        content: "정화(丁火)는 촛불이나 별빛과 같다. 은근한 끈기와 희생정신이 있다. 집중력이 강하고 섬세하다. 어둠을 밝히는 존재로, 헌신적인 면모가 드러난다. 갑목(甲木)을 만나면 불꽃이 오래 타올라 좋다.",
        metadata: { category: "DayMaster", type: "丁", source: "Japyeong" }
    },

    // 2. Structure (Gyeok)
    {
        content: "정관격(正官格)은 바른 명예와 규율을 중시한다. 책임감이 강하고 원칙을 준수하며, 공직이나 대기업 등 안정된 조직 생활에 적합하다. 자평진전에 이르길 '정관은 형충파해를 가장 꺼린다'고 하였다.",
        metadata: { category: "Structure", type: "Jung-Gwan", source: "Japyeong" }
    },
    {
        content: "편관격(偏官格)은 권위와 투쟁심을 상징한다. 칠살(七殺)이라고도 하며, 난관을 극복하고 영웅적인 기질을 발휘한다. 식신(食神)으로 제살(制殺)하면 큰 권력을 쥐게 된다.",
        metadata: { category: "Structure", type: "Pyun-Gwan", source: "Japyeong" }
    },
    {
        content: "식신격(食神格)은 풍요와 재능을 의미한다. 낙천적이고 베푸는 것을 좋아하며, 의식주 걱정이 적다. 한 분야에 깊게 파고드는 전문가적 기질이 있다. 편인을 만나면 '도식(倒食)'이라 하여 밥그릇이 엎어지니 주의해야 한다.",
        metadata: { category: "Structure", type: "Sik-Shin", source: "Japyeong" }
    },
    {
        content: "상관격(傷官格)은 총명함과 파격적인 재능을 상징한다. 기존 질서에 도전하고 개혁하려는 성향이 강하다. 화려한 언변과 예술적 감각이 뛰어나다. 정관을 해치므로 조화가 필요하다.",
        metadata: { category: "Structure", type: "Sang-Gwan", source: "Japyeong" }
    },
    {
        content: "재격(財格)은 재물과 현실적 감각을 중시한다. 정재는 성실하고 꼼꼼한 저축형이고, 편재는 사업적 수완과 통 큰 투자를 의미한다. 신강(身强)해야 재물을 감당할 수 있다.",
        metadata: { category: "Structure", type: "Jae-Gyeok", source: "Japyeong" }
    }
];

async function generateEmbeddings() {
    console.log(`Starting ingestion of ${documents.length} documents...`);

    for (const doc of documents) {
        try {
            // 1. Generate Embedding
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: doc.content,
            });

            const embedding = embeddingResponse.data[0].embedding;

            // 2. Insert into Supabase
            const { error } = await supabase
                .from('documents')
                .insert({
                    content: doc.content,
                    metadata: doc.metadata,
                    embedding: embedding,
                });

            if (error) {
                console.error(`Error inserting document provided source ${doc.metadata.source}:`, error);
            } else {
                console.log(`Successfully ingested: ${doc.metadata.type}`);
            }
        } catch (e) {
            console.error(`Failed to process document: ${doc.metadata.type}`, e);
        }
    }
    console.log('Ingestion complete!');
}

generateEmbeddings();
