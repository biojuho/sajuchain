import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const rawNext = searchParams.get('next') ?? '/'
    // Prevent open redirect: only allow relative paths
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

    if (code) {
        const supabase = await createClient()
        if (!supabase) return NextResponse.redirect(`${origin}/auth/auth-code-error`)
        
        const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && sessionData?.user) {
            // Process referral (create profile + link referrer)
            const refCode = request.cookies.get('ref_code')?.value || null;

            try {
                await fetch(`${origin}/api/referral/process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: sessionData.user.id,
                        refCode,
                    }),
                });
            } catch (e) {
                console.error('Referral process failed:', e);
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            const response = isLocalEnv
                ? NextResponse.redirect(`${origin}${next}`)
                : forwardedHost
                    ? NextResponse.redirect(`https://${forwardedHost}${next}`)
                    : NextResponse.redirect(`${origin}${next}`);

            // Clear ref_code cookie after use
            if (refCode) {
                response.cookies.delete('ref_code');
            }

            return response;
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
