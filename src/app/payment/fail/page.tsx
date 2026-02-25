'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function FailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message') || '결제에 실패했습니다.';
    const code = searchParams.get('code');

    return (
        <div className="space-y-6 max-w-md w-full bg-zinc-900/50 p-8 rounded-2xl border border-red-500/20">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-2xl font-bold text-red-500">
                결제 실패
            </h1>
            <p className="text-gray-300">
                {message}
            </p>
            <div className="text-xs text-zinc-500">{code}</div>
            <button
                onClick={() => router.back()} 
                className="w-full py-4 rounded-xl bg-zinc-700 font-bold text-white hover:bg-zinc-600 transition-colors"
            >
                돌아가기
            </button>
        </div>
    );
}

export default function PaymentFailPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <Suspense fallback={<div>Loading...</div>}>
                <FailContent />
            </Suspense>
        </div>
    );
}
