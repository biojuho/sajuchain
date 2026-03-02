import { createBrowserClient } from '@supabase/ssr'
import { getPublicSupabaseEnv } from './env';

export const createClient = () => {
    const env = getPublicSupabaseEnv();

    if (!env) {
        console.warn('Supabase credentials missing. Supabase features will be disabled.');
        return null;
    }

    return createBrowserClient(env.url, env.key);
}
