'use client';

import { useState } from 'react';

export default function PremiumReportButton() {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        const priceId = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID;
        if (!priceId) {
            alert('NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID가 설정되지 않았습니다.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priceId }),
            });

            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error || 'Checkout session creation failed');
            }

            if (!payload?.url) {
                throw new Error('Checkout URL is missing');
            }

            window.location.href = payload.url;
        } catch (error: unknown) {
            console.error('Checkout error:', error);
            alert(error instanceof Error ? error.message : '결제 세션 생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-2">
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        처리 중...
                    </>
                ) : (
                    <>
                        <span>💳</span> 프리미엄 리포트 구매 (₩5,900)
                    </>
                )}
            </span>
        </button>
    );
}
