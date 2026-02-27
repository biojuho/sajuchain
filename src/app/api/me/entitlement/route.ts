import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEntitlementForUser } from '@/lib/entitlement';

export async function GET() {
    try {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
        }

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const entitlement = await getEntitlementForUser(user.id);
        return NextResponse.json(entitlement);
    } catch (error) {
        console.error('[API:me/entitlement] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

