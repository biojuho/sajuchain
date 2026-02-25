'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSajuStore } from '@/lib/store';
import { motion } from 'framer-motion';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setPremium } = useSajuStore();
    const [isVerifying, setIsVerifying] = useState(true);

    const confirmPayment = React.useCallback(async (paymentKey: string, orderId: string, amount: number) => {
        try {
            console.log(`Verifying payment: Key=${paymentKey}, Order=${orderId}, Amount=${amount}`);
            const response = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentKey, orderId, amount }),
            });

            if (!response.ok) {
                throw new Error('Payment verification failed');
            }

            const data = await response.json();
            console.log('Payment verified:', data);

            setPremium(true);
            setIsVerifying(false);
        } catch (error) {
            console.error(error);
            setIsVerifying(false);
        }
    }, [setPremium]);

    useEffect(() => {
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');

        if (paymentKey && orderId && amount) {
            // Verify payment on server side ideally.
            // For MVP client-side verification simulation:
            confirmPayment(paymentKey, orderId, Number(amount));
        } else {
            // Handle invalid access
            setTimeout(() => setIsVerifying(false), 0);
        }
    }, [searchParams, confirmPayment]);

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
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                결제 성공!
            </h1>
            <p className="text-gray-300">
                축하합니다! 프리미엄 기능이 해제되었습니다.<br />
                이제 모든 운세를 확인하실 수 있습니다.
            </p>
            <button
                onClick={() => router.push('/result')} // Assuming /result is where they came from or main result page
                className="w-full py-4 rounded-xl bg-purple-600 font-bold text-white hover:bg-purple-700 transition-colors"
            >
                운세 확인하러 가기
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
