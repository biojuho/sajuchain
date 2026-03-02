'use client';

import { useState } from 'react';
import PaymentModalKRW from '@/components/payment/PaymentModalKRW';

export default function PremiumReportButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3 font-semibold text-white transition-all duration-200 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
                <span className="absolute inset-0 -mt-1 h-full w-full rounded-lg bg-gradient-to-b from-transparent via-transparent to-black opacity-30" />
                <span className="relative flex items-center gap-2">
                    <span>열기</span>
                    올해 운세 + 대운 보기 (990원)
                </span>
            </button>

            <PaymentModalKRW isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
