'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSajuStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { trackPayment, trackUpgradeSuccess } from '@/lib/analytics';

function sanitizeReturnToPath(path: string | null): string {
    if (!path || !path.startsWith('/') || path.startsWith('//')) {
        return '/';
    }
    return path;
}

function buildRedirectTarget(returnToPath: string, resumeToken: string | null): string {
    if (!resumeToken) {
        return returnToPath;
    }

    const separator = returnToPath.includes('?') ? '&' : '?';
    return `${returnToPath}${separator}resume=${encodeURIComponent(resumeToken)}`;
}

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshEntitlement } = useSajuStore();
    const [isVerifying, setIsVerifying] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = useMemo(() => Number(searchParams.get('amount') || 0), [searchParams]);
    const resumeToken = searchParams.get('resume');
    const returnTo = sanitizeReturnToPath(searchParams.get('returnTo'));

    const redirectToAuth = useCallback(() => {
        const next = `${window.location.pathname}${window.location.search}`;
        router.replace(`/auth?next=${encodeURIComponent(next)}`);
    }, [router]);

    const confirmPayment = useCallback(async () => {
        if (!paymentKey || !orderId || !Number.isFinite(amount) || amount <= 0) {
            setErrorMessage('결제 파라미터가 올바르지 않습니다.');
            setIsVerifying(false);
            return;
        }

        try {
            const response = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentKey, orderId, amount }),
            });

            if (response.status === 401) {
                redirectToAuth();
                return;
            }

            if (!response.ok) {
                throw new Error('결제 검증에 실패했습니다.');
            }

            const data = await response.json();
            trackPayment(Number(data?.data?.totalAmount || amount));
            trackUpgradeSuccess(resumeToken || undefined);

            await refreshEntitlement();

            const target = buildRedirectTarget(returnTo, resumeToken);
            router.replace(target);
        } catch (error) {
            console.error('[PaymentSuccess] Verification error:', error);
            setErrorMessage('결제 검증 중 오류가 발생했습니다. 다시 시도해주세요.');
            setIsVerifying(false);
        }
    }, [amount, orderId, paymentKey, redirectToAuth, refreshEntitlement, resumeToken, returnTo, router]);

    useEffect(() => {
        void confirmPayment();
    }, [confirmPayment]);

    if (isVerifying) {
        return (
            <div className="space-y-4">
                <div className="text-4xl animate-spin">⏳</div>
                <h1 className="text-2xl font-bold">결제 확인 중...</h1>
                <p className="text-gray-400">잠시만 기다려주세요.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6 max-w-md w-full bg-zinc-900/50 p-8 rounded-2xl border border-white/10"
        >
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-red-400">결제 처리 오류</h1>
            <p className="text-gray-300">{errorMessage}</p>
            <button
                onClick={() => router.replace('/')}
                className="w-full py-4 rounded-xl bg-purple-600 font-bold text-white hover:bg-purple-700 transition-colors"
            >
                홈으로 이동
            </button>
        </motion.div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <Suspense fallback={<div>Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}

