import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { JAPYEONG_KNOWLEDGE } from '../src/lib/knowledge/japyeong';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl) console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!supabaseServiceKey) console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
if (!openaiApiKey) console.error('Missing OPENAI_API_KEY');

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
    console.error('Missing environment variables, check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

async function generateEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}

async function seed() {
    console.log('🌱 Starting seeding process...');

    for (const chunk of JAPYEONG_KNOWLEDGE) {
        console.log(`Processing: ${chunk.category} - ${chunk.id}`);

        // Check if exists
        const { data: existing } = await supabase
            .from('saju_knowledge')
            .select('id')
            .eq('content', chunk.content)
            .single();

        if (existing) {
            console.log(`  - Skipped (Already exists)`);
            continue;
        }

        // Generate Embedding
        const embedding = await generateEmbedding(chunk.content);

        // Insert
        const { error } = await supabase
            .from('saju_knowledge')
            .insert({
                category: chunk.category,
                content: chunk.content,
                embedding: embedding
            });

        if (error) {
            console.error(`  - Error inserting:`, error);
        } else {
            console.log(`  - Inserted successfully`);
        }
    }

    console.log('✅ Seeding complete!');
}

seed().catch(console.error);
