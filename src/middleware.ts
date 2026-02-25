import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PROTECTED_ROUTES = ['/dojo', '/admin', '/payment'];

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    );
}

export async function middleware(request: NextRequest) {
    // 1. Refresh Supabase session (handles cookie rotation)
    const response = await updateSession(request);

    // 2. Store referral code in cookie if present
    const refCode = request.nextUrl.searchParams.get('ref');
    if (refCode) {
        response.cookies.set('ref_code', refCode, {
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });
    }

    // 3. Protect routes that require authentication
    const { pathname } = request.nextUrl;

    if (isProtectedRoute(pathname)) {
        const hasAuthCookie = request.cookies
            .getAll()
            .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

        if (!hasAuthCookie) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth';
            url.searchParams.set('next', pathname);
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
