import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';

// Initialize Supabase Admin Client
// REQUIRES: SUPABASE_SERVICE_ROLE_KEY to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        // 1. Simple Auth Check
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
            console.error("Server Misconfiguration: ADMIN_PASSWORD not set");
             return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
        }

        const tokenBuf = Buffer.from(token || '');
        const passBuf = Buffer.from(adminPassword);
        if (tokenBuf.length !== passBuf.length || !timingSafeEqual(tokenBuf, passBuf)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Client Check
        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase credentials");
            return NextResponse.json({
                error: 'Server Misconfiguration: Missing Supabase credentials',
                instructions: 'Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 3. Fetch Stats (parallel queries)
        const todayStr = new Date().toISOString().split('T')[0];

        const [countResult, recordsResult, todayResult] = await Promise.all([
            supabase.from('saju_history').select('*', { count: 'exact', head: true }),
            supabase.from('saju_history').select('*').order('created_at', { ascending: false }).limit(50),
            supabase.from('saju_history').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
        ]);

        if (countResult.error) throw countResult.error;
        if (recordsResult.error) throw recordsResult.error;

        const count = countResult.count;
        const records = recordsResult.data;
        const todayCount = todayResult.count;

        return NextResponse.json({
            stats: {
                totalUsers: count || 0,
                todayCount: todayCount || 0
            },
            records: records || []
        });

    } catch (e: unknown) {
        console.error('Admin API Error:', e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
