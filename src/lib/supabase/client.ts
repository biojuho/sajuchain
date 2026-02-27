import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const keyLooksLikeServiceRole = typeof key === 'string' && key.toLowerCase().includes('service_role');

    if (!url || !key) {
        console.warn('Supabase credentials missing. Supabase features will be disabled.');
        return null;
    }

    if (keyLooksLikeServiceRole) {
        console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to contain a service role key. Aborting client initialization.');
        return null;
    }

    return createBrowserClient(url, key);
}
