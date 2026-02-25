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
                className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 overflow-hidden"
            >
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                <span className="relative flex items-center gap-2">
                    <span>💳</span> 프리미엄 리포트 구매 (₩990)
                </span>
            </button>

            <PaymentModalKRW isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
