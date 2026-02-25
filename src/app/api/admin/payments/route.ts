import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(req: NextRequest) {
    try {
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
            return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
        }

        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '') || '';
        const tokenBuf = Buffer.from(token);
        const passBuf = Buffer.from(adminPassword);
        if (tokenBuf.length !== passBuf.length || !timingSafeEqual(tokenBuf, passBuf)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: missing Supabase credentials' }, { status: 500 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const { data: payments, error } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        return NextResponse.json({ payments });
    } catch (e: unknown) {
        console.error('Admin Payments API Error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
